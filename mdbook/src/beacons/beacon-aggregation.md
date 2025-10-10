{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}

# Beacon Aggregation

Aggregation is how **did:btcr2** minimizes on-chain transactions when updating DID documents. DID controllers can use [Aggregate Beacons][Aggregate Beacon], such as [CAS Beacon] and [SMT Beacon], rather than one transaction per [BTCR2 Update]. [Aggregate Beacons][Aggregate Beacon] broadcast [Beacon Signals][Beacon Signal] that contain updates for any number of DIDs.

<!-- todo: maybe a nice little diagram -->

<!-- TODO: This is a really long sentence! Edit it down! -->

The coordination protocol between an aggregator and [Beacon Participants][Beacon Participant] is out of scope, but the result of their interactions is a trusted [Beacon Signal] on the Bitcoin blockchain announcing updates approved by all members of the cohort.


## Bikeshed Header Title (Join Cohort and Establish Aggregate Beacon Service)

DID controllers that wish to join a [Beacon Cohort] and become a [Beacon Participant] MUST provide the aggregator with a Schnorr public key.

The aggregator coordinates the construction of an n-of-n Pay-to-Taproot address as the [Beacon Address], where each [Beacon Participant's][Beacon Participant] public key is one of the n keys. This ensures that all on-chain [Beacon Signals][Beacon Signal] are cryptographically signed by every [Beacon Participant], while the aggregator remains minimally trusted.

A given cohort may fail because other participants stop participating or the aggregator is compromised; however, the consequences are limited to the failure of the [Aggregate Beacon] to broadcast [Beacon Signals] that announce [BTCR2 Updates][BTCR2 Update].

The aggregator decides when to finalize the membership of the [Beacon Cohort]. Once finalized, the aggregator MUST compute an n-of-n Pay-to-Taproot address from the public keys the [Beacon Participants][Beacon Participant] provided. This is the [Beacon Address] and MUST be sent to all participants, along with the set of keys used to construct this address. [Beacon Participants][Beacon Participant] SHOULD verify the address for themselves, and confirm that the key they provided is in the set of keys used to construct the address.

Once DID controllers have verified the [Beacon Address], they MAY construct the `service` object that can be included within their DID document's service array.


## Bikeshed Header Title (Announce DID Update)

This protocol ensures that NEITHER the [Beacon Aggregator Service] NOR other [Beacon Participants][Beacon Participant] are able to compromise or invalidate a **did:btcr2** identifier.

