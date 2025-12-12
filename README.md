# did:btcr2 DID Method Specification

**did:btcr2** is a censorship resistant DID Method using the Bitcoin blockchain
as a Verifiable Data Registry to announce changes to the DID document.
It improves on prior work by allowing: zero-cost off-chain DID creation;
aggregated updates for scalable on-chain update costs; long-term identifiers
that can support frequent updates; private communication of the DID document;
private DID resolution; and non-repudiation appropriate for serious contracts.

The full specification may be viewed at https://dcdpr.github.io/did-btcr2/.

## Compiling the Specification Locally

On my mac:

```zsh
> cargo install mdbook mdbook-mermaid mdbook-bib mdbook-tera mdbook-pagetoc

> cd mdbook
> mdbook serve --open
```

The specification will be compiled and available in the `book/` folder and will
be served via http://localhost:3000.

# History and Evolution of the did:btcr2 DID method

```mermaid
timeline
    title did:btcr2 — A Timeline of Development
    section RWOT Origins
      RWOT5 Boston  : Oct 2017
      RWOT7 Toronto — BTCR v0.1 Design Decensions : Sep 2018
    section Foundations
      Taproot & Schnorr activated : Nov 2021
      DID Core 1.0 Recommendation : Jul 2022
      BTCR v2 work (→ btcr2) starts : 2022
    section Specification Work
      Programming Bitcoin course : Mar 2023
      btcr2 spec drafting begins : Summer 2023
      DID WG recharter (DID Resolution focus) : April 2024
    section Exploration and Experimentation
      POC - Sparse Merkle Tree aggregation : Feb 2024
      Schnorr cryptosuite (bip340-2025) work starts : Dec 2024
    section Implementation and Adoption
      Implementations across Python/JS/Rust/Java : 2025
      bip340-2025 cryptosuite adopted (CCG Work Item) : Aug 2025
```

## Jupyter Notebooks

Included under the `old-spec/notebooks` folder are a set of Jupyter notebooks that implement the
various features of the **did:btcr2** specification. These are included as helpful reference
material for those intending to implement the specification. To run the notebooks locally see
the `old-spec/notebooks/README.md`.
