#!/usr/bin/env bun
/**
 * Expands every example that declares the did:btcr2 JSON-LD context and fails
 * if any term is dropped.
 *
 *   bun check-context.mjs     run from bin/
 *   node check-context.mjs    the same check under Node
 *
 * Expansion runs jsonld.js in safe mode, which throws when a term has no
 * definition, so "no term dropped" is a pass/fail result. The document loader
 * serves five contexts from local files and throws on any other URL, so the
 * check never touches the network.
 *
 * PINNED below lists the copies in contexts/: the URL the examples name, the
 * file, where the bytes came from, the date they were fetched, and their
 * SHA-256. Each copy must match its recorded SHA-256. When
 * ../src/data-structures.md exists (in the specification repository), it must
 * contain the SHA-256 of ../src/context/v1.jsonld.
 *
 * Cases: every src/example-data/*.json that has an @context, which must name
 * the btcr2 context unless the file is listed in NOT_BTCR2; the sidecar in
 * resolution-options.json (resolution options are not JSON-LD); the genesis
 * document and each update inside a sidecar, on their own; every .hbs
 * template, rendered with the corpus's own values; and a DID document with
 * "deactivated": true, which no example carries. The vocabulary in
 * src/context/ns.jsonld must expand, convert to RDF in the default graph, and
 * describe every term the context mints. No btcr2 term may share a name with a
 * term of another pinned context, including terms in its scoped contexts at any
 * depth. Negative controls remove one term from the
 * context and require expansion to fail with an error that names that term.
 *
 * Safe mode cannot see inside @json literals (patch and the four Sidecar Data
 * fields), and it does not flag a key that is already an absolute IRI, such as
 * a DID.
 *
 * EXAMPLES overrides the example directory (default ../src/example-data/).
 */

import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import jsonld from 'jsonld';

const PINNED = [
  {
    url: 'https://www.w3.org/ns/did/v1.1',
    file: 'did-v1.1rc1.jsonld',
    from: 'https://www.w3.org/ns/did/v1.1rc1',
    fetched: '2026-09-27',
    sha256: 'ea216ecc1cb02cd39b693dba2250141e270ba0bf95890be107dd9a9e8e43de85',
  },
  {
    // The 2019 version at the head of that repository. Which bytes the
    // specification means by this URL is open with its editors; if they choose
    // other bytes, this entry and the file change.
    url: 'https://w3id.org/json-ld-patch/v1',
    file: 'json-ld-patch-v1-2faef4cf.jsonld',
    from: 'https://github.com/web-payments/web-payments.org/blob/2faef4cfaada1f5dbcadb27440e637186074eaf2/contexts/json-ld-patch-v1.jsonld',
    fetched: '2026-09-27',
    sha256: '6816e2fc63a8a345e979508d0bf5e719a5694d0c59fac01c5c216cf3b36b5a5e',
  },
  {
    url: 'https://w3id.org/zcap/v1',
    file: 'zcap-v1.jsonld',
    from: 'https://w3c-ccg.github.io/zcap-spec/latest/contexts/zcap-v1.jsonld',
    fetched: '2026-09-27',
    sha256: '4c0bd364bf3a5215779c0b636e14bcdf1d6818dae002bc7580237bcf8d2a72e0',
  },
  {
    url: 'https://w3id.org/security/data-integrity/v2',
    file: 'data-integrity-v2.jsonld',
    from: 'https://www.w3.org/2025/credentials/vcdi/context/v2.jsonld',
    fetched: '2026-09-27',
    sha256: '67f21e6e33a6c14e5ccfd2fc7865f7474fb71a04af7e94136cb399dfac8ae8f4',
  },
];

const BTCR2 = 'https://btcr2.dev/context/v1';
const NS = 'https://btcr2.dev/ns#';
const fromHere = p => fileURLToPath(new URL(p, import.meta.url));
const EXAMPLES = process.env.EXAMPLES ?? fromHere('../src/example-data/');
if (!existsSync(EXAMPLES)) {
  console.error(`no example directory at ${EXAMPLES}; set EXAMPLES to the src/example-data directory of a did-btcr2 checkout`);
  process.exit(2);
}
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const example = file => readJson(join(EXAMPLES, file));

const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const CONTEXT_FILE = fromHere('../src/context/v1.jsonld');
const SPEC_FILE = fromHere('../src/data-structures.md');

