{% import "includes/ui.tera" as ui %}
{% import "includes/links.tera" as links %}

{{ links::include() }}


# Algorithms

These algorithms are referenced throughout this specification.

## DID-BTCR2 Identifier Encoding

Any errors encountered during this algorithm MUST raise an [`INVALID_DID`](./errors.html) error.

A **did:btcr2** identifier is created from three arguments: `version_number`, `network_name` and `key_or_hash` ([Genesis Bytes]).

`key_or_hash` MUST be one of the supported [Genesis Bytes] variants defined in the Terminology chapter and MUST be representable as a 33-byte secp256k1 public key or a 32-byte SHA-256 hash. Implementations SHOULD require `key_or_hash` to include additional type information that clearly distinguishes between the supported [Genesis Bytes] variants. This type information determines how the identifier is encoded.

The `version_number` value MUST be `1`, declaring the encoding follows this specification.

The `network_name` value declares which Bitcoin network anchors the identifier. Implementations SHOULD require `network_name` to include additional type information using symbolic names that MUST be representable as integer values listed in the following table:

### Table 1: Network Values { #network-values }

| `network_name`   | `network_value` |
|:-----------------|:----------------|
| `bitcoin`        | `0`             |
| `signet`         | `1`             |
| `regtest`        | `2`             |
| `testnet3`       | `3`             |
| `testnet4`       | `4`             |
| `mutinynet`      | `5`             |
| Reserved         | `6`..`11`       |
| Custom networks  | `12`..`14`      |

Introduce `btcr2_version` as `version_number - 1` (i.e., `0`). Combine `btcr2_version` in the low [^1] nibble and `network_value` in the high [^1] nibble into a single byte value.

[^1]: Little Endian.

Append `key_or_hash` to the first byte to produce the unencoded data bytes. Its format is:

### Table 2: Unencoded Data Bytes { #unencoded-data-bytes }

|             | `btcr2_version`  | `network_value` | `genesis_bytes` |
|:------------|:-----------------|:----------------|:----------------|
| Size:       | 4 bits           | 4 bits          | 32 or 33 bytes  |
| Index [^2]: | 0                | 4               | 8               |

[^2]: The "Index" is a Little Endian bit count starting from `0` on the left and ending in `263` or `271` on the right (inclusive).

Encode the unencoded data bytes with Bech32m {{#cite BIP350}} to produce the `method-specific-id`. Use `"k"` as the `hrp` for key-based `key_or_hash` and `"x"` as the `hrp` for [Genesis Document]-based `key_or_hash`.

Prefix the `method-specific-id` with the string `"did:btcr2:"` to produce the final **did:btcr2** identifier.


{% set hide_text = `` %}
{% set ex_identifier_encoding =
'
Example input:

* `version_number`: `1`
* `network_name`: `bitcoin` (`network_value` = `0`)
* `key_or_hash`: SEC encoded secp256k1 public key
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

Any errors encountered during this algorithm MUST raise an [`INVALID_DID`](./errors.html) error.

Parsing a **did:btcr2** identifier produces three values: `version_number`, `network_name`, and `key_or_hash` ([Genesis Bytes]).

A **did:btcr2** identifier MUST be processed according to the DID Resolution Algorithm {{#cite DID-RESOLUTION}} to retrieve the **did:btcr2** DID Method-specific ID `method-specific-id`. (I.e., the first 10 characters in the string MUST be exactly `"did:btcr2:"`.)

Decode the `method-specific-id` as a Bech32m encoded string {{#cite BIP350}} to retrieve the unencoded data bytes and `hrp`. Parse the unencoded data bytes according to [Table 2: Unencoded Data Bytes](#unencoded-data-bytes) to retrieve the `btcr2_version`, `network_value` and `genesis_bytes`.

* `btcr2_version` MUST be `0`. Introduce `version_number` as `btcr2_version + 1`. I.e., `version_number` MUST be returned to the caller as a type that can be represented as the value `1`.
* `network_value` MUST be one of the values in [Table 1: Network Values](#network-values). `network_name` SHOULD be returned to the caller including additional type information using symbolic names that can be represented as integer values.
* The `hrp` MUST be either `"k"` or `"x"`.

If the `hrp` is `"k"` (key-based **btcr2:did** identifier), `key_or_hash` MUST be `genesis_bytes` interpreted as a 33-byte SEC encoded secp256k1 public key.

If the `hrp` is `"x"` ([Genesis Document]-based **btcr2:did** identifier), `key_or_hash` MUST be `genesis_bytes` interpreted as a 32-byte SHA-256 hash of a [Genesis Document].


{% set hide_text = `` %}
{% set ex_identifier_decoding =
'
Example input:

* `did`: `"did:btcr2:x1qhjw6jnhwcyu5wau4x0cpwvz74c3g82c3uaehqpaf7lzfgmnwsd7spmmf54"`

Example output:

* `version_number`: `1`
* `network_name`: `mutinynet` (`network_value` = `5`)
* `key_or_hash`: SHA-256 hash `e4ed4a777609ca3bbca99f80b982f571141d588f3b9b803d4fbe24a373741be8`' %}

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

<!-- Line breaks to visibly separate the preceding subsection from the chapter footnotes. -->
<br>
<br>
