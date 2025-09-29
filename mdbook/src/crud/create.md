# Create

A new did:btcr2 identifier can be created entirely offline from Genesis
Bytes. These bytes are either a 33-byte compressed SEC encoded secp256k1
public key or a 32-byte SHA-256 hash of a Genesis Document (via the JSON
Document Hashing algorithm).

Once the Genesis bytes are available, the did:btcr2 identifier is
created with the [DID-BTCR2 Identifier
Encoding](../algorithms.md#did-btcr2-identifier-encoding) algorithm.

