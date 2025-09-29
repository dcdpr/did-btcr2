
`did:btcr2` is a censorship-resistant Decentralized Identifier (DID) method using the Bitcoin
blockchain as a Verifiable Data Registry to announce changes to the DID document. It supports
zero-cost off-chain DID creation; aggregated updates for scalable on-chain update costs; long-term
identifiers that can support frequent updates; private communication of the DID document; private
DID resolution; and non-repudiation.

<hr>

# Introduction and Motivation

Public digital identity was introduced to the Internet through Pretty
Good Privacy’s (PGP) foundational legal work in the 1990s. With
Decentralized Identifiers (DIDs), digital identity can be preserved
through a rotation of key material, without relying on a centralized
party. This specification defines did:btcr2, a DID method designed and
motivated by the following considerations:

## Anti-censorship

Bitcoin is the world’s oldest and most reliable censorship-resistant
network. Our primary motivation is to leverage the anti-censorship
capability of Bitcoin to enable individuals to control decentralized
identifiers without interference by centralized players. That means
creating a W3C conformant DID method capable of creating identifiers
usable for a range of verifiable interactions, including issuing
Verifiable Credentials and proving that the current presenter is the
subject of a Verifiable Credential. This DID method gives organizations
and states the ability to anchor private attestations to identifiers
under individuals’ direct control, giving humans an unprecedented
ability to participate in digital interactions on their own terms, using
the identifiers they choose, when they choose.

## Privacy

The first DID method anchoring on the Bitcoin blockchain, did:btcr,
focused on censorship resistance. However, self-sovereign identity is
not complete without options for privacy as well, and the initial
promise of privacy in the DID ecosystem was dubious, with heavy reliance
on public DID documents. There has been a presumption that anyone who
has the DID itself should be able to resolve it to get the current DID
document. This presumption places more information in the public eye
than is strictly necessary for securing interactions related to the DID.

To tackle reliance on public DID documents head-on, this DID method
introduces private DID documents, in which resolving the DID requires
additional information delivered either alongside or in a separate
communication from the DID controller. We call this transfer Sidecar
delivery. Our approach ensures that successful resolution ALWAYS results
in the same DID document for all parties, so that every party in the
ecosystem sees the same cryptographically anchored result.

## Late Publishing

Many DID methods lack verifiable provenance: it is simply impossible to
reconstruct a cryptographically verifiable history of updates. Instead,
they use a Verifiable Data Registry that can rewrite history. Bitcoin’s
blockchain is the premiere global network for immutably anchoring
information to a specific time. This DID method ensures that every BTCR2
DID is anchored on a single, canonical, immutable history for the
lifetime of the DID. It is simply not possible for anyone to modify the
history of the DID. We call this feature Non-Repudiation.

## Offline Creation

Finally, we wanted to support the creation of DIDs without requiring
on-chain interactions. BTCR creation depended on getting a transaction
on-chain. BTCR2 supports creating DIDs with sophisticated DID documents
without registering them on-chain. In fact, all BTCR2 DIDs start with
offline creation. Only updates to the DID document require on-chain
interactions. Our approach supports both key-based deterministic DIDs
and document-based deterministic DIDs. In key-based DIDs, the DID itself
contains everything you need to bootstrap an initial DID Document with
usable verification methods suitable for authentication, attestation,
and capability invocation and delegation. For document-based DIDs,
additional Sidecar Data - a Genesis Document - must be used to create
the Initial DID document. Offline creation allows unlimited DID creation
and use without requiring any on-chain or online interactions, making it
suitable for a wide range of high-volume, low cost use cases.

