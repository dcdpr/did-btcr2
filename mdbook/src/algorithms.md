# Algorithms

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


Use a Bech32 encoding function to encode this data. Use "k" as the HRP
for key-based creation and "x" as the HRP for intermediate doc-based
creation. See {{#cite BIP173}} and {{#cite BIP350}} for details.


## JSON Document Hashing

- Encode the document using JCS, {{#cite RFC8785}}.
- Hash the encoded document with SHA-256, {{#cite SHA256}}.


{{#include ./includes/includes.md}}
