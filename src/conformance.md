{% import "includes/links.tera" as links %}

{{ links::include() }}


# Conformance

As well as sections marked as non-normative, all authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else in this specification is normative.

The key words MAY, MUST, MUST NOT, RECOMMENDED, SHOULD, and SHOULD NOT in this document are to be interpreted as described in {{#cite BCP14}} when, and only when, they appear in all capitals, as shown here.

Interoperability of implementations of the **did:btcr2** DID method is tested by evaluating an implementation's ability to create, update, deactivate, and resolve **did:btcr2** identifiers and DID Documents that conform to this specification. Interoperability for producers and consumers of **did:btcr2** identifier and DID Documents is provided by ensuring the DIDs and DID Documents conform.

Implementations MUST be conformant to all normative statements in Decentralized Identifiers v1.1 {{#cite DID-CORE}} and DID Resolution v0.3 {{#cite DID-RESOLUTION}}.
