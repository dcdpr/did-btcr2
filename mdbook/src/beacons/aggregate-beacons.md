{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}

# Aggregate Beacons

DID controllers can use a [CAS Beacon] and/or a [SMT Beacon] to participate in BTCR2 Update Aggregation. In contrast to a [Singleton Beacon], which only allows for one [BTCR2 Update] per Bitcoin transaction, [Aggregate Beacons][Aggregate Beacon] combine multiple [BTCR2 Updates][BTCR2 Update] into one Bitcoin transaction for any number of DID controllers. In this context (i.e., the aggregate beacon context), DID BTCR2 controllers are called [Aggregation Participants][Aggregation Participant].

<!-- todo: maybe a nice little diagram -->

## BTCR2 Update Aggregation

BTCR2 Update Aggregation is the specific coordination and communications protocol used by an [Aggregation Service] and [Aggregation Participants][Aggregation Participant] to perform aggregation. A precisely specified coordination and communications protocol is deemed "out of scope" for this specification. However, this specification provides a RECOMMENDED example for illustrative purposes.

## Example Using Musig2, secp256k1 and Schnorr Signatures

One implementation, centered on Schnorr signatures, allows all [Aggregation Participants][Aggregation Participant] to veto any [Beacon Signal] for which their own proof data does not match the proposed `OP_RETURN` data. DID controllers that wish to join an [Aggregation Cohort] and become an [Aggregation Participant] would need to provide the [Aggregation Service] with a Schnorr public key.

