{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Security Considerations { #security-considerations }

## Late Publishing

**did:btcr2** was designed to avoid [Late Publishing] such that, independent of when a resolution occurs, the DID document history and provenance are guaranteed to be invariant. Resolvers MUST enforce strict ordering of the [BTCR2 Updates][BTCR2 Update] and process all relevant [Beacon Signals][Beacon Signal].

## Invalidation Attacks

Invalidation attacks are where adversaries are able to publish [Beacon Signals][Beacon Signal] that claim to contain updates for DIDs they do not control. Due to the requirement for processing all relevant [Beacon Signals][Beacon Signal], if these updates cannot be retrieved by a resolver, the DID MUST be considered invalid. To prevent these attacks, all [Beacon Signals][Beacon Signal] SHOULD be authorized by signatures: either from the DID controller when using a [Singleton Beacon] or with a `n-of-n` multisignature from all `n` members of an [Aggregation Cohort] when using an [Aggregate Beacon]. DID controllers SHOULD verify the updates announced within a [Beacon Signal] before authorizing it.

## Deployment Considerations

### Data Retention

[BTCR2 Updates][BTCR2 Update] MUST be available to resolver at the time of resolution. It is the responsibility of DID controllers to persist this data, otherwise the consequence is that the DID MAY not be resolvable (depending on data accessibility from the perspective of the resolver). DID controllers MAY store [BTCR2 Updates][BTCR2 Update] on a [CAS] system. DID controllers SHOULD consider that in some constrained environments it is preferable to discard a DID and replace it with a newly issued DID, rather than rotating a key.

### Aggregate Beacon Address Verification

A [Beacon Address] of an [Aggregate Beacon] SHOULD be an `n-of-n` Pay-to-Taproot (P2TR) address, with a key contributed to the `n` by each of the participants in an [Aggregation Cohort]. DID controllers participating in an [Aggregation Cohort] SHOULD verify the [Beacon Address] is an `n-of-n` and that one of the `n` keys is the key that they provided to the [Aggregation Service]. This can be achieved only by constructing the [Beacon Address] for themselves using the set of keys from the [Aggregation Cohort] that SHOULD be provided by the [Aggregation Service].

### Aggregate Beacon Signal Verification

When submitting [Beacon Signals][Beacon Signal] to [Aggregation Services][Aggregation Service], a DID controller will either: announce an [BTCR2 Update] for their DID or not. The DID controller SHOULD verify that the [Beacon Signal] announces the [BTCR2 Update] they expect (or no [BTCR2 Update]) for all [Beacon Signals][Beacon Signal] broadcast by [Aggregation Services][Aggregation Service] before final authorization. If they do not, then invalidation attacks become possible where a [Beacon Signal] announces a [BTCR2 Update] that cannot be retrieved for a particular DID, causing the DID to be invalidated.

### Key Compromise

In **did:btcr2**, cryptographic keys authorize both [BTCR2 Updates][BTCR2 Update] and [Beacon Signals][Beacon Signal]. Should these keys get compromised without the DID controller's knowledge, it would be possible for an adversary to take control of a DID by submitting a [BTCR2 Update] to a [BTCR2 Beacon] that replaces key material and [BTCR2 Beacons][BTCR2 Beacon] in the DID document for ones under the adversary's control. Such an attack would be detectable by the DID controller, as they would see a valid spend from a [BTCR2 Beacon] that they did not authorize. Additionally, if the DID relied on [Sidecar Data], without access to this data the DID would be useless to the adversary as they would be unable to demonstrate a valid complete history of the DID during resolution.

### Cryptographic Compromise

The security of **did:btcr2** identifiers depends on the security of [Schnorr Signatures][Schnorr Signature] over the secp256k1 curve. It is this signature scheme that is used to secure both the [Beacon Signals][Beacon Signal] and [BTCR2 Updates][BTCR2 Update]. Should vulnerabilities be discovered in this scheme or if advancements in quantum computing compromise its cryptographic foundations, the **did:btcr2** method would become obsolete.

### Bitcoin Blockchain Compromise

The security of **did:btcr2** identifiers depends on the security of the Bitcoin blockchain. Should the Bitcoin blockchain become compromised such that its history could be rewritten, for example through a 51% attack, then [Beacon Signals][Beacon Signal] that were once part of the blockchain could be removed or replaced – although the longer these [Beacon Signals][Beacon Signal] have been included in the blockchain the more difficult this becomes. A 51% attack could prevent future [Beacon Signals][Beacon Signal] from being included within the network, however this would require the 51% attack to remain indefinitely enforced. Furthermore, without key compromise related to a specific DID, the compromise of the Bitcoin blockchain would not enable adversarial parties to take control of a DID.
