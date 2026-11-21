{% import "includes/links.tera" as links %}

{{ links::include() }}


# Errors

The algorithms described in this specification can raise the specific errors listed below. Additional error types defined in the Errors section of DID Resolution v1 {{#cite DID-RESOLUTION}} may also be raised.

These errors are assumed to be fatal and all **did:btcr2** operations must abort when one of these errors are raised.

Each error below declares the DID Resolution error type that it refines, as the Errors section of DID Resolution v1 {{#cite DID-RESOLUTION}} allows. A binding can use the declaration to decide how to convey the error. In the HTTP(S) binding, a resolver SHOULD send the HTTP status code of the error type that the error refines.

Each error below also has a type URL in the namespace `https://btcr2.dev/ns#` and a title. When an error is conveyed as a problem details object {{#cite RFC9457}}, its `type` MUST be the error's type URL, and its `title` SHOULD be the error's title.

A resolver that cannot reach a service it uses, such as a Bitcoin RPC service or a [CAS] service, SHOULD raise [`INTERNAL_ERROR`]. It MUST NOT raise [`NOT_FOUND`], [`MISSING_GENESIS_DOCUMENT`] or [`MISSING_UPDATE_DATA`] for data that it could not look for because the service was unreachable. A [CAS] service that takes the request was reachable, even if it finds no copy of the content or the request times out, unless it reports that it is unavailable.


## `INVALID_DID_UPDATE` { #invalid_did_update }

An error was found in a [BTCR2 Update], or when creating or applying one.

- Type: `https://btcr2.dev/ns#INVALID_DID_UPDATE`
- Title: Invalid BTCR2 Update
- Refines: [`INVALID_DID_DOCUMENT`]

## `INVALID_SIGNAL_DATA` { #invalid_signal_data }

The data for a [Beacon Signal] does not agree with its [Signal Bytes]. Example: an [SMT Proof] that does not verify against the [SMT] root in the [Beacon Signal].

- Type: `https://btcr2.dev/ns#INVALID_SIGNAL_DATA`
- Title: Invalid Beacon Signal Data
- Refines: [`INVALID_OPTIONS`]

## `LATE_PUBLISHING` { #late_publishing }

An error was found when processing the full history of [BTCR2 Updates][BTCR2 Update] announced by all relevant [Beacon Signals][Beacon Signal]. See [Late Publishing].

- Type: `https://btcr2.dev/ns#LATE_PUBLISHING`
- Title: Late Publishing
- Refines: [`INVALID_DID_DOCUMENT`]

## `MISSING_GENESIS_DOCUMENT` { #missing_genesis_document }

The [Genesis Document] is not in the [Sidecar Data] and not available from [CAS].

- Type: `https://btcr2.dev/ns#MISSING_GENESIS_DOCUMENT`
- Title: Missing Genesis Document
- Refines: [`INVALID_OPTIONS`]

## `MISSING_UPDATE_DATA` { #missing_update_data }

A [BTCR2 Update] or [CAS Announcement][CAS Announcement (data structure)] that resolution needs is not in the [Sidecar Data] and not available from [CAS], or an [SMT Proof] that resolution needs is not in the [Sidecar Data].

- Type: `https://btcr2.dev/ns#MISSING_UPDATE_DATA`
- Title: Missing Update Data
- Refines: [`INVALID_OPTIONS`]
