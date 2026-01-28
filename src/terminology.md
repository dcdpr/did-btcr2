{% import "includes/links.tera" as links %}

{{ links::include() }}


# Terminology

## Aggregate Beacon { #aggregate-beacon }

A collection of [BTCR2 Updates][BTCR2 Update] can optionally be aggregated into a single
[Beacon Signal] by an [Aggregation Service] for multiple entities (possibly controlling
multiple DIDs and possibly posting multiple updates).

There can only ever be one [BTCR2 Update] per **did:btcr2** DID in a [Beacon Signal] from an
Aggregate Beacon.

## Aggregation Cohort { #aggregation-cohort }

The set of [Aggregation Participants][Aggregation Participant] within an [Aggregate Beacon].

## Aggregation Participant { #aggregation-participant }

A member of an [Aggregation Cohort], typically a DID controller, that controls cryptographic keys
required to partially authorize spends from a [Beacon Address].

## Aggregation Service { #aggregation-service }

The entity that coordinates the protocols of an [Aggregate Beacon] in order to establish a
[Aggregation Cohort] and aggregate [BTCR2 Update Announcements][BTCR2 Update Announcement] in a
[Beacon Signal].

## Authorized Beacon Signal { #authorized-beacon=signal }

An Authorized Beacon Signal is a [Beacon Signal] from a [BTCR2 Beacon] with a [Beacon Address]
in a then-current DID document.

## Beacon Address { #beacon-address }

The Bitcoin address of a [BTCR2 Beacon]. Spends of [UTXO] controlled by this address are identified
as [Beacon Signals][Beacon Signal].

## Beacon Announcement Map { #beacon-announcement-map }

A document that maps **did:btcr2** identifiers to [BTCR2 Update Announcements][BTCR2 Update
Announcement]. This is used to distinguish which [BTCR2 Update Announcement] applies to
which **did:btcr2** identifier.

## Beacon Signal { #beacon-signal }

Beacon Signals are Bitcoin transactions that spend from a [Beacon Address] and include a
transaction output of the format defined in [Signal Bytes]. Beacon Signals announce one or more
[BTCR2 Updates][BTCR2 Update] and provide a means for these updates to be validated against the
Beacon Signal.

The type of the [BTCR2 Beacon] determines how these Beacon Signals are constructed and processed to
validate a set of [BTCR2 Updates][BTCR2 Update] against the [Signal Bytes] contained within the
Beacon Signal.

## Beacon Type { #beacon-type }

The type of a [BTCR2 Beacon]. The Beacon Type defines how [BTCR2 Update Announcements][BTCR2 Update
Announcement] are included within a [Beacon Signal] broadcast on the Bitcoin network. It also
defines how the content committed within [BTCR2 Update Announcements][BTCR2 Update Announcement]
can be validated against the [Beacon Signal].

## BTCR2 Beacon { #btcr2-beacon }

A service listed in a BTCR2 DID document that informs resolvers how to find authentic updates to the
DID. It MUST be either a [Singleton Beacon], [SMT Beacon], or a [CAS Beacon].

## BTCR2 Update { #btcr2-update }

