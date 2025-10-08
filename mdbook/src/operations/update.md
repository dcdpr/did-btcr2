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
  verificationMethod,
  privateKey,
) ->
  signedUpdate
```

Input arguments:

- `didSourceDocument`: The source DID document.
- `jsonPatches`: An array of JSON patch documents {{#cite RFC6902}} detailing the updates to be made to the source DID document.
- `targetVersionId`: The `versionId` of the target DID document that the new [BTCR2 Signed Update] will yield.
- `beaconServiceId`: The `service` index for the [BTCR2 Beacon] within the source DID document used for announcing the update.
- `verificationMethod`: The `verificationMethod` ID used for signing the [BTCR2 Update]. The `verificationMethod` MUST be listed in the source DID document's `verificationMethod` Set and MUST be included in the source DID document's `capabilityInvocation` Set.
- `privateKey`: Private key associated with the `verificationMethod`.
  - An implementation MAY retrieve the private key from a key material manager with the `verificationMethod`.

Outputs:

- `signedUpdate`: A copy of the [BTCR2 Signed Update] anchored to the Bitcoin blockchain by a [BTCR2 Update Announcement].


## Process

Updating a **did:btcr2** DID document is a matter of constructing a [BTCR2 Signed Update] then announcing that update via one or more [BTCR2 Beacons][BTCR2 Beacon] listed in the DID document. The update announcement process varies depending on the [Beacon Type].

## Construct BTCR2 Signed Update

Apply all JSON patches to `didSourceDocument` to create `didTargetDocument`. `didTargetDocument` MUST be conformant to DID Core v1.1 {{#cite DID-CORE}}.

Fill the [BTCR2 Unsigned Update] template below with the required template variables.

* `array-of-patches`: `jsonPatches` serialized to a JSON string.
* `source-hash`: `didSourceDocument` hashed with the [JSON Document Hashing] algorithm.
* `target-hash`: `didTargetDocument` hashed with the [JSON Document Hashing] algorithm.
* `target-version-id`: `targetVersionId`

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

Create `cryptosuite` as a BIP340 Cryptosuite {{#cite BIP340-Cryptosuite}} instance with `publicKeyMultibase` and `"bip340-jcs-2025"` cryptosuite.

<!-- todo: should we just pull in the stuff we want from the cryptosuite spec and not have to refer to it? -->

Pass `update` to the `cryptosuite.createProof` method and set `update.proof` to the resulting [Data Integrity Proof (data structure)].


<!-- TODO: announce -->
