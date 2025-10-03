{% import "macros.tera" as ui %}

# Data Structures

For the purposes of interoperability, this specification defines data structures using the data
model defined by the DID core v1.1 specification {{#cite DID-CORE}}.

Concrete representations of these data structures MUST conform to {{#cite JSON-LD}}.

All SHA-256 hashes {{#cite SHA256}} that appear in concrete representations of these data structures
MUST be encoded as a string using the `"base64url"` {{#cite RFC4648}} encoding.


## DID Document { #did-document }

A DID document is a map data structure defined by {{#cite DID-CORE}}.

The following properties MUST be included:

- `@context`: A context array containing the following context URLs:
  - `"https://www.w3.org/TR/did-1.1"`
  - `"https://btcr2.dev/context/v1"`
- `id`: The DID

It can optionally include one or more of the following properties:

- `verificationMethod`: A set of verification method objects.
- `assertionMethod`: A set of references to verification methods or embedded verification method
  objects to be used for assertions.
- `capabilityInvocation`: A set of references to verification methods or embedded verification
  method objects to be used for capability invocations.
- `service`: An array of service objects.

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
{
  "@context": [
    "https://www.w3.org/TR/did-1.1",
    "https://btcr2.dev/context/v1"
  ],
  "id": "did:btcr2:_",
  "verificationMethod": [
    {
      "id": "did:btcr2:_#key-0",
      "type": "Multikey",
      "controller": "did:btcr2:_",
      "publicKeyMultibase": "zQ3shSnvxNK94Kpux1sp8RCWfn4dTFcAr1fZLf7E3Dy19mEBi"
    }
  ],
  "assertionMethod": [
    "did:btcr2:_#key-0"
  ],
  "capabilityInvocation": [
    "did:btcr2:_#key-0"
  ],
  "service": [
    {
      "id": "did:btcr2:_#service-0",
      "type": "SingletonBeacon",
      "serviceEndpoint": "bitcoin:tb1qtmshuqzeyr7cdh5t2nl6kf3s73fdynpj5apgtx"
    },
    {
      "id": "did:btcr2:_#service-1",
      "type": "MapBeacon",
      "serviceEndpoint": "bitcoin:tb1pt97580gtfuge9mnrkvj2upk982alrr08pk4hhmlzkeutc06pt9pqyjqef2"
    },
    {
      "id": "did:btcr2:_#service-2",
      "type": "SMTBeacon",
      "serviceEndpoint": "bitcoin:tb1pgrn7wxhtlsakjjelag6usrmzw89h8tnsaq2ly50ty29hujerqu0sk5kv4e"
    }
  ]
}
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

## Initial DID Document { #initial-did-document }

An [Initial DID Document] is a conformant [DID document (data structure)].

<!-- todo: Make sure this example is re-done to have a real DID. -->

{% set hide_text = `` %}
{% set ex_initial_did_document = 
`
~~~json
{
  "@context": [
    "https://www.w3.org/TR/did-1.1",
    "https://btcr2.dev/context/v1"
  ],
  "id": "did:btcr2:k1qgp5h79scv4sfqkzak5g6y89dsy3cq0pd2nussu2cm3zjfhn4ekwrucc4q7t7",
  "verificationMethod": [
    {
      "id": "did:btcr2:k1qgp5h79scv4sfqkzak5g6y89dsy3cq0pd2nussu2cm3zjfhn4ekwrucc4q7t7#key-0",
      "type": "Multikey",
      "controller": "did:btcr2:k1qgp5h79scv4sfqkzak5g6y89dsy3cq0pd2nussu2cm3zjfhn4ekwrucc4q7t7",
      "publicKeyMultibase": "zQ3shSnvxNK94Kpux1sp8RCWfn4dTFcAr1fZLf7E3Dy19mEBi"
    }
  ],
  "assertionMethod": [
    "did:btcr2:k1qgp5h79scv4sfqkzak5g6y89dsy3cq0pd2nussu2cm3zjfhn4ekwrucc4q7t7#key-0"
  ],
  "capabilityInvocation": [
    "did:btcr2:k1qgp5h79scv4sfqkzak5g6y89dsy3cq0pd2nussu2cm3zjfhn4ekwrucc4q7t7#key-0"
  ],
  "service": [
    {
      "id": "did:btcr2:k1qgp5h79scv4sfqkzak5g6y89dsy3cq0pd2nussu2cm3zjfhn4ekwrucc4q7t7#service-0",
      "type": "SingletonBeacon",
      "serviceEndpoint": "bitcoin:tb1qtmshuqzeyr7cdh5t2nl6kf3s73fdynpj5apgtx"
    },
    {
      "id": "did:btcr2:k1qgp5h79scv4sfqkzak5g6y89dsy3cq0pd2nussu2cm3zjfhn4ekwrucc4q7t7#service-1",
      "type": "MapBeacon",
      "serviceEndpoint": "bitcoin:tb1pt97580gtfuge9mnrkvj2upk982alrr08pk4hhmlzkeutc06pt9pqyjqef2"
    },
    {
      "id": "did:btcr2:k1qgp5h79scv4sfqkzak5g6y89dsy3cq0pd2nussu2cm3zjfhn4ekwrucc4q7t7#service-2",
      "type": "SMTBeacon",
      "serviceEndpoint": "bitcoin:tb1pgrn7wxhtlsakjjelag6usrmzw89h8tnsaq2ly50ty29hujerqu0sk5kv4e"
    }
  ]
}
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

A [BTCR2 Unsigned Update] is a map data structure with the following properties:

- `@context`: A context array containing the following context URLs:
  - `"https://w3id.org/zcap/v1"`
  - `"https://w3id.org/security/data-integrity/v2"`
  - `"https://w3id.org/json-ld-patch/v1"`
  - `"https://btcr2.dev/context/v1"`
- `patch`: A JSON Patch {{#cite RFC6902}} object that defines a set of transformations to be
  applied to a DID document. The result of applying the patch MUST be a conformant DID document
  according to the DID core v1.1 specification {{#cite DID-CORE}}.
- `targetVersionId`: The versionId of the DID document after the patch has been applied. The
  targetVersionId MUST be one more than the versionId of the DID document being updated.
- `sourceHash`: A SHA-256 hash of the DID document that the patch MUST be applied to. The hash MUST
  be produced by the [JSON Document Hashing] algorithm.
- `targetHash`: A SHA-256 hash of the DID document that results from applying the patch to the
  source document. The hash MUST be produced by the [JSON Document Hashing] algorithm.

{% set hide_text = `` %}
{% set ex_btcr2_unsigned_update = 
`
~~~json
{
  "@context": [
    "https://w3id.org/security/v2",
    "https://w3id.org/zcap/v1",
    "https://w3id.org/json-ld-patch/v1",
    "https://btcr2.dev/context/v1"
  ],
  "patch": [
    {
      "op": "add",
      "path": "/verificationMethod/1",
      "value": {
        "id": "did:btcr2:x1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54#key-1",
        "type": "Multikey",
        "controller": "did:btcr2:x1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54",
        "publicKeyMultibase": "zQ3shSnvxNK94Kpux1sp8RCWfn4dTFcAr1fZLf7E3Dy19mEBi"
      }
    },
    {
      "op": "add",
      "path": "/authentication",
      "value": [
        "did:btcr2:x1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54#key-1"
      ]
    }
  ],
  "sourceHash": "8beuAJ8w88YWrms8hsqCnZn2atxBMGsQ7YBFhzPx5b2q",
  "targetHash": "F2F1pmK9tWAwzf6rKyVCietbswatFctvSJHM4sj1fiAw",
  "targetVersionId": 2,
  "proof": {
    "@context": [
      "https://w3id.org/security/v2",
      "https://w3id.org/zcap/v1",
      "https://w3id.org/json-ld-patch/v1",
      "https://btcr2.dev/context/v1"
    ],
    "type": "DataIntegrityProof",
    "cryptosuite": "bip340-jcs-2025",
    "verificationMethod": "did:btcr2:x1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54#key-0",
    "proofPurpose": "capabilityInvocation",
    "capability": "urn:zcap:root:did%3Abtcr2%3Ax1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54",
    "capabilityAction": "Write",
    "proofValue": "zNgANukLD9rKeH7PDcwNaNmRyGWo8wYBNaFE7xmGx6erWPGNzKKNH7ZXG8EwLRaK3EfpJ5o3F6ab8gLzWAZYrZL4"
  }
}
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

A [BTCR2 Signed Update] is a map data structure with the same properties as [BTCR2 Unsigned Update]
and one additional property, `proof`: a [Data Integrity Proof (data structure)].


## Data Integrity Proof { #data-integrity-proof }

A Data Integrity {{#cite VC-DATA-INTEGRITY}} proof with the `proofPurpose` set to
`"capabilityInvocation"`. This proof MUST be a valid invocation of the capability to update the DID
document of the **did:btcr2** identifier being resolved.

The following properties MUST be included in the Data Integrity proof:

- `@context`: A context array containing the follow context URLs:
  - `"https://w3id.org/security/v2"`
  - `"https://w3id.org/zcap/v1"`
  - `"https://w3id.org/json-ld-patch/v1"`
  - `"https://btcr2.dev/context/v1"`
- `type`: The string `"DataIntegrityProof"`
- `cryptosuite`: The string `"bip340-jcs-2025"`
- `verificationMethod`: A valid `verificationMethod` reference that exists in the most recent DID
  document
  <!--
    TODO: It SEEMS that the `verificationMethod` also needs to be included in the
    `capabilityInvocation` set within the DID document. Otherwise, it is possible to invoke a
    capability using a verification method that does not have a linked verification relationship
    according to https://www.w3.org/TR/cid-1.0/#capability-invocation
    AND the verifier (e.g. resolver) needs to make this assertion before applying the update.
  -->
- `proofPurpose`: The string `"capabilityInvocation"`
- `capability`: A URN of the following format: `urn:zcap:root:${encodeURIComponent(DID)}`
- `capabilityAction`: A string declaring the action required for the capability invocation. The
  string MUST be set to `"Write"`.
- `proofValue`: MUST be a detached Schnorr signature produced according to {{#cite BIP340}}, encoded
  using the "base64url" {{#cite RFC4648}} encoding.


{% set hide_text = `` %}
{% set ex_di_proof = 
`
~~~json
{
  "@context": [
    "https://w3id.org/security/v2",
    "https://w3id.org/zcap/v1",
    "https://w3id.org/json-ld-patch/v1",
    "https://btcr2.dev/context/v1"
  ],
  "type": "DataIntegrityProof",
  "cryptosuite": "bip340-jcs-2025",
  "verificationMethod": "did:btcr2:x1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54#key-0",
  "proofPurpose": "capabilityInvocation",
  "capability": "urn:zcap:root:did%3Abtcr2%3Ax1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54",
  "capabilityAction": "Write",
  "proofValue": "zNgANukLD9rKeH7PDcwNaNmRyGWo8wYBNaFE7xmGx6erWPGNzKKNH7ZXG8EwLRaK3EfpJ5o3F6ab8gLzWAZYrZL4"
}
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

## Root Capability { #root-capability }

A Root Capability is an Object Capability used to authorize updates to a DID document. It is
RECOMMENDED to use ZCAP-LD for capability invocations {{#cite ZCAP-LD}}.

The Root Capability MUST be a map containing only the following fields:

- `@context`: The string `"https://w3id.org/zcap/v1"`
- `id`: A URN of the following format: `urn:zcap:root:${encodeURIComponent(DID)}`
- `invocationTarget`: The `DID`
- `controller`: The `DID`

{% set hide_text = `` %}
{% set ex_root_capability = 
`
~~~json
{
  "@context": "https://w3id.org/zcap/v1",
  "id": "urn:zcap:root:did%3Abtcr2%3Ax1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54",
  "invocationTarget": "did:btcr2:x1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54",
  "controller": "did:btcr2:x1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54"
}
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

## resolutionOptions { #resolution-options }

## Sidecar Data { #sidecar-data }

## SMT Proof { #smt-proof }

## didResolutionMetadata { #did-resolution-metadata }

## didDocumentMetadata { #did-document-metadata }

## MapAnnouncement { #map-announcement }

This is a JSON object that maps DIDs to hashed [BTCR2 Signed Updates][BTCR2 Signed Update]. It MUST be hashed with [JSON Document Hashing]. This
object will be published to a CAS.


## Example type system things

```rust
ResolutionOptions {
  version_id: u32,
  version_time: DateTime<Utc>,
  sidecar_data: SidecarDataGeneric,
}
SMTProof {
  leaf: Hash,
  nonce: Option<Hash>,
  path: Vector<Hash>
}
MapAnnouncement { Map<DID, Hash> }
SidecarDataGeneric {
  cas_manifest   : Option<Vector<Hash>>,
  genesis_diddoc : Option<IntermediateDiddoc>,
  updates        : Vector<DocUpdateSigned>,
  map_updates    : Option<Vector<MapAnnouncement>>,
  smt_proofs     : Option<Vector<SMTProof>>,
}
```

## Discussion

The cas_manifest is an optimization so that the resolver can start network round trips immediately.


{{#include ./includes/includes.md}}
