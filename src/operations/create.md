{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Create

Creating a **did:btcr2** identifier from an secp256k1 public key will result
in an [Initial DID Document] when first resolved. Creating a **did:btcr2**
identifier from a [Genesis Document] allows for the creation of a more
complex [Initial DID Document], including the ability to include service
endpoints and [BTCR2 Beacons][BTCR2 Beacon] that support aggregation. Any
active **did:btcr2** DID document can be updated later with new key material
and service endpoints.

The create operation has the following function signature:

```rust
fn create(
  genesisBytes,
  network,
  version,
) ->
  did
```

Input arguments:

- `genesisBytes`: [Genesis Bytes] is a secp256k1 public key or the hash of a [Genesis Document]. The [DID-BTCR2 Identifier Encoding] algorithm takes this value as `key_or_hash`.
- `network`: The Bitcoin network that anchors the identifier. The [DID-BTCR2 Identifier Encoding] algorithm takes this value as `network_name`. [Algorithms Table 1: Network Values] lists the permitted values.
- `version`: The specification version number. The [DID-BTCR2 Identifier Encoding] algorithm takes this value as `version_number`.

Outputs:

- `did`: A **did:btcr2** identifier that encodes `genesisBytes`, `network` and `version`.


## Process

A **did:btcr2** identifier encodes a few pieces of information: an indicator
for a specific Bitcoin network, a collection of [Genesis Bytes], and a
specification version number. These three values are
encoded with the [DID-BTCR2 Identifier Encoding] algorithm.

The [Genesis Bytes] can be created in two ways: from a secp256k1 public key
or from a [Genesis Document].

## secp256k1 Public Key

An secp256k1 public key can be used as the [Genesis Bytes]. The key MUST be
in its compressed SEC format: a 33-byte representation consisting of a
single prefix byte (`0x02` or `0x03`) followed by the 32-byte x-coordinate of
the elliptic curve point. Reference Section 2.3.3 in SEC 1: Elliptic Curve Cryptography {{#cite SEC}}.

## Genesis Document Hash

A [Genesis Document] can be used as the [Genesis Bytes], but MUST be hashed
to 32 bytes with the [JSON Document Hashing] algorithm.
