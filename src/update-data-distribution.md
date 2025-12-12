{% import "includes/links.tera" as links %}

{{ links::include() }}


# BTCR2 Update Data Distribution

In many cases, additional data is required for resolution. In those cases, the resolver can receive data via two primary means from a DID controller, both secured by cryptographic hash:

1. [Sidecar]
2. [Content Addressable Storage] ([CAS])

All [BTCR2 Update] data must be made available to the resolver to enable full resolution of the DID document. Cryptographic hashes and signatures ensure the integrity and authenticity of data shared from controller to resolver.

All documents used for resolution are JSON documents, identified by their SHA-256 cryptographic hash calculated after first canonicalizing the document according to the [JSON Document Hashing] algorithm.

As a resolver goes through the resolution process, it encounters one or more document hashes, which it uses to identify the files of interest. See [Process Sidecar Data](./operations/resolve.html#process-sidecar-data).

While it's possible for a single **did:btcr2** identifier to mix the two distribution mechanisms, it is NOT RECOMMENDED. Instead, it is RECOMMENDED that controllers pick a distribution mechanism and use it throughout the lifetime of a given DID.

## Sidecar

[Sidecar] provides additional update data alongside the **did:btcr2** identifier being resolved. This is analogous to a sidecar on a motorcycle bringing along a second passenger: the DID controller provides the DID document history (in the form of [BTCR2 Updates][BTCR2 Update] and any additional proofs) along with DID to the relying party so that the resolver can construct the DID document.

When a resolver is presented with a **did:btcr2** identifier, it is also presented with documents matching the SHA-256 hashes it encounters during the resolution process. If any SHA-256 hash doesn't have a corresponding file, the resolution fails.

## Content Addressable Storage (CAS)

[Content Addressable Storage] (CAS) is a mechanism by which a digital file is stored on a network for retrieval based on its content, not its name or location. The content address is determined by a cryptographic hash of the file. The hash is then passed into a retrieval function specific to the type of CAS to retrieve the file.

Any CAS that provides a deterministic mapping from a SHA-256 hash of a file may be used, and a resolver SHOULD be informed of the specific CAS mechanism so that it can retrieve documents associated with a **did:btcr2** identifier efficiently. If the CAS mechanism is not provided, the resolver MAY iterate through all supported CAS mechanisms to find the files or it MAY return with an error indicating that the CAS mechanism is required.

At this time, IPFS is the only known CAS to provide a deterministic mapping from a SHA-256 hash.

### Interplanetary File System (IPFS)

The Interplanetary File System (IPFS) "is a set of open protocols for addressing, routing, and transferring data on the web, built on the ideas of content addressing and peer-to-peer networking."

A detailed description is available at the [IPFS documentation site](https://docs.ipfs.tech/), but for the purposes of **did:btcr2**, it is a distributed file system where the files are identified using a unique [Content Identifier] ([CID]) based on the content of the file. The content of the file determines the CID, and the CID may be used by anyone, anywhere, to retrieve the file.

For **did:btcr2** identifiers, files stored in IPFS MUST override the default chunking behaviour by storing the file as a raw binary using the [Raw Leaves option](https://richardschneider.github.io/net-ipfs-engine/articles/fs/raw.html). This limits the file size to the block size (default 256 kB, maximum 1 MB), but that should be sufficient for most applications, ensuring that the entire file is included when calculating the CID.

The IPFS CIDv1 is a binary identifier constructed from the file hash as:

* `0x01`, the code for CIDv1;
* `0x00`, the [multicodec](https://github.com/multiformats/multicodec) code for raw binary;
* `0x12`, the [multihash](https://github.com/multiformats/multihash) code for SHA-256; and
* the SHA-256 of the file.

The stringified version of the CIDv1 is accomplished using [multibase](https://github.com/multiformats/multibase) encoding. The final URL is `"ipfs://<stringified CIDv1>"`.

A resolver retrieves a file associated with a SHA-256 hash by constructing the IPFS CIDv1 and requesting the file from an IPFS node.
