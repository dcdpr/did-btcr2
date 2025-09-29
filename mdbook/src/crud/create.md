# Create

A new **did:btcr2** identifier can be created entirely offline from [Genesis Bytes]. These bytes are
either a 33-byte compressed SEC encoded secp256k1 public key or a 32-byte SHA-256 hash
{{#cite SHA256}} of a [Genesis Document] created with the [JSON Document Hashing] algorithm.

Once the [Genesis Bytes] are available, the **did:btcr2** identifier is created with the
[DID-BTCR2 Identifier Encoding] algorithm.


{{#include ./includes/includes.md}}
