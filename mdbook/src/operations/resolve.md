# Resolve

DID resolution is defined by {{#cite DID-RESOLUTION}}.

The resolve operation has the following function signature:

```rust
fn resolve(did, resolutionOptions) ->
  (didResolutionMetadata, didDocument, didDocumentMetadata)
```

Input arguments:

- `did`: The DID.
- `resolutionOptions`: [resolutionOptions (data structure)].

Outputs:

- `didResolutionMetadata`: [didResolutionMetadata (data structure)].
- `didDocument`: [DID document (data structure)].
- `didDocumentMetadata`: [didDocumentMetadata (data structure)].


TODO: Describe what this operations does:

* What the resolutionOptions looks like (its "schema"). Especially resolutionOptions.sidecar.
  * And critically, *what to do with resolutionOptions.sidecar* to make the resolution work correctly, namely:
  * Hash the documents in the resolutionOptions.sidecar.documents array to construct a mapping of hashes to documents.
    * Don't forget to [parse (don't validate)](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) each document to ensure it is conformant **before** performing any network I/O.
  * Optimization: Reorganize the resolutionOptions.sidecar.smtProofs array into a mapping of SMT roots to SMT proofs while parsing each proof to enable O(1) lookups by SMT root.
* Pre-update verifications (e.g., ensure the DID identifier decodes properly, check the Genesis Document hash for "x" HRP DIDs, etc.)
* What to look for on the blockchain.
* What to do with the Signal Bytes in the Bitcoin transaction.
* Retrieving the BTCR2 Signed Update by Signal Bytes.
  * Needs to consult the "mapping of hashes to documents" and "mapping of SMT roots to SMT proofs".
  * These can optionally be combined into a single map, but see the note about description vs prescription in the top-level changes.
* How to verify the BTCR2 Signed Update (e.g., ensure the verificationMethod is one that exists in the document being patched, verify the signature, check the source document hash, etc.)
* Apply the patches ordered by block height (then by targetVersionId within the BTCR2 Signed Update when two or more updates exist in a single block).
* Post-patch verifications (e.g., check the target document hash, look for late publishing errors, etc.)
* Handling stop conditions (resolutionOptions.versionId, resolutionOptions.versionTime, etc.)
* Constructing didResolutionMetadata and didDocumentMetadata returned by the Resolve operation.



## Discussion

DID resolution is the process of obtaining a DID-document for a given
DID.  The resolution process returns the canonical DID document at the
requested target time as well as additional metadata.  The
DID-controller provides the DID and necessary Sidecar-data to the
Relying Party.  The Relying Party may either verify the DID for
themselves, according to **did:btcr2**'s rules, or engage an external
Resolver, passing any supplied Sidecar-data as Resolve-Options.  Every
resolution process is entirely DID-method-specific, and in **did:btcr2**
it depends on observing the Bitcoin blockchain for anchored updates.

There are three kinds of anchored updates.  Some DID-controllers will
post public updates, using the Map-beacon and CAS-systems, allowing a
previous Relying Party to see future DID-documents.  Some
DID-controllers will keep subsequent DID-updates private from previous
Relying Parties, using the SMT-beacon feature and Sidecar-data, only
revealing the current state of the DID to a Relying Party that they
have current business with.  Lastly, a Singleton update allows
unilateral action in the event that aggregators are not posting
updates.

* TODO: Is it necessary to explain the DID resolution process?

  * **A**: No. Delegate! If there is any pertinent information of the DID resolution process, it is
    already the DID resolution spec. Do not repeat that information here (where it can get out of
    date or be subtly incorrect with respect to the specification).

* TODO: Why explain types of updates here?  Move to an overview section?

  * **A**: Update types are not an implementation concern.

    _Most_ of this content belongs somewhere else. These are abstract concepts that will not appear
    in any implementation. The specification says "what the code will do." The code
    (implementations) will not draw any distinction from the three types of updates. All updates
    are handled in the same way. The only difference is where they are sourced from. Which is
    hardly going to affect the code at all. It will have no bearing on the code whatsoever for a
    sans-I/O implementation, as all I/O is completely decoupled from the implementation.

    As for _where_ this content belongs, maybe in design documentation, or architectural
    documentation, or technical requirements documentation?

* TODO: Normalize terminology words.

The resolver will need:

* all the blockchain txs (beacon signals)
* a list of all the hashed objects found in any update or DID-document
* a list of all the CAS hashes that are not provided in Sidecar-data
* all the other blobs must be provided in Sidecar

Terminology Check:

* the "then-current version" is a number that increases with every update
* a "then-current diddoc" is a full diddoc with the then-current version

A non-verifiable DID is:

* one for which inclusion or non-inclusion of an update to the then-current diddoc cannot be proven in any subsequent authorized beacon signal;
* one for which the Sidecar manifest does not list some hashed object needed;
* one for which the Sidecar data does not include a blob for a hashed object (that is not on the CAS list).
* one for which the Data Integrity signature on any update fails
* one for which any Patch fails
* one for which any Patch results in a diddoc not conforming to did-core requirements
* one that is not revoked and which is lacking either any beacon or a version
* one that had a version regression in an authorized beacon signal
  * (hmm, if 2-\>3 posts, then 3-\>4, then if a separate beacon got held up and finally posts 2-\>3, then the DID controller should not be penalized, because this could be up to miners).

Non-inclusion in an authorized beacon signal is:

* in the case of Singleton, not applicable, because the beacon signal would not exist;
* in the case of CAS, proven by not finding any signed update in the authorized beacon signal's Map; and
* in the case of SMT, proven by having a non-inclusion proof from the SMT's root.

A valid DID update (from version x \-\> x+1) is:

* a patch from the prior version of the diddoc
* announced in an authorized beacon signal
* proven by inclusion in the OP\_RETURN directly, inclusion in the Map, or an SMT proof
* signed with data integrity


{{#include ./includes/includes.md}}
