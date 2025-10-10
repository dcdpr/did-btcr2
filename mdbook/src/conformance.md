{% import "includes/links.tera" as links %}

{{ links::include() }}


# Conformance

As well as sections marked as non-normative, all authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else in this specification is normative.

The key words MAY, MUST, MUST NOT, RECOMMENDED, SHOULD, and SHOULD NOT in this document are to be interpreted as described in {{#cite BCP14}} ({{#cite RFC2119}}, {{#cite RFC8174}}) when, and only when, they appear in all capitals, as shown here.

Interoperability of implementations of the **did:btcr2** DID method is tested by evaluating an implementation’s ability to create, update, deactivate, and resolve **did:btcr2** identifiers and DID Documents that conform to this specification. Interoperability for producers and consumers of **did:btcr2** identifier and DID Documents is provided by ensuring the DIDs and DID Documents conform.

<!-- todo: we don't have a syntax section yet -->
A conforming **did:btcr2** DID is any concrete expression of the rules specified in "Syntax" which complies with relevant normative statements in that section.

A conforming **did:btcr2** DID document is any concrete expression of the data model described in this specification which complies with the relevant normative statements in sections "4. Data Model" and "5. Core Properties" of {{#cite DID-CORE}}. A serialization format for the conforming document is deterministic, bi-directional, and lossless, as described in "6. Representations" of {{#cite DID-CORE}}.

A conforming **did:btcr2** resolver is any algorithm realized as software and/or hardware that complies with the relevant normative statements in "4. DID Resolution" of the {{#cite DID-RESOLUTION}} specification and the "Resolve" section of this specification.