const contexts = {
  ...Object.fromEntries(PINNED.map(p => [p.url, readJson(fromHere(`contexts/${p.file}`))])),
  [BTCR2]: readJson(CONTEXT_FILE),
};
const vocab = readJson(fromHere('../src/context/ns.jsonld'));

function loaderFor(map) {
  return async url => {
    if (!(url in map)) throw new Error(`no local copy of ${url}; the check never fetches`);
    return {contextUrl: null, documentUrl: url, document: structuredClone(map[url])};
  };
}
const options = map => ({safe: true, documentLoader: loaderFor(map)});
const expand = (doc, map = contexts) => jsonld.expand(doc, options(map));

function render(file, vars) {
  const template = readFileSync(join(EXAMPLES, file), 'utf8');
  return JSON.parse(template.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in vars)) throw new Error(`${file}: no value for {{${name}}}`);
    return vars[name];
  }));
}

const text = v => { try { return JSON.stringify(v) ?? ''; } catch { return String(v); } };
const why = e => [e.message, e.details?.event?.code ?? e.details?.code ?? '',
  text(e.details?.event?.details ?? '').slice(0, 300)].join(' ');
const names = (e, term) =>
  [e.message, text(e.details?.event?.details ?? e.details ?? '')].join(' ').includes(term);
let failures = 0;
const ok = msg => console.log(`ok   ${msg}`);
const fail = msg => { failures++; console.log(`FAIL ${msg}`); };

for (const p of PINNED) {
  const got = sha256(fromHere(`contexts/${p.file}`));
  if (got === p.sha256) ok(`contexts/${p.file} matches its pinned SHA-256`);
  else fail(`contexts/${p.file}: SHA-256 ${got}, pinned ${p.sha256}`);
}
const contextDigest = sha256(CONTEXT_FILE);
if (!existsSync(SPEC_FILE)) {
  console.log(`note src/data-structures.md not found; not checking that it states ${contextDigest}`);
} else if (readFileSync(SPEC_FILE, 'utf8').includes(contextDigest)) {
  ok(`src/data-structures.md states the SHA-256 of src/context/v1.jsonld (${contextDigest})`);
} else {
  fail(`src/data-structures.md does not state the SHA-256 of src/context/v1.jsonld (${contextDigest})`);
}

// An example with an @context must name the btcr2 context, unless it is listed
// here. Examples without an @context are not JSON-LD and are not expanded.
const NOT_BTCR2 = ['root-capability.json'];
// Examples that are not JSON-LD themselves but carry a JSON-LD document.
const CARRIERS = {'resolution-options.json': 'sidecar'};

const contextUrls = doc => [doc['@context']].flat().filter(c => typeof c === 'string');
const cases = [];
for (const file of readdirSync(EXAMPLES).sort()) {
  if (!file.endsWith('.json')) continue;
  let doc = example(file);
  let name = file;
  if (file in CARRIERS) {
    doc = doc[CARRIERS[file]];
    name = `${file} .${CARRIERS[file]}`;
    if (doc === undefined) { fail(`${name}: missing`); continue; }
  }
  if (doc['@context'] === undefined) continue;
  const namesBtcr2 = contextUrls(doc).includes(BTCR2);
  if (NOT_BTCR2.includes(file)) {
    if (namesBtcr2) fail(`${name}: names ${BTCR2}; remove it from NOT_BTCR2`);
    continue;
  }
  if (!namesBtcr2) { fail(`${name}: @context does not name ${BTCR2}`); continue; }
  cases.push([name, doc]);
  // Sidecar Data fields are JSON literals, so expanding the sidecar does not
  // reach the genesis document and updates it carries; each is expanded on its own.
  const carried = [];
  if (doc.genesisDocument !== undefined) carried.push([`${name} .genesisDocument`, doc.genesisDocument]);
  for (const [i, update] of (doc.updates ?? []).entries()) carried.push([`${name} .updates[${i}]`, update]);
  for (const [inner, innerDoc] of carried) {
    if (contextUrls(innerDoc).includes(BTCR2)) cases.push([inner, innerDoc]);
    else fail(`${inner}: @context does not name ${BTCR2}`);
  }
}

