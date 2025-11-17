{% import "includes/ui.tera" as ui %}
{% import "includes/links.tera" as links %}

{{ links::include() }}


# Data Structures

For the purposes of interoperability, this specification defines data structures using the data
model defined by the DID core v1.1 specification {{#cite DID-CORE}}.

Concrete representations of these data structures MUST conform to the JSON-LD 1.1 specification {{#cite JSON-LD}}.

All SHA-256 hashes {{#cite SHA256}} that appear in concrete representations of these data structures
MUST be encoded as a string using the `"base64url"` {{#cite RFC4648}} encoding.


## DID Document { #did-document }

A DID document is a map data structure defined by the DID core v1.1 specification {{#cite
DID-CORE}}.

The following properties MUST be included:

- `@context`: A context array containing the following context URLs:
  - `"https://www.w3.org/TR/did-1.1"`
  - `"https://btcr2.dev/context/v1"`
- `id`: The `did`.

It can optionally include one or more of the following properties:

- `verificationMethod`: A set of verification method objects.
- `assertionMethod`: A set of references to verification methods or embedded verification method
  objects to be used for assertions.
- `capabilityInvocation`: A set of references to verification methods or embedded verification
  method objects to be used for capability invocations.
- `service`: An array of service objects.
  - [BTCR2 Beacons][BTCR2 Beacon] are declared as DID services using the service `type` specified in
    [Beacons Table 1: Beacon Types].

In order for this DID document to be updatable, controllers must include at least one
verification method with a capability invocation verification relationship and at least one
[BTCR2 Beacon] service.


## Genesis Document { #genesis-document }

A [Genesis Document] is a [DID document (data structure)] with the identifier set to the
placeholder value (`did:btcr2:_`).

{% set hide_text = `` %}
{% set ex_genesis_document =
`
~~~json
{{#include example-data/genesis-document.json}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="genesis-document-example",
  example=ex_genesis_document,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## Initial DID Document { #initial-document }

An [Initial DID Document] is a conformant [DID document (data structure)].

{% set hide_text = `` %}
{% set ex_initial_did_document =
`
~~~json
{{#include example-data/initial-did-document.json}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="initial-did-document-example",
  example=ex_initial_did_document,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## BTCR2 Unsigned Update { #btcr2-unsigned-update }

A [BTCR2 Unsigned Update] is a Map data structure with the following properties:

- `@context`: A context array containing the following context URLs:
  - `"https://w3id.org/zcap/v1"`
  - `"https://w3id.org/security/data-integrity/v2"`
  - `"https://w3id.org/json-ld-patch/v1"`
  - `"https://btcr2.dev/context/v1"`
- `patch`: A JSON Patch {{#cite RFC6902}} object that defines a set of transformations to be
  applied to a DID document. The result of applying the patch MUST be a conformant DID document
  according to the DID core v1.1 specification {{#cite DID-CORE}}.
- `targetVersionId`: The `versionId` of the DID document after the patch has been applied. The
  targetVersionId MUST be one more than the `versionId` of the DID document being updated.
- `sourceHash`: A SHA-256 hash of the DID document that the patch MUST be applied to. The hash MUST
  be produced by the [JSON Document Hashing] algorithm.
- `targetHash`: A SHA-256 hash of the DID document that results from applying the patch to the
  source document. The hash MUST be produced by the [JSON Document Hashing] algorithm.

{% set hide_text = `` %}
{% set ex_btcr2_unsigned_update =
`
~~~json
{{#include example-data/btcr2-unsigned-update.json}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="btcr2-unsigned-update-example",
  example=ex_btcr2_unsigned_update,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## BTCR2 Signed Update { #btcr2-signed-update }

A [BTCR2 Signed Update] is a Map data structure with the same properties as
[BTCR2 Unsigned Update (data structure)] and one additional property:

- `proof`: A [Data Integrity Proof (data structure)].

{% set hide_text = `` %}
{% set ex_btcr2_signed_update =
`
~~~json
{{#include example-data/btcr2-signed-update.json}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="btcr2-signed-update-example",
  example=ex_btcr2_signed_update,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## Data Integrity Config { #data-integrity-config }

A Data Integrity {{#cite VC-DATA-INTEGRITY}} proof with the `proofPurpose` set to `"capabilityInvocation"` and `proofValue` omitted.

The following properties MUST be included in the Data Integrity Config:

- `@context`: A context array containing the follow context URLs:
  - `"https://w3id.org/security/v2"`
  - `"https://w3id.org/zcap/v1"`
  - `"https://w3id.org/json-ld-patch/v1"`
  - `"https://btcr2.dev/context/v1"`
- `type`: The string `"DataIntegrityProof"`.
- `cryptosuite`: The string `"bip340-jcs-2025"`.
- `verificationMethod`: A valid `verificationMethod` reference that exists in the most recent DID document.
- `proofPurpose`: The string `"capabilityInvocation"`.
- `capability`: A URN of the following format: `urn:zcap:root:${encodeURIComponent(did)}`.
- `capabilityAction`: A string declaring the action required for the capability invocation. The
  string MUST be set to `"Write"`.

<!-- todo: add an example -->

## Data Integrity Proof { #data-integrity-proof }

A [Data Integrity Proof] with the `proofPurpose` set to `"capabilityInvocation"`. This proof MUST be a valid invocation of the capability to update a **did:btcr2** DID document.

This data structure is a Map data structure with the same properties as [Data Integrity Config (data structure)] and one additional property:

- `proofValue`: MUST be a detached Schnorr signature produced according to Schnorr Signatures for secp256k1 {{#cite BIP340}}, as a Multibase `"base-58-btc"` {{#cite CID}} encoded string.

{% set hide_text = `` %}
{% set ex_di_proof =
`
~~~json
{{#include example-data/data-integrity-proof.json}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="data-integrity-proof-example",
  example=ex_di_proof,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## Sidecar Data { #sidecar-data }

The [Sidecar Data] contains optional properties:

- `@context`: The context string `"https://btcr2.dev/context/v1"`
- `genesisDocument`: OPTIONAL [Genesis Document]. It is REQUIRED when resolving **did:btcr2**
  identifiers with `x` HRP.
- `updates`: OPTIONAL array of [BTCR2 Signed Updates][BTCR2 Signed Update]. It is REQUIRED
  if the DID being resolved has ever had a published [BTCR2 Update].
- `casUpdates`: OPTIONAL array of [CAS Announcements][CAS Announcement (data structure)]. It is REQUIRED
  if the DID being resolved has used a [CAS Beacon] to publish a [BTCR2 Update].
- `smtProofs`: OPTIONAL array of [SMT Proofs][SMT Proof (data structure)]. It is REQUIRED
  if the DID being resolved has used a [SMT Beacon] to publish a [BTCR2 Update].

{% set hide_text = `` %}
{% set ex_sidecar_data =
`
~~~json
{{#include example-data/sidecar-data.json}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="sidecar-data-example",
  example=ex_sidecar_data,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## SMT Proof { #smt-proof }

A [SMT Proof] data structure contains the following properties:

- `id`: SHA-256 hash of the root node.
- `nonce`: OPTIONAL 256-bit nonce generated for each update. MUST be encoded as a string using the `"base64url"` {{#cite RFC4648}} encoding.
- `updateId`: The OPTIONAL [BTCR2 Signed Update (data structure)] hashed with the [JSON Document Hashing] algorithm.
- `collapsed`: Bitmap of zero nodes within the path (see: [collapsed leaves](https://github.com/hoytech/quadrable#collapsed-leaves)).
- `hashes`: Array of SHA-256 hashes representing the sibling [SMT] nodes from the leaf, containing the SHA-256 hash of the [BTCR2 Signed Update] or the "zero identity", to the root.


{% set hide_text = `` %}
{% set ex_sidecar_smt_proof =
`
~~~json
{{#include example-data/sidecar-smt-proof.json}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="sidecar-smt-proof-example",
  example=ex_sidecar_smt_proof,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## Resolution Options { #resolution-options }

This data structure is defined by DID Resolution v0.3 {{#cite DID-RESOLUTION}}.

Resolution options MAY contain the following properties:

- `versionId`: OPTIONAL ASCII string representation of the specific version of a DID document to be resolved.
- `versionTime`: OPTIONAL XML Datetime normalized to UTC without sub-second decimal precision. The DID document to be resolved is the most recent version of the DID document that was valid for the DID before the specified `versionTime`.
- `sidecar`: [Sidecar Data (data structure)].

<!-- todo: add an example -->


## DID Resolution Metadata { #did-resolution-metadata }

This data structure is defined by DID Resolution v0.3 {{#cite DID-RESOLUTION}}.

Resolution metadata MAY contain the following properties:

- `contentType`: OPTIONAL media type of the returned DID document. E.g., `"application/ld+json"`.
- `error`: REQUIRED if an error occurs during DID resolution.

<!-- todo: add an example -->


## DID Document Metadata { #did-document-metadata }

This data structure is defined by DID Resolution v0.3 {{#cite DID-RESOLUTION}}.

Document metadata MAY contain the following properties:

- `deactivated`: REQUIRED boolean that represents whether the resolved DID document has been deactivated.
- `updated`: OPTIONAL XML Datetime normalized to UTC without sub-second decimal precision of the last Update operation for the resolved DID document.
- `versionId`: OPTIONAL ASCII string representation of the version of the last Update operation for the resolved DID document.

<!-- todo: add an example -->


## CAS Announcement { #cas-announcement }

A data structure that maps DIDs to [BTCR2 Signed Update] hashes. All [BTCR2 Signed Updates (data structure)][BTCR2 Signed Update (data structure)] MUST be hashed with the [JSON Document Hashing] algorithm. The concrete representation of this data structure will be published to a [CAS].

{% set hide_text = `` %}
{% set ex_cas_announcement_data =
`
~~~json
{{#include example-data/cas-announcement.json}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="cas-announcement-example",
  example=ex_cas_announcement_data,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## Root Capability { #root-capability }

A Root Capability is an Object Capability used to authorize updates to a DID document. Implementation MAY use ZCAP-LD for capability invocations {{#cite ZCAP-LD}}.

The Root Capability MUST be a map containing only the following properties:

- `@context`: MUST be the context string `"https://w3id.org/zcap/v1"`
- `id`: MUST be a URN of the following format: `urn:zcap:root:${encodeURIComponent(did)}`
- `invocationTarget`: MUST be the `did`.
- `controller`: MUST be the `did`.

{% set hide_text = `` %}
{% set ex_root_capability =
`
~~~json
{{#include example-data/root-capability.json}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="root-capability-example",
  example=ex_root_capability,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}
