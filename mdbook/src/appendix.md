{% import "includes/links.tera" as links %}

{{ links::include() }}

# Appendix

<!-- TODO: Some filler texts that provides basic context for this overall section -->

## BTCR2 Update Aggregation

### No Privileged Role

Although update aggregation in **did:btcr2** does depend on some party (or protocol) acting as the [Aggregation Service] (i.e., coordinator and publisher) of [Beacon Signals][Beacon Signal], that role may be satisfied by any party. To ensure that the [Aggregation Service] gains no specific benefit with regard to the authority to publish a [Beacon Signal], those participating in aggregation SHOULD use a protocol that ensures every [Aggregation Participant] in the [Aggregation Cohort] has explicitly signed the [Beacon Signal] itself. It is RECOMMENDED that [Aggregate Beacons][Aggregate Beacon] use a [Beacon Address] that requires an n-of-n [Schnorr Signature] where each [Aggregation Participant] explicitly signs in a provable manner.

### Worst Case

Since aggregation depends on others, it should be expected that any given [BTCR2 Beacon] might fail. Perhaps the [Aggregation Service] stops providing the service or a peer in the [Aggregation Cohort] stops signing their portion of the [Beacon Signal]. The best practice to avoid complete failure is to have at least one [Singleton Beacon] in every DID document, ensuring a fallback mechanism should all [Aggregate Beacons][Aggregate Beacon] fail.

However, even in the case of failure at the aggregation layer, only two negative consequence are possible:

1. If the [Beacon Signal] does not require n-of-n signing, a hostile [Aggregation Cohort] (or [Aggregation Service]) could invalidate the DID by publishing a [Beacon Signal] with a malformed update.

2. When the [Beacon Signal] does require n-of-n signing, a hostile [Aggregation Cohort] (or [Aggregation Service]) could render that Beacon inoperable, preventing publication of [BTCR2 Updates][BTCR2 Update] through that address. However, this has no effect on other beacons.

In no case is it possible for a [Beacon Participant] other than the DID controller to compromise the DID document itself. All [BTCR2 Updates][BTCR2 Update] remain cryptographically secured. Compromising the DID document requires compromising the controller's key store: a threat which is already the primary attack vector for compromising DIDs. No new threats to DID document provenance are created by aggregation.