A data structure used for transforming a source DID document into a target DID document. It contains
a JSON Patch {{#cite RFC6902}} object, a version number for the target DID document, and SHA-256
hashes for the source and target DID documents.

## BTCR2 Unsigned Update { #btcr2-unsigned-update }

A [BTCR2 Update] without a proof attached to it.

Example: [BTCR2 Unsigned Update (data structure)].

## BTCR2 Update Announcement { #btcr2-update-announcement }

A 32-byte SHA-256 hash committing to a [BTCR2 Update] that has been broadcast by a [BTCR2 Beacon] in
a DID's then-[Authorized Beacon Signal]. [Beacon Signals][Beacon Signal] can optionally aggregate
one or more BTCR2 Update Announcements. How [Beacon Signals][Beacon Signal] aggregate announcements
is defined by the [Beacon Type].

## BTCR2 Signed Update { #btcr2-signed-update }

A [BTCR2 Update] with a proof attached to it.

A capability invocation secured using Data Integrity {{#cite VC-DATA-INTEGRITY}} that invokes an authorization capability to
update a specific **did:btcr2** DID document. This capability invocation Data Integrity proof
secures the [BTCR2 Unsigned Update] document.

Example: [BTCR2 Signed Update (data structure)].

## CAS { #cas }

[Content Addressable Storage]

## CAS Beacon { #cas-beacon }

A type of [BTCR2 Beacon] which aggregates multiple
[BTCR2 Update Announcements][BTCR2 Update Announcement]. A [Beacon Signal] from a CAS Beacon commits
to a [Beacon Announcement Map].

## CID { #cid }

[Content Identifier]

## Content Addressable Storage { #content-addressable-storage }

Content Addressable Storage (CAS) is a data storage system where content is addressable using
[Content Identifiers][Content Identifier] (CIDs). The InterPlanetary File System (IPFS) is an
example of CAS.

## Content Identifier (CID) { #content-identifier }

An identifier for some digital content (e.g., a file) generated from the content itself such that
for any given content and CID generation algorithm there is a single, unique, collision-resistant
identifier. This is typically done through some hashing function.

## Current DID Document { #current-did-document }

The transient state of the DID document during DID resolution. The
Current DID Document is iteratively updated as a resolver traverses the blockchain and applies the relevant
[BTCR2 Updates][BTCR2 Update] announced by [Authorized Beacon Signals][Authorized Beacon Signal] it
identifies in specific Bitcoin blocks.

## Data Integrity Proof { #data-integrity-proof }

A digital signature added to a [BTCR2 Unsigned Update] in order to convert
to a [BTCR2 Signed Update].

The algorithm is specified in BIP340 Cryptosuites v0.1 {{#cite BIP340-Cryptosuite}} and Verifiable Credential Data Integrity 1.0 {{#cite VC-DATA-INTEGRITY}}.

## Genesis Bytes { #genesis-bytes }

The bytes used to generate a **did:btcr2** identifier. These bytes are either a 33-byte compressed 
Standards for Efficient Cryptography ({{#cite SEC2}}) encoded secp256k1 public key or a 32-byte SHA-256 hash 
of a [Genesis Document].

## Genesis Document { #genesis-document }

An intermediate representation of an [Initial DID Document] with the identifier set to the
placeholder value.

Example: [Genesis Document (data structure)].

## Initial DID Document { #initial-did-document }

The canonical, conformant version 1 of a DID document for a specific **did:btcr2** identifier.

Example: [Initial document (data structure)].

## Late Publishing { #late-publishing }

Late Publishing is the ability for DID updates to be revealed at a later point in time, which alters
the history of a DID document such that a state, that appeared valid before the reveal, appears
after Late Publishing to never have been valid. Late Publishing breaks [Non-Repudiation].

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

Offline Creation refers to when a **did:btcr2** identifier and corresponding [Initial DID Document]
are created without requiring network interactions.

**did:btcr2** supports Offline Creation in two modes:

* Key Pair Deterministic Creation; and
* DID Document Initiated Creation.

## Resolution Time { #resolution-time }

A Coordinated Universal Time (UTC) timestamp set when the resolver receives a resolution request.

## Schnorr Signature { #schnorr-signature }

An alternative to Elliptic Curve Digital Signature Algorithm (ECDSA) signatures with some major
advantages, such as being able to combine digital signatures from multiple parties to form a single
digital signature for the composite public key.

Bitcoin [Schnorr Signatures][Schnorr Signature] are still over the secp256k1 curve, so the same keypairs can be used to produce both [Schnorr Signatures][Schnorr Signature] and ECDSA signatures.

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
[Beacon Signal]. The script of this transaction output has the following form:

`[OP_RETURN, OP_PUSH_BYTES, <signal_bytes>]`

## Singleton Beacon { #singleton-beacon }

A type of [BTCR2 Beacon] whose [Beacon Signals][Beacon Signal] each contain a single [BTCR2 Update
Announcement].

## SMT { #smt }

[Sparse Merkle Tree]

## SMT Beacon { #smt-beacon }

A type of [BTCR2 Beacon] which aggregates multiple [BTCR2 Update Announcements][BTCR2 Update
Announcement] using an optimized [Sparse Merkle Tree].

A [Beacon Signal] from an SMT Beacon contains the root of an optimized [Sparse Merkle Tree].

## SMT Proof { #smt-proof }

A set of SHA-256 hashes for nodes in a [Sparse Merkle Tree] that together form a path from a leaf in
the tree to the Merkle root, proving that the leaf is in the tree.

## Sparse Merkle Tree { #sparse-merkle-tree }

A [Merkle Tree] data structure where each data point included at the leaf of the tree is indexed.

This data structure enables proofs of both inclusion and non-inclusion of data at a given index. The
instantiation in this specification has 2^256 leaves that are indexed by the SHA-256 hash of
a **did:btcr2** identifier.

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
