{% import "includes/ui.tera" as ui %}
{% import "includes/links.tera" as links %}

{{ links::include() }}


# Algorithms

These algorithms are referenced throughout this specification.

## DID-BTCR2 Identifier Encoding

Any errors encountered during this algorithm MUST raise an `INVALID_DID` error.

A **did:btcr2** identifier is created from three values: `version`, `network` and
`genesis_bytes` ([Genesis Bytes]).

`genesis_bytes` MUST be one of the supported [Genesis Bytes] types defined in the Terminology
chapter. Implementations SHOULD require `genesis_bytes` to include additional type information that
clearly distinguishes between the supported [Genesis Bytes] types. This type information determines
how the identifier is encoded.

The `version` value MUST be `1`, declaring the encoding follows this specification.

The `network` value declares which Bitcoin network anchors the identifier. Implementations SHOULD
require `network` to include additional type information using symbolic names that can be
represented as integer values. `network` MUST be either one of the supported symbolic network names
or integer values listed in the following table:

### Table 1: Network Values { #network-values }

| Network           | Value      |
|:------------------|:-----------|
| `bitcoin`         | `0`        |
| `signet`          | `1`        |
| `regtest`         | `2`        |
| `testnet3`        | `3`        |
| `testnet4`        | `4`        |
| `mutinynet`       | `5`        |
| Reserved          | `6`..`11`  |
| Custom networks   | `12`..`14` |

Combine the `version` and `network` values into a single byte value with `version - 1` (i.e., `0`)
in the low [^1] nibble and `network` in the high [^1] nibble.

[^1]: Little Endian.

Append `genesis_bytes` to the first byte to produce the unencoded data bytes. Its format is:

### Table 2: Unencoded Data Bytes { #unencoded-data-bytes }

|             | `version` | `network` | `genesis_bytes` |
|:------------|:----------|:----------|:----------------|
| Size:       | 4 bits    | 4 bits    | 32 or 33 bytes  |
| Index [^2]: | 0         | 4         | 8               |

[^2]: The "Index" is a Little Endian bit count starting from `0` on the left and ending in `263` or
`271` on the right (inclusive).

Encode the unencoded data bytes with Bech32m {{#cite BIP350}} to produce the `method-specific-id`.
Use `"k"` as the `hrp` for key-based `genesis_bytes` and `"x"` as the `hrp` for [Genesis Document]-based
`genesis_bytes`.

Prefix the `method-specific-id` with the string `"did:btcr2:"` to produce the final **did:btcr2**
identifier.


{% set hide_text = `` %}
{% set ex_identifier_encoding =
'
Example input:

* `version`: `1`
* `network`: `bitcoin` (`0`)
* `genesis_bytes`: SEC encoded secp256k1 public key
  `171d59dd2d274011cbb090acc5a168dc98f303790ffce8f54779baed81890c1b00`

Example output:

* `did`: `"did:btc1:k1qqt36kwa95n5qywtkzg2e3dpdrwf3ucr0y8le684gaum4mvp3yxpkqqx0845q"`' %}

{{ ui::show_example_tabs(
  group_id="identifier-encoding-example",
  example=ex_identifier_encoding,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## DID-BTCR2 Identifier Decoding

Any errors encountered during this algorithm MUST raise an `INVALID_DID` error.

Parsing a **did:btcr2** identifier produces three values: `version`, `network`, and `genesis_bytes`
([Genesis Bytes]).

A **did:btcr2** identifier MUST be processed according to the DID Resolution Algorithm
{{#cite DID-RESOLUTION}} to retrieve the **did:btcr2** DID Method-specific ID `method-specific-id`.
(I.e., the first 10 characters in the string MUST be exactly `"did:btcr2:"`.)

Decode the `method-specific-id` as a Bech32m encoded string {{#cite BIP350}} to retrieve the
unencoded data bytes. Parse the unencoded data bytes according to
[Table 2: Unencoded Data Bytes](#unencoded-data-bytes) to retrieve the `version`, `network`, `hrp`,
and `genesis_bytes`. <!-- TODO: These should be given alternate identifiers. These values are not returned directly by the algorithm. They are just raw numbers. The algorithm suggests that returned values SHOULD include additional type information. Clear up this ambiguity caused by reusing the identifiers. -->

* `version` MUST be `0`. `version` MUST be returned to the caller as a type that can be represented
  as the value `1`.
* `network` MUST be one of the values in [Table 1: Network Values](#network-values). `network`
  SHOULD be returned to the caller including additional type information using symbolic names that
  can be represented as integer values.
* The `hrp` MUST be either `"k"` or `"x"`.

If the `hrp` is `"k"` (key-based **btcr2:did** identifier), the `genesis_bytes` MUST be a 33-byte
SEC encoded secp256k1 public key.

If the `hrp` is `"x"` ([Genesis Document]-based **btcr2:did** identifier), the `genesis_bytes` MUST
be a 32-byte SHA-256 hash of a [Genesis Document].


{% set hide_text = `` %}
{% set ex_identifier_decoding =
'
Example input:

* `did`: `"did:btcr2:x1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54"`

Example output:

* `version`: `1`
* `network`: `mutinynet` (`5`)
* `genesis_bytes`: SHA-256 hash `e4ed4a777609ca3bbca99f80b982f571141d588f3b9b803d4fbe24a373741be8`' %}

{{ ui::show_example_tabs(
  group_id="identifier-decoding-example",
  example=ex_identifier_decoding,
  hide=hide_text,
  default="hide",
  show_label="Show Example",
  hide_label="Hide"
) }}


## JSON Document Hashing

* Encode the document using JCS {{#cite RFC8785}}.
* Hash the encoded document with SHA-256 {{#cite SHA256}}.


## Transforming Genesis Document into Initial Document

This is the process of hashing the Genesis Document and replacing the DID placeholder values with a new DID constructed from the hash.


## Processing Sidecar Documents and SMT Proofs

See the "Resolve" operation for details.


----

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
