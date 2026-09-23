#!/usr/bin/env bun
/**
 * Regenerates every file in src/example-data from the seeds in this file.
 *
 *   bun bin/gen-examples.ts           write the corpus
 *   bun bin/gen-examples.ts --check   verify the committed corpus, write nothing
 *
 * Nothing in the corpus is hand-written, and every step the reference
 * implementation covers is performed by the reference implementation. The
 * @did-btcr2/api SDK is the entry point. @did-btcr2/smt builds the Sparse Merkle
 * Tree, which the SDK does not expose. Every proof is verified and every hash is
 * recomputed before anything is written, so a run that succeeds has verified the corpus
 * rather than just serialized it. Where the implementation has not caught up to
 * the specification, the specification wins and the difference is marked GAP.
 * There are two. GAP 2 is one theme, the order of JSON properties, and it
 * appears at three sites. JCS sorts member names, so property order never
 * changes a hash; the reorder only makes the committed files read in the order
 * the specification lists.
 *
 * Runs are reproducible: secret keys are SHA-256 of their seed string and BIP340
 * aux_rand is SHA-256 of a per-signature label. Changing either changes every
 * proofValue in the corpus, so leave them pinned.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

// The SDK facade has no offline call for the update operation: `DidMethodApi.update`
// and `UpdateBuilder.execute` both broadcast a Bitcoin transaction, and this corpus
// is not anchored to a chain. Thus the script uses the classes that the SDK
// re-exports for the update, the Beacon Services, and the root capability.
import type { DidVerificationMethod, PatchOperation, SchnorrKeyPair, Signer, SigningScheme } from '@did-btcr2/api';
import {
  Appendix,
  BeaconUtils,
  buildGenesisDocument,
  canonicalHash,
  createApi,
  DidDocument,
  GenesisDocument,
  IdentifierTypes,
  JSONPatch,
  Updater,
} from '@did-btcr2/api';
import {
  base64UrlToHash,
  didToIndex,
  generateZeroHashProof,
  hashToBase64Url,
  leafValue,
  serializeProof,
  verifyProof,
  zeroHashRoot,
} from '@did-btcr2/smt';
import { schnorr } from '@noble/curves/secp256k1';

const EXAMPLES = new URL('../src/example-data/', import.meta.url).pathname;

/** No Bitcoin or CAS config: every sub-facade this script touches is offline. */
const api = createApi();

/** Every identifier in the corpus is on mutinynet (network_value 5, Table 1). */
const NETWORK = 'mutinynet';
const BTCR2_VERSION_NUMBER = 1;

/** Placeholder identifier of a Genesis Document. */
const PLACEHOLDER = 'did:btcr2:_';

/**
 * Secret key seeds. The key material is worthless by construction: anyone can
 * recompute these keys from the strings, which is the point for an example corpus.
 */
const SEEDS = {
  key0: 'did:btcr2 example corpus / controller / key-0',
  key1: 'did:btcr2 example corpus / controller / key-1',
  casAggregator: 'did:btcr2 example corpus / CAS aggregator',
  smtAggregator: 'did:btcr2 example corpus / SMT aggregator',
  keyBased: 'did:btcr2 example corpus / key-based identifier',
  cohortA: 'did:btcr2 example corpus / cohort member A',
  cohortB: 'did:btcr2 example corpus / cohort member B',
} as const;

/** SMT nonces, one per index per signal. */
const NONCE_SEEDS = {
  primary: 'did:btcr2 example corpus / SMT nonce / controller',
  cohortA: 'did:btcr2 example corpus / SMT nonce / cohort member A',
  cohortB: 'did:btcr2 example corpus / SMT nonce / cohort member B',
  cohortBSignalB: 'did:btcr2 example corpus / SMT nonce / cohort member B / signal B',
} as const;

/**
 * Bitcoin block metadata. The corpus is not anchored to a real chain, so these
 * illustrate the shape of resolution output rather than describing real blocks.
 */
const LAST_UPDATE_TIME = '2025-01-06T16:23:10Z';
const CONFIRMATIONS = 12;

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

type Json = any;

const sha256 = (text: string) => new Uint8Array(createHash('sha256').update(text, 'utf8').digest());

const seedKey = (seed: string) => api.crypto.keypair.fromSecret(sha256(seed));

/**
 * Fails unless two objects are the same JSON document. The comparison ignores
 * key order, as JCS does, which is what separates a corpus that disagrees with
 * the implementation from one that only serializes differently.
 */