const initial = example('initial-did-document.json');
const signed = example('btcr2-signed-update.json');
const templateVars = {
  'btcr2-unsigned-update-template.hbs': {
    'array-of-patches': JSON.stringify(signed.patch),
    'source-hash': signed.sourceHash,
    'target-hash': signed.targetHash,
    'target-version-id': String(signed.targetVersionId),
  },
  'data-integrity-config.hbs': {
    'verification-method': signed.proof.verificationMethod,
    'capability': signed.proof.capability,
  },
  'key-based-initial-did-document-template.hbs': {
    'did': initial.id,
    'public-key-multikey': initial.verificationMethod[0].publicKeyMultibase,
    'p2pkh-bitcoin-address': initial.service[0].serviceEndpoint,
    'p2wpkh-bitcoin-address': initial.service[1].serviceEndpoint,
    'p2tr-bitcoin-address': initial.service[2].serviceEndpoint,
  },
};
for (const file of readdirSync(EXAMPLES).sort()) {
  if (!file.endsWith('.hbs')) continue;
  if (!(file in templateVars)) throw new Error(`new template ${file}: add its values to the check`);
  cases.push([`${file} (rendered)`, render(file, templateVars[file])]);
}
const deactivated = {...initial, deactivated: true};
cases.push(['deactivated DID document', deactivated]);

for (const [name, doc] of cases) {
  try { await expand(doc); ok(name); } catch (e) { fail(`${name}: ${why(e)}`); }
}

// Every term a context defines, including those in property- and type-scoped
// contexts at any depth. A scoped context that is a URL is not followed, so it
// fails rather than hide the terms it would add.
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
function termsIn(ctx, where, into = new Set()) {
  for (const c of [ctx].flat()) {
    if (c === null) continue;
    if (!isObject(c)) { fail(`${where}: scoped context ${text(c)} is not an object`); continue; }
    for (const [term, def] of Object.entries(c)) {
      if (term.startsWith('@')) continue;
      into.add(term);
      if (isObject(def) && '@context' in def) termsIn(def['@context'], `${where} ${term}`, into);
    }
  }
  return into;
}
for (const [url, ctx] of Object.entries(contexts)) {
  if (!isObject(ctx['@context'])) fail(`${url}: @context is not a plain object`);
}
const btcr2Terms = Object.keys(contexts[BTCR2]['@context'])
  .filter(t => !t.startsWith('@') && t !== 'id' && t !== 'type');
for (const [url, ctx] of Object.entries(contexts)) {
  if (url === BTCR2 || !isObject(ctx['@context'])) continue;
  const theirs = termsIn(ctx['@context'], url);
  for (const t of btcr2Terms) if (theirs.has(t)) fail(`${t} is already defined by ${url}`);
}

try {
  const quads = await jsonld.toRDF(vocab, options(contexts));
  const named = quads.filter(q => q.graph.termType !== 'DefaultGraph');
  if (named.length) fail(`vocabulary: ${named.length} triple(s) in a named graph`);
  else ok(`vocabulary converts to RDF in the default graph (${quads.length} triples)`);
  const described = new Set((await expand(vocab)).map(node => node['@id']));
  const minted = btcr2Terms.map(t => contexts[BTCR2]['@context'][t]['@id']).filter(i => i.startsWith(NS));
  const missing = minted.filter(i => !described.has(i));
  const extra = [...described].filter(i => i.startsWith(NS) && !minted.includes(i));
  if (missing.length || extra.length) {
    fail(`vocabulary: missing ${missing.join(', ') || 'none'}; extra ${extra.join(', ') || 'none'}`);
  } else {
    ok(`vocabulary describes all ${minted.length} terms the context mints`);
  }
} catch (e) {
  fail(`vocabulary: ${why(e)}`);
}

const negatives = [
  ['deactivated', deactivated],
  ['SingletonBeacon', initial],
  ['targetVersionId', signed],
  ['smtProofs', example('sidecar-data.json')],
];
for (const [term, doc] of negatives) {
  const ctx = structuredClone(contexts[BTCR2]);
  delete ctx['@context'][term];
  try {
    await expand(doc, {...contexts, [BTCR2]: ctx});
    fail(`negative control without ${term}: expansion passed`);
  } catch (e) {
    if (names(e, term)) ok(`negative control without ${term}: ${e.details?.event?.code ?? e.message} (${term})`);
    else fail(`negative control without ${term}: failed, but not on ${term}: ${why(e)}`);
  }
}

if (failures) {
  console.log(`${failures} failure(s)`);
  process.exit(1);
}
console.log('all examples expand with no term dropped');
