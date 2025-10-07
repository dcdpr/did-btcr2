{% import "includes/ui.tera" as ui %}
{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Resolve

DID resolution is defined by DID Resolution v0.3 {{#cite DID-RESOLUTION}}.

The resolve operation has the following function signature:

```rust
fn resolve(did, resolutionOptions) ->
  (didResolutionMetadata, didDocument, didDocumentMetadata)
```

Input arguments:

- `did`: The DID.
- `resolutionOptions`: [Resolution options (data structure)].

Outputs:

- `didResolutionMetadata`: [DID resolution metadata (data structure)].
- `didDocument`: [DID document (data structure)].
- `didDocumentMetadata`: [DID document metadata (data structure)].

Input arguments are processed by [Decoding the DID](#decode-the-did) and [Processing Sidecar Data](#process-sidecar-data).

Let `didDocument` be the value of `current_document` at the end of the following process:

<!--
  TODO: There is a way to describe this process without resorting to a bulleted and numbered list.

  I do not currently know what that way is. :)
-->

* Initialize state needed for DID document resolution:
    1. Let `updates` be an empty array of update tuples. Each update tuple consists of:
        * Bitcoin block information: block-height, block-time, and block-confirmations.
        * A [BTCR2 Signed Update (data structure)].
    1. Let `current_version_id` be `1`.
    1. Let `update_hash_history` be an empty array of [BTCR2 Unsigned Update] hashes.
    1. [Establish `current_document`](#establish-current-document).
* Repeat the following steps ...
    1. [Process Beacon Signals](#process-beacon-signals) for `current_document` to populate the `updates` and `update_hash_history` arrays.
    1. [Process `updates` Array](#process-updates) to update `current_document` and `current_version_id`.
    1. ... until any of these conditions are met:
        * [Process `updates` Array](#process-updates) exited early with a resolved `didDocument`.
        * `current_version_id` equals the integer representation of `resolutionOptions.versionId`.
        * An error is raised.

Let `didResolutionMetadata` be a [DID Resolution Metadata (data structure)] that MAY be empty.

Let `didDocumentMetadata` be a [DID Document Metadata (data structure)] with the following REQUIRED properties:
* `versionId`: The version number of the resolved DID document as an ASCII string.
* `confirmations`: The number of confirmations for the Bitcoin block that contains the most recently applied unique [^1] update that yielded the resolved DID document, as an ASCII string.
* `deactivated`: Boolean indicating whether the resolved DID document has been deactivated.

[^1]: "Unique" in this sense is a reference to handling potentially duplicated updates. The requirement for `confirmations` is that the lowest block height is used when deduplicating.


## Decode the DID { #decode-the-did }

The `did` MUST be parsed with the [DID-BTCR2 Identifier Decoding] algorithm to retrieve `version`,
`network`, and `genesis_bytes`. An `INVALID_DID` error MUST be raised in response to any errors
raised while decoding.


## Process Sidecar Data { #process-sidecar-data }

`resolutionOptions` contains a `sidecar` property ([Sidecar Data (data structure)]) which SHOULD be
processed in the following manner:

* Hash each [BTCR2 Signed Update (data structure)] in `sidecar.updates` using the [JSON Document Hashing] algorithm.
  * Transform the `sidecar.updates` array into a Map that can be used for looking up each [BTCR2 Signed Update (data structure)] by its hash.
  * Let `update_lookup_table` be the transformed Map.
* Hash each [Map Announcement (data structure)] in `sidecar.mapUpdates` using the [JSON Document Hashing] algorithm.
  * Transform the `sidecar.mapUpdates` array into a Map that can be used for looking up each [Map Announcement (data structure)] by its hash.
  * Let `cas_lookup_table` be the transformed Map.
* Transform the `sidecar.smtProofs` array into a Map that can be used for looking up each [SMT Proof (data structure)] by its `id`.
  * Let `smt_lookup_table` be the transformed Map.

If `genesis_bytes` is a SHA-256 hash, the `sidecar.genesisDocument` MUST be hashed with the
[JSON Document Hashing] algorithm. An `INVALID_DID` error MUST be raised if the computed hash does
not match `genesis_bytes`.


## Establish `current_document` { #establish-current-document }

Resolution begins by creating an [Initial Did Document] called `current_document` ([current DID Document]). The `current_document` is iteratively patched with [BTCR2 Signed Updates][BTCR2 Signed Update] announced by [Authorized Beacon Signals][Authorized Beacon Signal].

Establishing the `current_document` MUST be done depending on the type of `genesis_bytes` retrieved from the decoded `did`:


### If `genesis_bytes` is a SHA-256 Hash

The [Genesis Document] provided in `sidecar.genesisDocument` MUST be processed by replacing the
identifier placeholder (`"did:btcr2:_"`) with the `did`. A string replacement or regular expression
replacement is a suitable processor.

Let `current_document` be the result of parsing the processed string as JSON. The resulting
[DID Document (data structure)] MUST be conformant to DID Core v1.1 {{#cite DID-CORE}}.


### If `genesis_bytes` is a secp256k1 Public Key

Fill the [Initial DID Document] template below with the required template variables. All Bitcoin
addresses MUST use the Bitcoin URI Scheme {{#cite BIP321}}.

* `did`: The `did`.
* `public-key-multikey`: Multikey format representation {{#cite BIP340-Cryptosuite}} of the public key.
* `p2pkh-bitcoin-address`: A Pay-to-Public-Key-Hash (P2PKH) Bitcoin address produced from the public key.
* `p2wpkh-bitcoin-address`: A Pay-to-Witness-Public-Key-Hash (P2WPKH) Bitcoin address produced from the public key.
* `p2tr-bitcoin-address`: A Pay-to-Taproot (P2PKH) Bitcoin address produced from the public key.

{% set hide_text = `` %}
{% set initial_did_document_template =
`
~~~hbs
{{#include ../example-data/key-based-initial-did-document-template.hbs}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="initial-did-document-template",
  example=initial_did_document_template,
  hide=hide_text,
  default="hide",
  show_label="Show Template",
  hide_label="Hide"
) }}

Let `current_document` be the result of parsing the rendered template as JSON. The
resulting [DID Document (data structure)] MUST be conformant to DID Core v1.1 {{#cite DID-CORE}}.


## Process Beacon Signals { #process-beacon-signals }

Iterate through the `current_document` ([DID Document (data structure)]) `service` array to
discover the [BTCR2 Beacons][BTCR2 Beacon] by matching the service `type` against
[Beacons Table 1: Beacon Types].

Parse `serviceEndpoint` for each [BTCR2 Beacon] as a [Beacon Address]. Use those
[Beacon Addresses][Beacon Address] to find all Bitcoin transactions containing a [Beacon Signal]
where the last transaction output is a script containing [Signal Bytes].

Implementations are RECOMMENDED to find transactions by querying an indexed Bitcoin blockchain RPC
service like [electrs](https://github.com/romanz/electrs) or
[Esplora](https://github.com/Blockstream/esplora). Implementations MAY find all transactions by
traversing each block on the blockchain beginning from the genesis block. Implementations SHOULD
cache [Beacon Addresses][Beacon Address] to avoid duplicate transaction lookups.

For each transaction:

* Process the transaction's [Signal Bytes] according to the [Beacon Type]:
  * Singleton Beacon: Let `update_hash` be [Signal Bytes].
  * CAS Beacon: [Process CAS Beacon](#process-cas-beacon).
  * SMT Beacon: [Process SMT Beacon](#process-smt-beacon).
* Let `update_tuple` be a tuple of:
  * The transaction's block-height, block-time, and block-confirmations.
  * The [BTCR2 Signed Update (data structure)] retrieved from `update_lookup_table[update_hash]`. <!-- TODO: ... or retrieve from CAS -->
* Push `update_tuple` to the `updates` array.


### Process CAS Beacon { #process-cas-beacon }

<!-- TODO: Rename "Map Beacon" (and "Map Announcement" etc.) to "CAS ..." -->

* Let `map_update_hash` be [Signal Bytes].
* Look up `map_update_hash` in the `cas_lookup_table` to retrieve a [Map Announcement (data structure)].
* Let `update_hash` be the result of looking up `did` in the [Map Announcement (data structure)].

Pseudocode:

```rust
let map_update_hash = <Signal Bytes>;
let update_hash = cas_lookup_table[map_update_hash][did];
```


### Process SMT Beacon { #process-smt-beacon }

* Let `smt_root` be [Signal Bytes].
* Let `smt_proof` be the result of looking up `smt_root` in the `smt_lookup_table` to retrieve a [SMT Proof (data structure)].
* Check the `smt_proof` by frobnicating the whatchamacallit. <!-- TODO: Make the check real. Needs an SMT Proof algorithm. -->
* Let `update_hash` be `smt_proof.updateId`.

Pseudocode:

```rust
let smt_root = <Signal Bytes>;
let smt_proof = smt_lookup_table[smt_root];
smt_proof.frobnicate();
let update_hash = smt_proof.updateId;
```


## Process `updates` Array { #process-updates }

Sort the `updates` array by [BTCR2 Signed Update (data structure)] `targetVersionId`, lowest first, using block-height as a tie breaker. Pop the first element from the front of the `updates` array.

If the element's block-time is greater than the integer representation of `resolutionOptions.versionTime`, `current_document` MUST be returned as the final resolved `didDocument` with block-confirmations as `didResolutionMetadata.confirmations`.

Otherwise, let `update` be the element's [BTCR2 Signed Update (data structure)] and [check `update.targetVersionId`](#check-update-version).

Increment `current_version_id`.

If `current_version_id` >= `resolutionOptions.versionId`, return `current_document` as the resolved `didDocument` and block-confirmations as `didResolutionMetadata.confirmations`.


### Check `update.targetVersionId` { #check-update-version }

Compare `update.targetVersionId` to `current_version_id`. Only one of three possible conditions may occur:

* `update.targetVersionId <= current_version_id`:
  * [Confirm Duplicate Update](#confirm-duplicate-update).
* `update.targetVersionId == current_version_id + 1`:
  * [Apply `update`](#apply-update).
* `update.targetVersionId > current_version_id + 1`:
  * [`LATE_PUBLISHING`] error MUST be raised.


### Confirm Duplicate Update { #confirm-duplicate-update }

This ensures that the update is in fact a duplicate since the `update.targetVersionId` is lower than expected.

Let `unsigned_update` be a copy of `update` with the `proof` property removed.

Hash the `unsigned_update` with the [JSON Document Hashing] algorithm.

Compare the computed hash to `update_hash_history[unsigned_update.targetVersionId - 2]`. If these do not match, a [`LATE_PUBLISHING`] error MUST be raised.


### Apply `update` { #apply-update }

Hash `current_document` using the [JSON Document Hashing] algorithm. An [`INVALID_DID_UPDATE`] error MUST be raised if the computed hash does not match the decoded `update.sourceHash`.

[Check `update.proof`](#check-update-proof).

Apply the `update.patch` JSON Patch {{#cite RFC6902}} to `current_document`.

Verify that the `current_document` is conformant to DID Core v1.1 {{#cite DID-CORE}}.

Hash the patched `current_document` using the [JSON Document Hashing] algorithm. An [`INVALID_DID_UPDATE`] error MUST be raised if the computed hash does not match the decoded `update.targetHash`.


### Check `update.proof` { #check-update-proof }

<!--
  TODO: This is where ZCAP-LD comes into play. It is intentionally omitted.

  This is sound because `update.proof.verificationMethod` is REQUIRED to be both a valid
  `verificationMethod` and `capabilityInvocation` in the current document. This is enough to imply
  the one and only capability required by this spec ("Write").

  It should probably be mentioned for completeness as a soft RECOMMENDATION, referencing
  [Root Capability (data structure)].
-->

Find `publicKeyMultibase` within the `current_document.verificationMethod` Set which matches the `id` referenced by `update.proof.verificationMethod`. If not found, MUST raise an [`INVALID_DID_UPDATE`] error.

Ensure that an element of the `current_document.capabilityInvocation` Set matches `update.proof.verificationMethod`, else MUST raise [`INVALID_DID_UPDATE`] error.

Instantiate a BIP340 Cryptosuite {{#cite BIP340-Cryptosuite}} instance using `publicKeyMultibase` and `"bip340-jcs-2025"` cryptosuite.

Pass `update` to the instantiated BIP340 Cryptosuite `verifyProof` method. If the result's `verified` property is `false`, an [`INVALID_DID_UPDATE`] error MUST be raised.