function agree(what: string, produced: Json, emitted: Json): void {
  const implementation = JSON.stringify(produced);
  const corpus = JSON.stringify(emitted);
  if (!isDeepStrictEqual(JSON.parse(implementation), JSON.parse(corpus))) {
    throw new Error(
      `${what}: the implementation and the corpus disagree\n`
      + `  implementation: ${implementation}\n`
      + `  corpus:         ${corpus}`,
    );
  }
}

/** Fills a `{{variable}}` template and parses the result, as the operations do. */
function render(templateFile: string, vars: Record<string, string>): Json {
  const template = readFileSync(join(EXAMPLES, templateFile), 'utf8');
  const filled = template.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, name: string) => {
    if (!(name in vars)) throw new Error(`${templateFile}: no value for {{${name}}}`);
    return vars[name];
  });
  return JSON.parse(filled);
}

/**
 * GAP 1. `LocalSigner` and `SchnorrMultikey` both draw random `aux_rand` for a
 * BIP340 signature, which a reproducible corpus cannot use. `Signer` is the
 * published seam for exactly this: the update path depends on the interface and
 * never on secret key bytes, so a signer that pins `aux_rand` to a label drops
 * into `Updater.sign` with nothing else changed.
 */
class PinnedSigner implements Signer {
  readonly publicKey: Uint8Array;
  readonly #secretKey: Uint8Array;
  readonly #auxRand: Uint8Array;

  constructor(keyPair: SchnorrKeyPair, label: string) {
    this.publicKey = keyPair.publicKey.compressed;
    this.#secretKey = keyPair.secretKey.bytes;
    this.#auxRand = sha256(`did:btcr2 example corpus / aux_rand / ${label}`);
  }

