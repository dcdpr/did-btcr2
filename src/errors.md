{% import "includes/links.tera" as links %}

{{ links::include() }}


# Errors

The algorithms described in this specification can raise the specific errors listed below. Additional error types defined in the Errors section of DID Resolution v1 {{#cite DID-RESOLUTION}} may also be raised.

These errors are assumed to be fatal and all **did:btcr2** operations must abort when one of these errors are raised.

Each error below declares the DID Resolution error type that it refines, as the Errors section of DID Resolution v1 {{#cite DID-RESOLUTION}} allows. A binding can use the declaration to decide how to convey the error. In the HTTP(S) binding, a resolver SHOULD send the HTTP status code of the error type that the error refines.


## `INVALID_DID_UPDATE` { #invalid_did_update }

An error was found when creating or applying a [BTCR2 Update].

Refines [`INVALID_DID_DOCUMENT`].

## `INVALID_SIGNAL_DATA` { #invalid_signal_data }

The data for a [Beacon Signal] does not agree with its [Signal Bytes]. Example: an [SMT Proof] that does not verify against the [SMT] root in the [Beacon Signal].

Refines [`INVALID_OPTIONS`].

## `LATE_PUBLISHING` { #late_publishing }

An error was found when processing the full history of [BTCR2 Updates][BTCR2 Update] announced by all relevant [Beacon Signals][Beacon Signal]. See [Late Publishing]. The error raised when `update.targetVersionId` is more than `current_version_id + 1` ([Check `update.targetVersionId`](operations/resolve.md#check-update-version)) clears once [Beacon Signals][Beacon Signal] announce the updates for the versions in between.

Refines [`INVALID_DID_DOCUMENT`].

## `MISSING_UPDATE_DATA` { #missing_update_data }

Data that is necessary to resolve the DID is not available: the [Genesis Document], or data that a [Beacon Signal] announces for the DID. The [Genesis Document], a [BTCR2 Update] or a [CAS Announcement][CAS Announcement (data structure)] is not available when it is not in the [Sidecar Data] and not in [CAS]. An [SMT Proof] is not available when it is not in the [Sidecar Data].

Refines [`NOT_FOUND`].
