{% import "includes/ui.tera" as ui %}
{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Resolve

Resolving a **did:btcr2** identifier iteratively builds a DID document by applying [BTCR2 Updates][BTCR2 Update] to an [Initial DID Document] that have been committed to the Bitcoin blockchain by [Authorized Beacon Signals][Authorized Beacon Signal]. The [Initial DID Document] is either deterministically created from the DID or provided by [Sidecar Data].

DID resolution is defined by DID Resolution v0.3 {{#cite DID-RESOLUTION}}.

The resolve operation has the following function signature:

```rust
fn resolve(did, resolutionOptions) ->
  (didResolutionMetadata, didDocument, didDocumentMetadata)
```


## Process

Input values MUST first go through [Decoding the DID](#decode-the-did) and [Processing Sidecar Data](#process-sidecar-data).

Resolution maintains the following state while building the DID document:

* `updates`: a list of tuples, each containing Bitcoin block metadata (height, time, confirmations) and a [BTCR2 Signed Update (data structure)].
* `current_document`: the DID document being assembled.
* `current_version_id`: the version number being processed (starts at `1`).
* `update_hash_history`: a list of [BTCR2 Unsigned Update] hashes used to detect duplicates.
* `block_confirmations`: confirmations for the Bitcoin block that contains the most recently applied unique update.

The resolver:

1. [Establishes `current_document`](#establish-current-document) from the DID or from [Sidecar Data].
2. Repeats the following loop:
    * [Process Beacon Signals](#process-beacon-signals) to populate `updates` from the beacon services in `current_document`.
    * [Process `updates` Array](#process-updates) to apply updates to `current_document` and refresh `block_confirmations`.
    * Stops when processing updates returns early with a resolved `didDocument` or an error occurs.

The resolver returns:

* `didResolutionMetadata`: a [DID Resolution Metadata (data structure)] (MAY be empty).
* `didDocument`: the final [DID document (data structure)].
* `didDocumentMetadata`: a [DID document metadata (data structure)] with REQUIRED fields:
  * `versionId`: `current_version_id` as an ASCII string.
  * `confirmations`: `block_confirmations` as an integer. [^1]
  * `deactivated`: `current_document.deactivated`.

[^1]: The number of confirmations for the Bitcoin block that contains the most recently applied unique update that yielded the resolved DID document. "Unique" refers to handling duplicated updates. When deduplicating, use the lowest block height to determine confirmations.


## Decode the DID { #decode-the-did }

The `did` MUST be parsed with the [DID-BTCR2 Identifier Decoding] algorithm to retrieve `version`,
`network`, and `genesis_bytes`. An [`INVALID_DID`](../errors.html) error MUST be raised in response to any errors
raised while decoding.


## Process Sidecar Data { #process-sidecar-data }

`resolutionOptions` contains a `sidecar` property ([Sidecar Data (data structure)]) which SHOULD be prepared as lookup tables:

- Hash each [BTCR2 Signed Update (data structure)] in `sidecar.updates` with the [JSON Document Hashing] algorithm and build a map from hash to update (`update_lookup_table`).
- Hash each [CAS Announcement (data structure)] in `sidecar.casUpdates` with the [JSON Document Hashing] algorithm and build a map from hash to announcement (`cas_lookup_table`).
- Build a map from `sidecar.smtProofs` keyed by proof `id` (`smt_lookup_table`).

If `genesis_bytes` is a SHA-256 hash, hash `sidecar.genesisDocument` with the [JSON Document Hashing] algorithm. Raise an [`INVALID_DID`](../errors.html) error if the computed hash does not match `genesis_bytes`.


## Establish `current_document` { #establish-current-document }

Resolution begins by creating an [Initial Did Document] called `current_document` ([Current DID Document]). The `current_document` is iteratively patched with [BTCR2 Signed Updates][BTCR2 Signed Update] announced by [Authorized Beacon Signals][Authorized Beacon Signal].

Choose how to establish `current_document` based on the type of `genesis_bytes` retrieved from the decoded `did`:


### If `genesis_bytes` is a SHA-256 Hash

Process the [Genesis Document] provided in `sidecar.genesisDocument` by replacing the identifier placeholder (`"did:btcr2:_"`) with the `did`. A simple string replacement is sufficient. Parse the result as JSON to form `current_document`. The resulting [DID Document (data structure)] MUST be conformant to DID Core v1.1 {{#cite DID-CORE}}.


### If `genesis_bytes` is a secp256k1 Public Key

Render the [Initial DID Document] template with these values (Bitcoin addresses MUST use the Bitcoin URI Scheme {{#cite BIP321}}):

* `did`: The `did`.
* `public-key-multikey`: Public key as a Multibase `"base-58-btc"` {{#cite CID}} encoded string.
* `p2pkh-bitcoin-address`: Pay-to-Public-Key-Hash (P2PKH) Bitcoin address produced from the public key.
* `p2wpkh-bitcoin-address`: Pay-to-Witness-Public-Key-Hash (P2WPKH) Bitcoin address produced from the public key.
* `p2tr-bitcoin-address`: Pay-to-Taproot Bitcoin address produced from the public key.

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

Parse the rendered template as JSON to form `current_document`. The resulting [DID Document (data structure)] MUST be conformant to DID Core v1.1 {{#cite DID-CORE}}.


## Process Beacon Signals { #process-beacon-signals }

Scan the `service` entries in `current_document` ([DID Document (data structure)]) and identify [BTCR2 Beacons][BTCR2 Beacon] by matching service `type` to [Beacons Table 1: Beacon Types]. Parse each beacon `serviceEndpoint` as a [Beacon Address], then use those [Beacon Addresses][Beacon Address] to find Bitcoin transactions whose last output script contains [Signal Bytes].

Implementations are RECOMMENDED to query an indexed Bitcoin blockchain RPC service such as [electrs](https://github.com/romanz/electrs) or [Esplora](https://github.com/Blockstream/esplora). Implementations MAY instead traverse blocks from the genesis block. Cache [Beacon Addresses][Beacon Address] to avoid repeated transaction lookups.

For each transaction found:

* Derive `update_hash` from the transaction's [Signal Bytes] based on the beacon type:
  * Singleton Beacon: `update_hash` is the [Signal Bytes].
  * CAS Beacon: use [Process CAS Beacon](#process-cas-beacon).
  * SMT Beacon: use [Process SMT Beacon](#process-smt-beacon).
* Build a tuple with:
  * The transaction's block-height, block-time, and block-confirmations.
  * The [BTCR2 Signed Update (data structure)] retrieved from `update_lookup_table[update_hash]`.
    * If the update is not in `update_lookup_table`, retrieve it from [CAS].
    * Raise a [`MISSING_UPDATE_DATA`] error if the update is not available from either source.
* Append the tuple to `updates`.


### Process CAS Beacon { #process-cas-beacon }

Treat [Signal Bytes] as `map_update_hash`. Look up `map_update_hash` in `cas_lookup_table` to retrieve a [CAS Announcement (data structure)] and read `update_hash` from the announcement entry keyed by `did`.


### Process SMT Beacon { #process-smt-beacon }

Treat [Signal Bytes] as `smt_root`. Look up `smt_root` in `smt_lookup_table` to retrieve an [SMT Proof (data structure)]. Validate the proof with the [SMT Proof Verification] algorithm. Use `smt_proof.updateId` as `update_hash`.


## Process `updates` Array { #process-updates }

Return `current_document` as the resolved `didDocument` if `updates` is empty.

Otherwise:

1. Sort `updates` by [BTCR2 Signed Update (data structure)] `targetVersionId` (ascending) with block-height as a tiebreaker. Take the first tuple.
2. Set `block_confirmations` to the tuple's block-confirmations.
3. If `resolutionOptions.versionTime` is provided and the tuple's block-time is more recent, return `current_document` as the resolved `didDocument`.
4. Set `update` to the tuple's [BTCR2 Signed Update (data structure)] and [check `update.targetVersionId`](#check-update-version).
5. Increment `current_version_id`.
6. If `current_version_id` is greater than or equal to the integer form of `resolutionOptions.versionId`, return `current_document`.
7. If `current_document.deactivated` is `true`, return `current_document`.


### Check `update.targetVersionId` { #check-update-version }

Compare `update.targetVersionId` to `current_version_id`. Only one of three possible conditions will occur:

* `update.targetVersionId <= current_version_id`:
  * [Confirm Duplicate Update](#confirm-duplicate-update).
* `update.targetVersionId == current_version_id + 1`:
  * [Apply `update`](#apply-update).
* `update.targetVersionId > current_version_id + 1`:
  * [`LATE_PUBLISHING`] error MUST be raised.


### Confirm Duplicate Update { #confirm-duplicate-update }

This step confirms that an update with a lower-than-expected `targetVersionId` is a true duplicate.

Create `unsigned_update` by removing the `proof` property from `update`. Hash `unsigned_update` with the [JSON Document Hashing] algorithm and compare it to `update_hash_history[update.targetVersionId - 2]`. Raise a [`LATE_PUBLISHING`] error if the hashes differ.


### Apply `update` { #apply-update }

Hash `current_document` with the [JSON Document Hashing] algorithm. Raise an [`INVALID_DID_UPDATE`] error if the result does not match the decoded `update.sourceHash`.

[Check `update.proof`](#check-update-proof).

Apply the `update.patch` JSON Patch {{#cite RFC6902}} to `current_document`.

Verify that `current_document` conforms to DID Core v1.1 {{#cite DID-CORE}} and that `current_document.id` equals `did`. Otherwise raise [`INVALID_DID_UPDATE`].

Hash the patched `current_document` with the [JSON Document Hashing] algorithm. Raise an [`INVALID_DID_UPDATE`] error if the result does not match the decoded `update.targetHash`.

Create `unsigned_update` by removing the `proof` property from `update`, hash it with the [JSON Document Hashing] algorithm, and append the hash to `update_hash_history`.


### Check `update.proof` { #check-update-proof }

Implementations MAY derive a [Root Capability (data structure)] from `update.proof` and invoke it according to Authorization Capabilities for Linked Data v0.3 {{#cite ZCAP-LD}}.

The resolver must locate `publicKeyMultibase` in `current_document.verificationMethod` whose `id` matches `update.proof.verificationMethod`. Otherwise raise [`INVALID_DID_UPDATE`]. Raise the same error if `current_document.capabilityInvocation` does not contain `update.proof.verificationMethod`.

Use a BIP340 Cryptosuite {{#cite BIP340-Cryptosuite}} instance with `publicKeyMultibase` and the `"bip340-jcs-2025"` cryptosuite to verify `update`. Raise [`INVALID_DID_UPDATE`] if verification fails.

<!-- Line breaks to visibly separate the preceding subsection from the chapter footnotes. -->
<br>
<br>
