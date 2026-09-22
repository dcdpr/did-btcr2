{% import "includes/ui.tera" as ui %}
{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Update

**did:btcr2** DID documents can be updated by anchoring [BTCR2 Updates][BTCR2 Update] to Bitcoin transactions. These transactions MAY be published to the Bitcoin network.

Any property in the DID document may be updated except the `id`. Doing so would invalidate the DID document.

The update operation has the following function signature:

```rust
fn update(
  didSourceDocument,
  jsonPatch,
  targetVersionId,
  verificationMethodId,
  signer,
) ->
  signedUpdate
```

Input arguments:

- `didSourceDocument`: The source DID document.
- `jsonPatch`: A single JSON Patch document {{#cite RFC6902}} with the changes to be made to the source DID document. Its wire shape is defined by the `patch` property of the [BTCR2 Unsigned Update (data structure)].
- `targetVersionId`: The `versionId` that will be returned in the [DID document metadata (data structure)] once the new [BTCR2 Signed Update] is applied.
- `verificationMethodId`: The `verificationMethod` ID used for signing the [BTCR2 Update].
- `signer`: A signing interface. The signer receives bytes and returns a Schnorr signature {{#cite BIP340}} for those bytes. The signer makes the signature with the private key for `verificationMethodId`. The signer selects how it holds or reaches that key. An external signer is RECOMMENDED. An implementation that holds the key in its own process is also conformant.

Outputs:

- `signedUpdate`: A copy of the [BTCR2 Signed Update] anchored to the Bitcoin blockchain by a [BTCR2 Update Announcement].


## Process

Updating a **did:btcr2** DID document is a matter of constructing a [BTCR2 Signed Update] then announcing that update via one or more [BTCR2 Beacons][BTCR2 Beacon] listed in the DID document. The update announcement process varies depending on the [Beacon Type].

Constructing a [BTCR2 Signed Update] is a two-step process. First, a [BTCR2 Unsigned Update] is constructed. Then the `signer` signs the update to construct the [BTCR2 Signed Update].


## Construct BTCR2 Unsigned Update

This process constructs a [BTCR2 Unsigned Update (data structure)].

Apply `jsonPatch` to `didSourceDocument` to create `didTargetDocument`. An [`INVALID_DID_UPDATE`] error MUST be raised if `jsonPatch` is malformed or fails to apply. JSON Patch {{#cite RFC6902}} operations are evaluated in order; the first operation that fails, including a failed `test` operation, fails the whole patch. `didTargetDocument` MUST be conformant to DID Core v1.1 {{#cite DID-CORE}}. An [`INVALID_DID_UPDATE`] error MUST be raised if `didTargetDocument.id` is not equal to `didSourceDocument.id`.

Fill the [BTCR2 Unsigned Update (data structure)] template below with the required template variables.

* `array-of-patches`: `jsonPatch` embedded as JSON.
* `source-hash`: `didSourceDocument` hashed with the [JSON Document Hashing] algorithm.
* `target-hash`: `didTargetDocument` hashed with the [JSON Document Hashing] algorithm.
* `target-version-id`: The value of `targetVersionId`.

`targetVersionId` MUST be derived from the `versionId` returned in the [DID document metadata (data structure)] by a fresh resolution of the DID, rather than from a locally maintained count. Announcing a [BTCR2 Signed Update] whose `targetVersionId` is wrong in either direction can permanently prevent the DID from resolving.

{% set hide_text = `` %}
{% set btcr2_unsigned_update_template =
`
~~~hbs
{{#include ../example-data/btcr2-unsigned-update-template.hbs}}
~~~
` %}

{{ ui::show_example_tabs(
group_id="btcr2-unsigned-update-template",
example=btcr2_unsigned_update_template,
hide=hide_text,
default="hide",
show_label="Show Template",
hide_label="Hide"
) }}

Let `update` be the result of parsing the rendered template as JSON. The
resulting [BTCR2 Unsigned Update (data structure)] MUST be conformant to this specification.


## Construct BTCR2 Signed Update

This process constructs a [BTCR2 Signed Update (data structure)] from `update`, a [BTCR2 Unsigned Update (data structure)].

An [`INVALID_DID_UPDATE`] error MUST be raised if no entry of the `didSourceDocument.capabilityInvocation` Set identifies `verificationMethodId`. A reference entry identifies it when the two values are equal. An embedded verification method object identifies it when the `id` of the object is equal.

If that entry is a reference, find the verification method in the `didSourceDocument.verificationMethod` Set with an `id` that is equal to the reference. An [`INVALID_DID_UPDATE`] error MUST be raised if there is no verification method with that `id`.

Create `cryptosuite` as a BIP340 Cryptosuite {{#cite BIP340-Cryptosuite}} instance with `signer` as the signing interface and the `"bip340-jcs-2025"` cryptosuite.

Fill the Data Integrity {{#cite VC-DATA-INTEGRITY}} template below with the required template variables.

* `verification-method`: The value of `verificationMethodId`.
* `capability`: A URN of the following format: `urn:zcap:root:${encodeURIComponent(didSourceDocument.id)}`. The `encodeURIComponent()` function is defined by ECMA-262 {{#cite ECMA-262}}.

{% set hide_text = `` %}
{% set data_integrity_config_template =
`
~~~hbs
{{#include ../example-data/data-integrity-config.hbs}}
~~~
` %}

{{ ui::show_example_tabs(
  group_id="data-integrity-config-template",
  example=data_integrity_config_template,
  hide=hide_text,
  default="hide",
  show_label="Show Template",
  hide_label="Hide"
) }}

Let `proofConfig` be the result of parsing the rendered template as JSON. The
resulting [Data Integrity Config (data structure)] MUST be conformant to Verifiable Credentials Data Integrity 1.0 {{#cite VC-DATA-INTEGRITY}}.

Pass `update` and `proofConfig` to the `cryptosuite.createProof` method and set `update.proof` to the resulting [Data Integrity Proof (data structure)].

Implementations SHOULD verify `update.proof` before they announce the update. Use the public key of the verification method that `verificationMethodId` identifies. An announced update with an invalid proof permanently invalidates the DID.


## Announce DID Update

[BTCR2 Signed Updates][BTCR2 Signed Update] are announced to the Bitcoin blockchain depending on the [Beacon Type].


### Announcing to a Singleton Beacon

A [BTCR2 Update Announcement] for a [Singleton Beacon] is the [BTCR2 Signed Update] hashed with the [JSON Document Hashing] algorithm. This 32-byte SHA-256 hash is used as the [Signal Bytes] when constructing a [Beacon Signal] Bitcoin transaction. The [Beacon Signal] is signed by the private key that controls the [Beacon Address] and broadcast to the Bitcoin network. To broadcast signed Bitcoin transactions, see the {{#cite Bitcoin-Core}} source code.


### Announcing to an Aggregate Beacon

Aggregating and announcing updates for multiple **did:btcr2** identifiers is the responsibility of the [Aggregation Service].
The main responsibilities include establishing a protocol for one or more rounds of secure group communications amongst [Aggregation Participants][Aggregation Participant], advertising available [Aggregation Cohorts][Aggregation Cohort] to [Aggregation Participants][Aggregation Participant] including the creation, management, timing and scheduling of those [Aggregation Cohorts][Aggregation Cohort], and broadcasting a Bitcoin transaction to the Bitcoin network that includes signatures from all [Aggregation Participants][Aggregation Participant] in a given [Aggregation Cohort].

