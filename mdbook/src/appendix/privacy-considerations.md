{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Privacy Considerations

## Design Considerations

### Updates Can Be Private

**did:btcr2** was designed such that updates to Decentralized Identifier (DID) documents are NOT REQUIRED to be public. Bitcoin is used to publicly announce and anchor updates to DID documents, however the updates themselves can be kept private by DID controllers and provided through a [Sidecar] mechanism at Resolution Time.

### DID Documents Can Be Private

Since updates to DID documents are NOT REQUIRED to be public, neither are **did:btcr2** DID documents. A **did:btcr2** DID document is an initial document plus a series of updates to that DID document. To keep the DID document fully private, the DID controller can choose to use an externally resolved initial **did:btcr2** and not place the initial DID document on a [Content Addressable Storage] (CAS) system such as the InterPlanetary File System (IPFS). The initial DID document can be provided at Resolution Time through a [Sidecar] mechanism along with the collection of [BTCR2 Updates][BTCR2 Update] that can be verified against the relevant [Beacon Signals][Beacon Signal] for the DID being resolved.

### Offline DID Creation

**did:btcr2** was designed to support offline creation, that is, the generation of a **did:btcr2** identifier and associated DID document without any network calls to the Bitcoin blockchain. This is possible in both deterministic and externally resolvable DIDs.

### Aggregation Services Only Need Hashes

[Aggregation Services][Aggregation Service] in **did:btcr2** are entities that coordinate [Aggregate Beacons][Aggregate Beacon] and the corresponding [Beacon Signals][Beacon Signal] that announce and anchor an aggregated set of [BTCR2 Updates][BTCR2 Update]. However, in **did:btcr2**, aggregators are able to coordinate [Beacon Signals][Beacon Signal] without needing to view or validate DID documents or the updates. Instead, they are provided with a hash or [Content Identifier] (CID) of the update for a specific DID which they include in the [Beacon Signal] according to the type of the [BTCR2 Beacon].

### Consensus Splits Break Non-Repudiation

Because [Non-Repudiation] requires following a complete stream of updates to a DID, any consensus forks in which DID updates to apply can be used to permanently diverge the history for a DID, and thus the key material, creating alternate attestation histories.

As a concrete example, a seemingly small difference between two clients in interpretation of the specification could be used fraudulently to sign a loan in one history and claim that it was never signed in another history.

In order to prevent consensus splits, **did:btcr2** needs a particularly good test suite. It MUST be designed to challenge all the foreseeable edge cases as well as maintained to find new ones.

## Deployment Considerations

### CAS Systems Lack Privacy

Specifically, in this context, the relevant content are [BTCR2 Updates][BTCR2 Update] being stored in [Content Addressable Storage] ([CAS]) such as IPFS. These SHOULD be considered public. Anyone MAY retrieve this information (assuming they have the [CID]) and use it to track the DID over time. IPFS node operators would have access to all content stored on IPFS and could choose to index certain data like [BTCR2 Updates][BTCR2 Update], including the updates posted by a [BTCR2 Beacon] connected to a specific DID. This MAY advertise information about the DID that the controller wishes to remain private.

Those parties most concerned about privacy SHOULD maintain their [BTCR2 Updates][BTCR2 Update] in a [Sidecar] manner and provide them to necessary parties during resolution. It is RECOMMENDED not to include any sensitive data other than the necessary DID update data.

### Aggregation Participants Provide DIDs to Aggregation Services

Within [SMT Beacons][SMT Beacon], the DID is used as a path to an [SMT] leaf node. The [Aggregation Service] MUST know these paths to be able to construct the tree and generate the correct proof paths. Within [CAS Beacons][CAS Beacon], the [Aggregation Service] MUST construct a [CAS Announcement (data structure)]. This means that for both types of [Aggregate Beacons][Aggregate Beacon], the [Aggregation Service] necessarily MUST know all DIDs in the [Aggregation Cohort].

### All DIDs are Visible to CAS Beacon Aggregation Cohort

[Aggregation Cohort] members participating in a [CAS Beacon] learn all DIDs that are updated in each [Beacon Signal] because the contents of a CAS [Beacon Signal] is a JSON object that maps participant **did:btcr2** identifiers to CID values, where each CID value is that DID's respective [BTCR2 Update]. Each DID controller SHOULD independently retrieve and verify the contents of the update bundle to ensure it contains the expected update for their DID before authorizing the [Aggregation Service] creates the [CAS Announcement (data structure)] from the CAS [Beacon Signal] and broadcasts it.

### Non-Repudiation Reveals DID Document History

One of the side effects of using a DID is that a DID controller's relying party will see their DID Document. In addition, resolving a DID document requires making available to the resolver all prior DID document updates.
