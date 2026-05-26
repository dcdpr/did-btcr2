{% import "includes/links.tera" as links %}

{{ links::include() }}


# Conformance

All sections marked as non-normative, as well as all authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else in this specification is normative.

The key words MAY, MUST, MUST NOT, RECOMMENDED, SHOULD, and SHOULD NOT in this document are to be interpreted as described in {{#cite BCP14}} when, and only when, they appear in all capitals, as shown here.

Interoperability of implementations of the **did:btcr2** DID method is tested by evaluating an implementation's ability to create, resolve, update, and deactivate, **did:btcr2** identifiers and DID documents that conform to this specification. Interoperability for producers and consumers of **did:btcr2** identifiers and DID documents is provided by ensuring the DIDs and DID documents conform.

Implementations MUST be conformant to all normative statements in Decentralized Identifiers v1.1 {{#cite DID-CORE}} and DID Resolution v0.3 {{#cite DID-RESOLUTION}}.
