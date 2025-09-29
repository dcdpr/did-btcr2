# Create

A new did:btcr2 identifier can be created entirely offline from Genesis
Bytes. These bytes are either a 33-byte compressed SEC encoded secp256k1
public key or a 32-byte SHA-256 hash of a Genesis Document (via the JSON
Document Hashing algorithm).

Once the Genesis bytes are available, the did:btcr2 identifier can be
created by bech32m encoding three values: 'version', 'network' and
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


Pass this data to the bech32 encoding function and use "k" as the HRP
for key-based creation and "x" as the HRP for intermediate doc-based
creation. See {{#cite BIP173}} and {{#cite BIP350}} for details.

