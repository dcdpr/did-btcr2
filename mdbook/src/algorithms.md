{% import "macros.tera" as ui %}

# Algorithms

<style>
table {
    margin: 1em;
}
</style>

These algorithms are referenced throughout this specification.

## DID-BTCR2 Identifier Encoding

A did:btcr2 identifier is created from three values: 'version', 'network' and
'Genesis Bytes'.

Currently, the only valid value for 'version' is 1. The 'network' value
declares which Bitcoin network anchors the identifier and is selected
from the following table:

| Network           | Value  |
|:------------------|:-------|
| bitcoin           | 0      |
| signet            | 1      |
| regtest           | 2      |
| testnet3          | 3      |
| testnet4          | 4      |
| mutinynet         | 5      |
| reserved          | 6-B    |
| custom network 1  | C      |
| custom network 2  | D      |
| custom network 3  | E      |
| custom network 4  | F      |

Combine these values in the following way: The first byte of the data
contains the 'version' and the 'network', with 'version' - 1 in the high
nibble and the value from the network table in the low nibble. The
Genesis Bytes are then appended to the first byte.

| Version  | Network  | Genesis Bytes   |
|:---------|:---------|:----------------|
| 4 bits   | 4 bits   | 32 or 33 bytes  |

Encode the bytes with Bech32m {{#cite BIP350}} to produce the final encoding. Use "k" as the HRP for
key-based creation and "x" as the HRP for [Genesis Document]-based creation.


{% set hide_text = `` %}
{% set ex_identifier_encoding =
"
Example input:

* `version`: `1`
* `network`: `0`
* `bytes (hex encoded)`: `171d59dd2d274011cbb090acc5a168dc98f303790ffce8f54779baed81890c1b00`

Example output:
~~~text
did:btc1:k1qqt36kwa95n5qywtkzg2e3dpdrwf3ucr0y8le684gaum4mvp3yxpkqqx0845q
~~~

" %}

{{ ui::show_example_tabs(
  group_id="identifier-encoding-example",
  example=ex_identifier_encoding,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}

## DID-BTCR2 Identifier Decoding

For any other errors encountered during the decoding algorithm, raise an `"INVALID_DID"` error.

The scheme and DID method of the identifier (i.e., the first 10 chars) MUST be exactly `"did:btcr2:"`.

The data following `"did:btcr2:"` MUST be a Bech32m encoded string {{#cite BIP350}}. Decode the bech32m encoded string to retrieve the HRP and the [Genesis Bytes]. The HRP MUST be either "k" or "x".

If the HRP is "k" (key-based **btcr2:did** identifier), the [Genesis Bytes] are a secp256k1 public key.

If the HRP is "x" (), the [Genesis Bytes] are a 32-byte SHA256 hash of a [Genesis Document].

## JSON Document Hashing

- Encode the document using JCS, {{#cite RFC8785}}.
- Hash the encoded document with SHA-256, {{#cite SHA256}}.

## Transforming Genesis Document into Initial Document

This is the process of hashing the Genesis Document and replacing the DID placeholder values with a new DID constructed from the hash.

## Processing Sidecar Documents and SMT Proofs

See the "Resolve" operation for details.

## Signing and verifying a BTCR2 Update

Maybe? This might not be much of an algorithm, either. Signing and verification are only used in one place each.

## Prior "Algorithms" that we need to either rule out or flesh out

### Algo 4. Process Resolution Inputs
### Algo 5. Deterministically Generate Initial DID Document
### Algo 6. Retrieve Genesis Document
### Algo 7. Verify Genesis Document
### Algo 8. Process Beacon Signals
### Algo 9. Process Singleton Beacon Signal
### Algo 10. Process Map Beacon Signal
### Algo 11. Process SMT Beacon Signal
### Algo 12. Derive Root Capability
### Algo 13. Apply BTCR2 Update
### Algo 14. Construct Resolution Result
### Algo 15. Create Singleton Beacon Service
### Algo 16. Join Cohort and Establish Aggregate Beacon Service
### Algo 17. Create Canonical BTCR2 Update
### Algo 18. Create & Announce Singleton Beacon Signal
### Algo 19. Advertise Update Opportunity (Aggregator)
### Algo 20. Prepare & Submit Opportunity Response (Participant)
### Algo 21. Aggregate & Request Signal Confirmation (Aggregator)
### Algo 22. Confirm Signal (Participant)
### Algo 23. Broadcast Aggregated Signal (Aggregator)


{{#include ./includes/includes.md}}