The [Aggregation Service] coordinates the construction of an `n-of-n` Pay-to-Taproot address as the [Beacon Address], where each [Aggregation Participant's][Aggregation Participant] public key is one of the `n` keys. This ensures that all on-chain [Beacon Signals][Beacon Signal] are cryptographically signed by every [Aggregation Participant], while the [Aggregation Service] remains minimally trusted.

A given [Aggregation Cohort] may fail because other [Aggregation Participants][Aggregation Participant] stop participating or the [Aggregation Service] is compromised; however, the consequences are limited to the failure of the [Aggregate Beacon] to broadcast [Beacon Signals][Beacon Signal] that announce [BTCR2 Updates][BTCR2 Update].

The [Aggregation Service] decides when to finalize the membership of the [Aggregation Cohort]. Once finalized, the [Aggregation Service] would need to compute an `n-of-n` Pay-to-Taproot address from the public keys the [Aggregation Participants][Aggregation Participant] provided. This is the [Beacon Address] and would need to be sent to all participants, along with the set of keys used to construct this address. [Aggregation Participants][Aggregation Participant] would want to verify the address for themselves, and confirm that the key they provided is in the set of keys used to construct the address.

Once the [Aggregation Participants][Aggregation Participant] have verified the newly formed [Beacon Address], they can construct the `service` object that can be included within their DID document's service array.

This RECOMMENDED way of setting up the [Aggregation Service] ensures that neither the [Aggregation Service] nor other [Aggregation Participants][Aggregation Participant] are able to compromise or invalidate a **did:btcr2** identifier of another [Aggregation Participant] in the cohort.

The actors involved in aggregation are as follows.

* DID controller - A party that controls one or more **did:btcr2** identifiers.
* [Aggregation Participant] - A DID controller in the BTCR2 Update Aggregation context after joining an [Aggregation Cohort].
* [Aggregation Cohort] - A set of [Aggregation Participants][Aggregation Participant] who have submitted cryptographic material to an [Aggregation Service].
* [Aggregation Service] - A single entity who coordinatates the protocols and is ultimately responsible for broadcasting the [Beacon Signal] formed as a result of BTCR2 Update Aggregation.
* Verifier - A party verifying a **did:btcr2** identifier presentation.

### Step 1: Aggregator Service Advertisement

The [Aggregation Service] MUST advertise over some communications channel to any potential [Aggregation Participants][Aggregation Participant] that a [Aggregation Cohort] is available to be joined for aggregating [BTCR2 Updates][BTCR2 Update].

This MAY occur at a regular time interval as specified by the aggregator or it MAY be through a message sent to all participants. The means of advertising to the participants are outside the scope of this specification. The only requirement is that all [Aggregation Participants][Aggregation Participant] are made aware of the advertisement.

#### Participant Response to Advertisement

<!-- TODO: Why must participants respond to advertisements? -->

[Aggregation Participants][Aggregation Participant] must submit a response to all advertisements presented to them by the [Aggregation Service], otherwise the aggregator will be unable to broadcast [Beacon Signals][Beacon Signal]. This response must include:

* The indexes representing the SHA256 hash of the DIDs to be updated. These indexes SHOULD have been previously registered by the [Aggregation Participant] as part of joining the [Aggregation Cohort].
* For each index included within the [Beacon Signal], the value of the update MUST be provided. The calculation of the value varies by [Beacon Type].
    * For a [CAS Beacon] the value is the SHA256 hash of the BTCR2 Update canonicalized using JCS. <!-- TODO: What about no update?? Is 0 an appropriate "SHA256 hash"? Or is a negative response expected so that the update may be omitted? -->
    * For an [SMT Beacon] the value is either the double SHA256 hash of a random nonce if no update is present for the index or the SHA256 hash of the concatenated SHA256 hashes of a random nonce and the canonicalized [BTCR2 Update]. Participants MUST persist their nonce values.
    * Participants of [SMT Beacons][SMT Beacon] MUST provide an update for all indexes they registered with the [Aggregation Service].
* MuSig2 Nonce: A MuSig2 nonce constructed according to the nonce generation algorithm specified in {{#cite BIP327}}.

This response SHOULD be sent over a secure communication channel and MAY be signed.

### Step 2: Aggregate & Request Signal Confirmation

Once the [Aggregation Service] has received responses to an advertisement from all [Aggregation Participants][Aggregation Participant] <!-- TODO: Why must participants respond to advertisements? --> in the [Aggregation Cohort] they can proceed to aggregate the update announcements into a unsigned Beacon Signal. They then send this signal, along with the information required to confirm its construction, to each of the participants. Additionally, aggregators aggregate the MuSig2 nonces from each [Aggregation Participant] following the nonce aggregation algorithm in {{#cite BIP327}}.

Aggregation of updates into a Beacon Signal depends on the type of [BTCR2 Beacon].

* For [CAS Beacons][CAS Beacon], the aggregator creates a [Beacon Announcement Map] that maps indexes provided by participants to [BTCR2 Update Announcements][BTCR2 Update Announcement]. The [Signal Bytes] included in a CAS Beacon Signal is the SHA256 hash of the [Beacon Announcement Map].
* For [SMT Beacons][SMT Beacon], the aggregator constructs a [Sparse Merkle Tree] (SMT). The index provided by a [Aggregation Participant] is the index of a leaf node, with the value of this leaf being the value provided by the participant for that index. All indexes registered with the aggregator MUST have values at their leaves within the SMT. Once constructed, the SMT is optimized and individual SMT proofs are generated for each index and shared with the [Aggregation Participant] that registered the index. The [Signal Bytes] of an SMT Beacon Signal is the 32 byte SMT root.

For a [CAS Beacon], the request signal confirmation message contains:

* The [Beacon Announcement Map].
* The [Unsigned Beacon Signal].
* The MuSig2 aggregated nonce.

For an [SMT Beacon], the request signal confirmation message contains:

* An SMT Proof for each index belonging to the [Aggregation Participant].
* The [Unsigned Beacon Signal].
* The MuSig2 aggregated nonce.

#### Confirm Signal Request

The participant must validate the contents of the [Beacon Signal] (partially signed transaction) according to the type of the [BTCR2 Beacon]:

* For a [CAS Beacon], the [Aggregation Participant] validates that all the indexes registered with the aggregator have expected values within the [Beacon Announcement Map]. That is, the indexes are only within the map if a [BTCR2 Update] was submitted and the mapped value for those indexes are the same [BTCR2 Update Announcements][BTCR2 Update Announcement] they submitted. Participants MUST also check that the [Signal Bytes] of the [Beacon Signal] contains the SHA256 hash of the [Beacon Announcement Map].
* For an [SMT Beacon], the [Aggregation Participant] validates that all the indexes registered with the aggregator have SMT proofs and that the SMT Proofs are valid proofs of the values they submitted to the aggregator. The [Signal Bytes] in the [Beacon Signal] MUST be used as the SMT root to verify these proofs.

<!-- YOU ARE HERE -->

Once the participant is satisfied that the Beacon Signal only announces the BTCR2 Updates they submitted for DIDs that they control they partially sign the Bitcoin transaction according to the signing algorithm specified in BIP327. Participants use the private key corresponding to the public key they provided when joining the [Aggregation Cohort] and the MuSig2 aggregated nonce provided by the aggregator to execute this signing algorithm.

Finally, participants return the partially signed Bitcoin transaction to the aggregator, confirming the Beacon Signal.

Note: [Aggregation Participants][Aggregation Participant] SHOULD to maintain the set of data required to validate their BTCR2 Updates against the Beacon Signal. In the case of a CAS Beacon Signal, this means persisting the Beacon Announcement Map and the BTCR2 Updates announced within that map for indexes that they control. For SMT Beacon Signals, participants must persist the BTCR2 Updates, nonce values and SMT Proofs for each index they control.

### Step 3: Broadcast Aggregated Signal

Once the [Aggregation Service] has received confirmation of the Beacon Signal from all [Aggregation Participants][Aggregation Participant] within the [Aggregation Cohort] they finalize the signature on the Beacon Signal. Signal confirmations contain partial signatures from each participant, these are aggregated together to create a final signature that spends the UTXO controlled by the Beacon Address included an an input into the Beacon Signal. Aggregation of partial signatures is done following the partial signature aggregation algorithm specified in BIP327. The result is a signed Bitcoin transaction. The aggregator then broadcasts this transaction onto the Bitcoin network.
