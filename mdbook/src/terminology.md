# Terminology

## Aggregate Beacon { #aggregate-beacon }

An Aggregate Beacon enables multiple entities (possibly controlling multiple DIDs and possibly
posting multiple updates) to collectively announce a set of [BTCR2 Updates][BTCR2 Update] in a
[Beacon Signal].

There can only ever be one [BTCR2 Update] per **did:btcr2** DID in a [Beacon Signal] from an
Aggregate Beacon.

## Authorized Beacon Signal { #authorized-beacon=signal }

An Authorized Beacon Signal is a [Beacon Signal] from a [BTCR2 Beacon] with a [BTCR2 Beacon] address
in a then-current DID document.

## Beacon Address { #beacon-address }

The Bitcoin address of a [BTCR2 Beacon]. Spends of [UTXO] controlled by this address are identified
as [Beacon Signals][Beacon Signal].

## Beacon Aggregator Service { #beacon-aggregator-service }

The entity that coordinates the protocols of an aggregate [BTCR2 Beacon] in order to establish a
[Beacon Cohort] and aggregate [BTCR2 Update Announcements][BTCR2 Update Announcement] in a
[Beacon Signal].

## Beacon Announcement Map { #beacon-announcement-map }

A document that maps **did:btcr2** identifiers to [BTCR2 Update Announcements][BTCR2 Update
Announcement]. This is used to distinguish which [BTCR2 Update Announcement] applies to
which **did:btcr2** identifier.

## Beacon Cohort { #beacon-cohort }

The set of unique DIDs participating in a [BTCR2 Beacon]. [Beacon Participants][Beacon Participant]
are required to authorize spends from the [Beacon Address].

## Beacon Participant { #beacon-participant }

A member of a [Beacon Cohort], typically a DID controller, that controls cryptographic keys required
to partially authorize spends from a [Beacon Address].

## Beacon Signal { #beacon-signal }

Beacon Signals are Bitcoin transactions that spend from a [BTCR2 Beacon] address and include a
transaction output of the format `[OP_RETURN, OP_PUSH_BYTES, <32_bytes>]`. Beacon Signals announce
one or more [BTCR2 Updates][BTCR2 Update] and provide a means for these updates to be validated
against the Beacon Signal.

The type of the [BTCR2 Beacon] determines how these Beacon Signals are constructed and processed to
validate a set of [BTCR2 Updates][BTCR2 Update] against the 32 bytes contained within the Beacon
Signal.

## Beacon Type { #beacon-type }

The type of a [BTCR2 Beacon]. The Beacon Type defines how [BTCR2 Update Announcements][BTCR2 Update
Announcement] are included within a [Beacon Signal] broadcast on the Bitcoin network. It also
defines how the content committed within [BTCR2 Update Announcements][BTCR2 Update Announcement]
can be validated against the [Beacon Signal].

## BTCR2 Beacon { #btcr2-beacon }

A service listed in a BTCR2 DID document that informs resolvers how to find authentic updates to the
DID. It must be either a [Singleton Beacon], [SMT Beacon], or a [Map Beacon].

## BTCR2 Signed Update { #btcr2-signed-update }

A [BTCR2 Update] with a proof attached to it.

<!-- I want to remove this notion of capability invocation. -->

A capability invocation secured using Data Integrity that invokes an authorization capability to
update a specific **did:btcr2** DID document. This capability invocation Data Integrity proof
secures the [BTCR2 Unsigned Update] document.

## BTCR2 Unsigned Update { #btcr2-unsigned-update }

A [BTCR2 Update] without a proof attached to it.

## BTCR2 Update { #btcr2-update }

