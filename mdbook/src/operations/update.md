{% import "includes/ui.tera" as ui %}
{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Update

**did:btcr2** DID documents can be updated by anchoring [BTCR2 Updates][BTCR2 Update] to Bitcoin transactions.

Updates are either announced independently using [Singleton Beacons][Singleton Beacon], or announced as part of an aggregation cohort to minimize on-chain costs, using either [CAS Beacons][CAS Beacon] or [SMT Beacons][SMT Beacon].

Any property in the DID document may be updated except the `id`. Doing so would invalidate the DID document.

The update operation has the following function signature:

```rust
fn update(
  didSourceDocument,
  jsonPatches,
  targetVersionId,
  beaconServiceId,
  verificationMethodId,
  privateKey,
) ->
  signedUpdate
```

Input arguments:

- `didSourceDocument`: The source DID document.
- `jsonPatches`: An array of JSON patch documents {{#cite RFC6902}} with the changes to be made to the source DID document.
- `targetVersionId`: The `versionId` of the target DID document that the new [BTCR2 Signed Update] will yield.
- `beaconServiceId`: The `service` index for the [BTCR2 Beacon] within the source DID document used for announcing the update.
- `verificationMethodId`: The `verificationMethod` ID used for signing the [BTCR2 Update].
- `privateKey`: Private key associated with the `verificationMethodId`.
  - An implementation MAY use the `verificationMethodId` ID to retrieve the private key from a key material manager.

Outputs:

- `signedUpdate`: A copy of the [BTCR2 Signed Update] anchored to the Bitcoin blockchain by a [BTCR2 Update Announcement].


## Process

Updating a **did:btcr2** DID document is a matter of constructing a [BTCR2 Signed Update] then announcing that update via one or more [BTCR2 Beacons][BTCR2 Beacon] listed in the DID document. The update announcement process varies depending on the [Beacon Type].

Constructing a [BTCR2 Signed Update] is a two-step process. First, a [BTCR2 Unsigned Update] is constructed. Then the update is signed with a private key to construct the [BTCR2 Signed Update].


## Construct BTCR2 Unsigned Update

This process constructs a [BTCR2 Unsigned Update (data structure)].

Apply all JSON patches in `jsonPatches` to `didSourceDocument` to create `didTargetDocument`. `didTargetDocument` MUST be conformant to DID Core v1.1 {{#cite DID-CORE}}. An [`INVALID_DID_UPDATE`] error MUST be raised if `didTargetDocument.id` is not equal to `didSourceDocument.id`.

Fill the [BTCR2 Unsigned Update (data structure)] template below with the required template variables.

* `array-of-patches`: `jsonPatches` serialized to a JSON string.
* `source-hash`: `didSourceDocument` hashed with the [JSON Document Hashing] algorithm.
* `target-hash`: `didTargetDocument` hashed with the [JSON Document Hashing] algorithm.
* `target-version-id`: The value of `targetVersionId`.

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

<!-- what happens if the patches wipe out or replace all the verificationMethod and/or the capabilityInvocation sets from the didSourceDocument? can we still do this update? Maybe this is another kind of update that would invalidate the DID document and should be banned? -->

An [`INVALID_DID_UPDATE`] error MUST be raised if the `didSourceDocument.verificationMethod` Set does not contain an `id` matching `verificationMethodId`.

An [`INVALID_DID_UPDATE`] error MUST be raised if the `didSourceDocument.capabilityInvocation` Set does not contain `verificationMethodId`.

Create `cryptosuite` as a BIP340 Cryptosuite {{#cite BIP340-Cryptosuite}} instance with `privateKey` and `"bip340-jcs-2025"` cryptosuite.

<!-- todo: should we just pull in the stuff we want from the cryptosuite spec and not have to refer to it? -->

Fill the Data Integrity {{#cite VC-DATA-INTEGRITY}} template below with the required template variables.

* `verification-method`: The value of `verificationMethodId`.
* `capability`: A URN of the following format: `urn:zcap:root:${encodeURIComponent(didSourceDocument.id)}`.

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


## Announce DID Update

<!-- TODO: announce -->

[BTCR2 Signed Updates][BTCR2 Signed Update] are announced to the Bitcoin blockchain in three different ways depending on the [Beacon Type], denoted by the `type` value of the `service` identified by `beaconServiceId`.


### Announcing to a Singleton Beacon

A [BTCR2 Update Announcement] for a Singleton Beacon is the SHA256 hash of the [BTCR2 Signed Update] hashed with the [JSON Document Hashing] algorithm. This hash is used as the [Signal Bytes] when constructing a [Beacon Signal] bitcoin transaction. The [Beacon Signal] can then be signed by the private key that controls the [Beacon Address] and broadcast to the Bitcoin network. <!-- todo: constructing/signing/broadcasting Bitcoin transactions are low-level Bitcoin operations. Do we need to give more details? -->


### Announcing to an Aggregate Beacon

Aggregating and announcing updates for multiple **btcr2:did**s to an [Aggregate Beacon] ([CAS Beacon] or [SMT Beacon]) requires a five-step process that guarantees all [Beacon Participant][Beacon Participants] in the [Beacon Cohort] have confirmed every [Beacon Signal] that gets announced on the Bitcoin blockchain.

(copy pasta) First, the [Aggregate Beacon] advertises the update opportunity using ~~~Algo 19. Advertise Update Opportunity (Aggregator)~~~. Then, each [Beacon Participant] prepares a response to that opportunity using ~~~Algo 20. Prepare & Submit Opportunity Response (Participant)~~~. Once all responses are received, the [Aggregate Beacon] combines those responses into a [Beacon Signal] and requests confirmation by all [Beacon Participants][Beacon Participant] using ~~~Algo 21. Aggregate & Request Signal Confirmation (Aggregator)~~~. To confirm that signal, each [Beacon Participant] uses ~~~Algo 22. Confirm Signal (Participant)~~~ to sign and submit their MuSig2 partially signed Bitcoin transaction. Finally, the [Aggregate Beacon] combines all partial signatures from the confirmations to finalize the transaction and posts the [Beacon Signal] to the Bitcoin blockchain using ~~~Algo 23. Broadcast Aggregated Signal (Aggregator)~~~.

