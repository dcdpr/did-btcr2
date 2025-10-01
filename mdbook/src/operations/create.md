# Create

A **did:btcr2** identifier encodes a few pieces of information: an indicator 
for a specific Bitcoin network and a collection of [Genesis Bytes]. A 
specification version number is also included. These three values are 
encoded using the [DID-BTCR2 Identifier Encoding] algorithm.

The [Genesis Bytes] can be created in two ways: from an secp256k1 public key 
or from a [Genesis Document].

Creating a **did:btcr2** identifier from an secp256k1 public key will result
in an [Initial DID Document] when first resolved. Creating a **did:btcr2** 
identifier from a [Genesis Document] allows for the creation of a more complex document, 
including the ability to include service endpoints and [BTCR2 Beacons][BTCR2 Beacon] that 
support aggregation.

## secp256k1 public key

An secp256k1 public key can be used as the [Genesis Bytes]. The key must be 
in its compressed SEC format: a 33-byte representation consisting of a 
single prefix byte (0x02 or 0x03) followed by the 32-byte x-coordinate of 
the elliptic curve point. See Section 2.3.3 in {{#cite SEC}}.

## Hash of [Genesis Document]

A [Genesis Document] can be used as the [Genesis Bytes], but must be hashed 
to 32 bytes using the [JSON Document Hashing] algorithm.

{{#include ./includes/includes.md}}