A data structure used for transforming a source DID document into a target DID document. It contains
a JSON Patch {{#cite RFC6902}} object, a version number for the target DID document, and SHA256
hashes for the source and target DID documents.

## BTCR2 Update Announcement { #btcr2-update-announcement }

A 32-byte SHA256 hash committing to a [BTCR2 Update] that has been broadcast by a [BTCR2 Beacon] in
an [Authorized Beacon Signal]. [Beacon Signals][Beacon Signal] can include one or more BTCR2 Update
Announcements. How [Beacon Signals][Beacon Signal] include announcements is defined by the
[Beacon Type].

## Contemporary DID Document { #contemporary-did-document }

The DID document that is contemporary with a Bitcoin block at a specific block-height. The
Contemporary DID Document changes as a resolver traverses the blockchain and applies the relevant
[BTCR2 Updates][BTCR2 Update] announced by [Authorized Beacon Signals][Authorized Beacon Signal] it
identifies in specific Bitcoin blocks.

## Content Addressable Storage { #content-addressable-storage }

Content Addressable Storage (CAS) is a data storage system where content is addressable using
[Content Identifiers][Content Identifier] (CIDs). The InterPlanetary File System (IPFS) is an
example of CAS.

## CAS { #cas }

[Content Addressable Storage]

## Content Identifier (CID) { #content-identifier }

An identifier for some digital content (e.g., a file) generated from the content itself such that
for any given content and CID generation algorithm there is a single, unique, collision-resistant
identifier. This is typically done through some hashing function.

## CID { #cid }

[Content Identifier]

## Genesis Bytes { #genesis-bytes }

The bytes used to generate a did:btcr2 identifier. These bytes are either a 33-byte compressed SEC
encoded sec256k1 public key or a 32-byte SHA256 hash of a [Genesis Document].

## Genesis Document { #genesis-document }

An intermediate representation of an [Initial DID Document] with the identifier set to the
placeholder value.

Example:
```json
{
  "@context": [
    "https://www.w3.org/TR/did-1.1",
    "https://btcr2.dev/context/v1"
  ],
  "id": "did:btcr2:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "verificationMethod": [
    {
      "id": "did:btcr2:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#key-0",
      "type": "Multikey",
      "controller": "did:btcr2:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "publicKeyMultibase": "zQ3shSnvxNK94Kpux1sp8RCWfn4dTFcAr1fZLf7E3Dy19mEBi"
    }
  ],
  "assertionMethod": [
    "did:btcr2:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#key-0"
  ],
  "capabilityInvocation": [
    "did:btcr2:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#key-0"
  ],
  "service": [
    {
      "id": "did:btcr2:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#service-0",
      "type": "SingletonBeacon",
      "serviceEndpoint": "bitcoin:tb1qtmshuqzeyr7cdh5t2nl6kf3s73fdynpj5apgtx"
    },
    {
      "id": "did:btcr2:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#service-1",
      "type": "MapBeacon",
      "serviceEndpoint": "bitcoin:tb1pt97580gtfuge9mnrkvj2upk982alrr08pk4hhmlzkeutc06pt9pqyjqef2"
    },
    {
      "id": "did:btcr2:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#service-2",
      "type": "SMTBeacon",
      "serviceEndpoint": "bitcoin:tb1pgrn7wxhtlsakjjelag6usrmzw89h8tnsaq2ly50ty29hujerqu0sk5kv4e"
    }
  ]
}
```

## Initial DID Document { #initial-did-document }

The canonical, conformant version 1 of a DID document for a specific **did:btcr2** identifier.

[todo] Make sure this example is re-done to have a real DID.

Example:
```json
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
```

## Late Publishing { #late-publishing }

Late Publishing is the ability for DID updates to be revealed at a later point in time, which alters
the history of a DID document such that a state, that appeared valid before the reveal, appears
after Late Publishing to never have been valid. Late Publishing breaks [Non-Repudiation].

## Map Beacon { #map-beacon }

A type of [BTCR2 Beacon] which aggregates multiple [BTCR2 Update Announcements]. A [Beacon Signal]
from a Map Beacon commits to a [Beacon Announcement Map].

## Merkle Tree { #merkle-tree }

A tree data structure in which the leaves are a hash of a data block and every node that is not a
leaf is a hash of its child node values.

The root of a Merkle Tree is a single hash that is produced by recursively hashing the child nodes
down to the leaves of the tree. Given the root of a Merkle Tree it is possible to provide a Merkle
path that proves the inclusion of some data in the tree.

## Non-Repudiation { #non-repudiation }

Non-Repudiation is a feature of DID methods that can clearly state that all data is available to
present one canonical history for a DID.

If some data is needed but not available, the DID method MUST NOT allow DID resolution to complete.
Any changes to the history, such as may occur if a website edits a file, MUST be detected and
disallowed. The [Late Publishing] problem breaks Non-Repudiation.

## Offline Creation { #offline-creation }

Offline Creation refers to when a **did:btcr2** identifier and corresponding initial DID document
are created without requiring network interactions.

**did:btcr2** supports offline creation in two modes:

* Key Pair Deterministic Creation; and
* DID Document Initiated Creation.

## Resolution Time { #resolution-time }

A Coordinated Universal Time (UTC) timestamp set when the resolver receives a resolution request.

## Schnorr Signature { #schnorr-signature }

An alternative to Elliptic Curve Digital Signature Algorithm (ECDSA) signatures with some major
advantages, such as being able to combine digital signatures from multiple parties to form a single
digital signature for the composite public key.

Bitcoin Schnorr signatures are still over the secp256k1 curve, so the same keypairs can be used to
produce both Schnorr signatures and ECDSA signatures.

## Sidecar { #sidecar }

A mechanism by which data necessary for resolving a DID is provided alongside the **did:btcr2**
identifier being resolved, rather than being retrieved through open and standardized means (e.g., by
retrieving from IPFS).

To explain the metaphor, a sidecar on a motorcycle brings along a second passenger in a transformed
vehicle, the same way the DID controller MUST bring along the DID document history to transform the
situation into one that is verifiable.

## Sidecar Data { #sidecar-data }

Data transmitted via [Sidecar].

## Signal Bytes { #signal-bytes }

The 32 bytes of information that are included within the last transaction output of a
[Beacon Signal]. The script of this transaction output has the following form
`[OP_RETURN, OP_PUSH_BYTES, <32 signal bytes>]`.

## Singleton Beacon { #singleton-beacon }

A type of [BTCR2 Beacon] whose [Beacon Signals][Beacon Signal] each contain a single [BTCR2 Update
Announcement]. See [Singleton Beacon] for more.

## SMT Beacon { #smt-beacon }

A type of [BTCR2 Beacon] which aggregates multiple [BTCR2 Update Announcements][BTCR2 Update
Announcement] using an optimized [Sparse Merkle Tree].

A [Beacon Signal] from an SMT Beacon contains the root of an optimized [Sparse Merkle Tree]. See
[SMT Beacon] for more.

## Sparse Merkle Tree { #sparse-merkle-tree }

A [Merkle Tree] data structure where each data point included at the leaf of the tree is indexed.

This data structure enables proofs of both inclusion and non-inclusion of data at a given index. The
instantiation in this specification has 2^256 leaves that are indexed by the SHA256 hash of
a **did:btcr2** identifier.

## SMT { #smt }

[Sparse Merkle Tree]

## SMT Proof { #smt-proof }

A set of SHA256 hashes for nodes in a [Sparse Merkle Tree] that together form a path from a leaf in
the tree to the Merkle root, proving that the leaf is in the tree.

## Unsigned Beacon Signal { #unsigned-beacon-signal }

The Bitcoin transaction of the [Beacon Signal] before its transaction inputs have been signed,
effectively spending these inputs.

## Unspent Transaction Output (UTXO) { #unspent-transaction-output }

A Bitcoin transaction takes in transaction outputs as inputs and creates new transaction outputs
potentially controlled by different addresses. An Unspent Transaction Output (UTXO) is a
transaction output from a Bitcoin transaction that has not yet been included as an input, and hence
spent, within another Bitcoin transaction.

## UTXO { #utxo }

[Unspent Transaction Output]


{{#include ./includes/includes.md}}