  sign(data: Uint8Array, scheme: SigningScheme): Uint8Array {
    if (scheme !== 'bip340') {
      throw new Error(`PinnedSigner signs Data Integrity proofs only, not "${scheme}"`);
    }
    return schnorr.sign(data, this.#secretKey, this.#auxRand);
  }
}

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

const keys = Object.fromEntries(
  Object.entries(SEEDS).map(([name, seed]) => [name, seedKey(seed)]),
) as Record<keyof typeof SEEDS, SchnorrKeyPair>;

// ---------------------------------------------------------------------------
// Genesis Document and the identifier derived from it
// ---------------------------------------------------------------------------

/**
 * The implementation builds the Genesis Document and derives each Beacon
 * address. Each aggregate Beacon has the address of a different aggregator key.
 */
const builtGenesisDocument = buildGenesisDocument({
  network: NETWORK,
  verificationMethods: [
    { publicKey: keys.key0.publicKey.compressed, relationships: ['assertionMethod', 'capabilityInvocation'] },
  ],
  beacons: [
    { type: 'SingletonBeacon', publicKey: keys.key0.publicKey.compressed, addressType: 'p2wpkh' },
    { type: 'CASBeacon', publicKey: keys.casAggregator.publicKey.compressed, addressType: 'p2tr' },
    { type: 'SMTBeacon', publicKey: keys.smtAggregator.publicKey.compressed, addressType: 'p2tr' },
  ],
});

/** GAP 2 (property order). The specification lists `@context` before `id`. */
const { '@context': genesisContext, ...genesisProperties } = builtGenesisDocument;
const genesisDocument: Json = { '@context': genesisContext, ...genesisProperties };
agree('Genesis Document', builtGenesisDocument, genesisDocument);

/** The implementation validates the Genesis Document and reduces it to genesis bytes. */
const genesis = GenesisDocument.fromJSON(structuredClone(genesisDocument));
const genesisBytes = GenesisDocument.toGenesisBytes(genesis);
agree('genesis bytes', { hash: canonicalHash(genesisDocument) }, { hash: hashToBase64Url(genesisBytes) });

/** An `x` HRP identifier commits to the Genesis Document hash. */
const did = api.did.encode(genesisBytes, {
  idType: IdentifierTypes.EXTERNAL,
  version: BTCR2_VERSION_NUMBER,
  network: NETWORK,
});

/** Resolution replaces the placeholder to establish version 1 of the document. */
const initialDocument: Json = JSON.parse(
  JSON.stringify(genesisDocument).replaceAll(PLACEHOLDER, did),
);
agree('version 1 document', genesis.toDidDocument(did), initialDocument);
DidDocument.isValid(initialDocument);

/** GAP 2 (property order). The specification lists `invocationTarget` before `controller`. */
const derivedCapability = Appendix.deriveRootCapability(did);
const rootCapability = {
  '@context': derivedCapability['@context'],
  id: derivedCapability.id,
  invocationTarget: derivedCapability.invocationTarget,
  controller: derivedCapability.controller,
};
agree('root capability', derivedCapability, rootCapability);

// ---------------------------------------------------------------------------
// Updates
// ---------------------------------------------------------------------------

interface Update {
  unsigned: Json;
  signed: Json;
  config: Json;
  hash: string;
  target: Json;
}

/**
 * Builds one update. `Updater.construct` applies the patch, validates the target
 * document, and computes both document hashes; `Updater.sign` checks the
 * verification method against the signing key and produces the Data Integrity
 * proof. The corpus files are rendered from the specification's own templates and
 * every field is compared against what the implementation produced.
 *
 * These two statics are what `@did-btcr2/api` calls. The api layer itself cannot
 * be used here: `DidMethodApi.update` and `UpdateBuilder.execute` broadcast a
 * Bitcoin transaction, and this corpus is not anchored to a chain. When an offline
 * update path lands, these are the only two lines that have to move.
 */
function buildUpdate(
  controller: string,
  source: Json,
  patch: PatchOperation[],
  sourceVersionId: number,
  keyPair: SchnorrKeyPair,
  verificationMethod: DidVerificationMethod,
  label: string,
): Update {
  const constructed = Updater.construct(source, patch, sourceVersionId);
  const target = JSONPatch.apply(source, patch);

  const unsigned = render('btcr2-unsigned-update-template.hbs', {
    'array-of-patches': JSON.stringify(constructed.patch),
    'source-hash': constructed.sourceHash,
    'target-hash': constructed.targetHash,
    'target-version-id': String(constructed.targetVersionId),
  });
  agree(`update ${label}`, constructed, unsigned);
  agree(`target document ${label}`, { hash: canonicalHash(target) }, { hash: unsigned.targetHash });

  const signer = new PinnedSigner(keyPair, label);
  const produced = Updater.sign(controller, structuredClone(unsigned), verificationMethod, signer);
  const { proofValue, ...producedConfig } = produced.proof;

  /** GAP 2 (property order). The same proof configuration, in the order the specification documents. */
  const config = render('data-integrity-config.hbs', {
    'verification-method': verificationMethod.id,
    capability: `urn:zcap:root:${encodeURIComponent(controller)}`,
  });
  agree(`proof config ${label}`, producedConfig, config);

  const signed = { ...unsigned, proof: { ...config, proofValue } };

  // Verify the object that is written, not the object that was signed, so that a
  // reordering mistake in the step above cannot produce a corpus that fails to verify.
  const suite = api.crypto.cryptosuite.create(api.crypto.multikey.fromVerificationMethod(verificationMethod));
  if (!api.crypto.cryptosuite.verifyProof(structuredClone(signed), suite).verified) {
    throw new Error(`proof for ${label} failed verification`);
  }

  return { unsigned, signed, config, hash: canonicalHash(signed), target };
}

const key0Method: DidVerificationMethod = {
  id: `${did}#key-0`,
  type: 'Multikey',
  controller: did,
  publicKeyMultibase: keys.key0.publicKey.multibase.encoded,
};
const key1Reference = `${did}#key-1`;

/** The implementation derives the Singleton Beacon of key-1 from a key identifier of key-1. */
const key1Beacon = BeaconUtils.createBeaconService(
  api.did.encode(keys.key1.publicKey.compressed, {
    idType: IdentifierTypes.KEY,
    version: BTCR2_VERSION_NUMBER,
    network: NETWORK,
  }),
  'p2wpkh',
  'SingletonBeacon',
);

/** Update 2: add a second key. Announced by the Singleton Beacon. */
const update2 = buildUpdate(
  did,
  initialDocument,
  [
    {
      op: 'add',
      path: '/verificationMethod/1',
      value: {
        id: key1Reference,
        type: 'Multikey',
        controller: did,
        publicKeyMultibase: keys.key1.publicKey.multibase.encoded,
      },
    },
    { op: 'add', path: '/authentication', value: [key1Reference] },
  ],
  1,
  keys.key0,
  key0Method,
  'update-2',
);

/** Update 3: add a fourth Beacon. Announced by the CAS Beacon. */
const update3 = buildUpdate(
  did,
  update2.target,
  [
    {
      op: 'add',
      path: '/service/3',
      value: {
        id: `${did}#service-3`,
        type: 'SingletonBeacon',
        serviceEndpoint: key1Beacon.serviceEndpoint,
      },
    },
  ],
  2,
  keys.key0,
  key0Method,
  'update-3',
);

/** Update 4: rotate the update authorization to the second key. Announced by the SMT Beacon. */
const update4 = buildUpdate(
  did,
  update3.target,
  [{ op: 'replace', path: '/capabilityInvocation', value: [key1Reference] }],
  3,
  keys.key0,
  key0Method,
  'update-4',
);

// ---------------------------------------------------------------------------
// Two more identifiers, so the aggregate examples carry real hashes
// ---------------------------------------------------------------------------

/** A key-based identifier and the document that is deterministically generated from it. */
function keyBased(keyPair: SchnorrKeyPair) {
  const id = api.did.encode(keyPair.publicKey.compressed, {
    idType: IdentifierTypes.KEY,
    version: BTCR2_VERSION_NUMBER,
    network: NETWORK,
  });

  // The implementation derives the three default Beacon Services of a `k` identifier.
  const services = BeaconUtils.createBeaconServices(id, 'SingletonBeacon');
  const document = render('key-based-initial-did-document-template.hbs', {
    did: id,
    'public-key-multikey': keyPair.publicKey.multibase.encoded,
    'p2pkh-bitcoin-address': services[0].serviceEndpoint as string,
    'p2wpkh-bitcoin-address': services[1].serviceEndpoint as string,
    'p2tr-bitcoin-address': services[2].serviceEndpoint as string,
  });
  agree(`Beacon Services of ${id}`, services, document.service);
  DidDocument.isValid(document);

  return { did: id, document };
}

const keyBasedIdentifier = keyBased(keys.keyBased);
const cohortA = keyBased(keys.cohortA);
const cohortB = keyBased(keys.cohortB);

/** One update each, so their announcement entries are real update hashes. */
const cohortUpdate = (member: { did: string; document: Json }, keyPair: SchnorrKeyPair, label: string) =>
  buildUpdate(
    member.did,
    member.document,
    [{ op: 'remove', path: '/capabilityDelegation' }],
    1,
    keyPair,
    {
      id: `${member.did}#initialKey`,
      type: 'Multikey',
      controller: member.did,
      publicKeyMultibase: keyPair.publicKey.multibase.encoded,
    },
    label,
  );

const cohortAUpdate = cohortUpdate(cohortA, keys.cohortA, 'cohort-a');
const cohortBUpdate = cohortUpdate(cohortB, keys.cohortB, 'cohort-b');

/**
 * A CAS Announcement maps each DID in the cohort to its update hash. `CASBeacon`
 * assembles this during a broadcast, which needs a funded Beacon address, so the
 * mapping is assembled here from the same `canonicalHash` the Beacon uses.
 */
const casAnnouncement = {
  [did]: update3.hash,
  [cohortA.did]: cohortAUpdate.hash,
  [cohortB.did]: cohortBUpdate.hash,
};

// ---------------------------------------------------------------------------
// Sparse Merkle Tree
// ---------------------------------------------------------------------------

const nonces = Object.fromEntries(
  Object.entries(NONCE_SEEDS).map(([name, seed]) => [name, sha256(seed)]),
) as Record<keyof typeof NONCE_SEEDS, Uint8Array>;

type Submission = { did: string; nonce?: Uint8Array; updateId?: Uint8Array };

/** Builds the tree for one signal and serializes the proof of `did`. */
function smtProof(signal: Submission[], did: string) {
  const leaves = signal
    .filter((s) => s.nonce || s.updateId)
    .map((s) => ({ index: didToIndex(s.did), leaf: leafValue(s.nonce, s.updateId) }));
  const own = signal.find((s) => s.did === did);
  const proof = serializeProof(
    zeroHashRoot(leaves),
    generateZeroHashProof(leaves, didToIndex(did)),
    { nonce: own?.nonce, updateId: own?.updateId },
  );
  if (!verifyProof(proof, did)) throw new Error(`generated SMT proof for ${did} failed verification`);
  return proof;
}

/** Signal A: update 4 for the primary identifier in nonce mode, nonce non-updates for the rest. */
const signalA: Submission[] = [
  { did, nonce: nonces.primary, updateId: base64UrlToHash(update4.hash) },
  { did: cohortA.did, nonce: nonces.cohortA },
  { did: cohortB.did, nonce: nonces.cohortB },
];

/**
 * Signal B, in a later block: the primary identifier submits nothing in no-nonce
 * mode, so its index is empty and its proof carries neither `nonce` nor `updateId`.
 * Cohort member A announces an update in no-nonce mode, and cohort member B keeps a
 * nonce non-update. Together the two signals exercise all four leaf arms.
 */
const signalB: Submission[] = [
  { did: cohortA.did, updateId: base64UrlToHash(cohortAUpdate.hash) },
  { did: cohortB.did, nonce: nonces.cohortBSignalB },
];

const smtProofA = smtProof(signalA, did);
const smtProofB = smtProof(signalB, did);

if (smtProofA.updateId !== update4.hash) {
  throw new Error('the SMT leaf does not commit to the hash of update 4');
}
if (smtProofB.nonce !== undefined || smtProofB.updateId !== undefined) {
  throw new Error('the empty-index proof must carry neither nonce nor updateId');
}

// ---------------------------------------------------------------------------
// Sidecar and resolution
// ---------------------------------------------------------------------------

const sidecarData = {
  '@context': 'https://btcr2.dev/context/v1',
  genesisDocument,
  updates: [update2.signed, update3.signed, update4.signed],
  casUpdates: [casAnnouncement],
  smtProofs: [smtProofA, smtProofB],
};

const resolutionOptions = {
  versionId: '4',
  minConf: 6,
  sidecar: sidecarData,
};

const didDocumentMetadata = {
  confirmations: CONFIRMATIONS,
  deactivated: false,
  updated: LAST_UPDATE_TIME,
  versionId: '4',
};

const didResolutionMetadata = { contentType: 'application/did' };

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

const corpus: Record<string, Json> = {
  'genesis-document.json': genesisDocument,
  'initial-did-document.json': keyBasedIdentifier.document,
  'btcr2-unsigned-update.json': update2.unsigned,
  'btcr2-signed-update.json': update2.signed,
  'data-integrity-config.json': update2.config,
  'data-integrity-proof.json': update2.signed.proof,
  'cas-announcement.json': casAnnouncement,
  'root-capability.json': rootCapability,
  'sidecar-data.json': sidecarData,
  'sidecar-smt-proof.json': smtProofA,
  'sidecar-smt-proof-empty.json': smtProofB,
  'resolution-options.json': resolutionOptions,
  'did-document-metadata.json': didDocumentMetadata,
  'did-resolution-metadata.json': didResolutionMetadata,
};

/** Recomputes every hash in the corpus from the documents it ships alongside. */
function selfCheck(): void {
  const context = render('btcr2-unsigned-update-template.hbs', {
    'array-of-patches': '[]',
    'source-hash': '',
    'target-hash': '',
    'target-version-id': '0',
  })['@context'];

  const chain = [
    { update: update2, source: initialDocument },
    { update: update3, source: update2.target },
    { update: update4, source: update3.target },
  ];
  for (const { update, source } of chain) {
    if (update.signed.sourceHash !== canonicalHash(source)) {
      throw new Error(`sourceHash mismatch on update ${update.signed.targetVersionId}`);
    }
    if (update.signed.targetHash !== canonicalHash(update.target)) {
      throw new Error(`targetHash mismatch on update ${update.signed.targetVersionId}`);
    }
    if (JSON.stringify(update.signed['@context']) !== JSON.stringify(context)) {
      throw new Error(`@context mismatch on update ${update.signed.targetVersionId}`);
    }
    if (JSON.stringify(update.signed.proof['@context']) !== JSON.stringify(context)) {
      throw new Error(`proof @context mismatch on update ${update.signed.targetVersionId}`);
    }
  }
  if (api.did.decode(did).idType !== IdentifierTypes.EXTERNAL) {
    throw new Error('the primary identifier is not an external identifier');
  }
  if (hashToBase64Url(api.did.decode(did).genesisBytes) !== canonicalHash(genesisDocument)) {
    throw new Error('identifier does not commit to the Genesis Document');
  }
  if (casAnnouncement[did] !== update3.hash) {
    throw new Error('CAS Announcement does not carry the update hash');
  }
}

selfCheck();

const check = process.argv.includes('--check');
let failures = 0;

for (const [name, document] of Object.entries(corpus)) {
  const path = join(EXAMPLES, name);
  const serialized = `${JSON.stringify(document, null, 2)}\n`;
  if (check) {
    const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
    if (current !== serialized) {
      console.error(`differs: ${name}`);
      failures++;
    }
  } else {
    writeFileSync(path, serialized);
  }
}

if (check) {
  console.log(failures === 0 ? `${Object.keys(corpus).length} files match` : `${failures} file(s) differ`);
  process.exit(failures === 0 ? 0 : 1);
}

console.log(`wrote ${Object.keys(corpus).length} files to src/example-data`);
console.log(`  identifier: ${did}`);
console.log(`  key-based:  ${keyBasedIdentifier.did}`);
