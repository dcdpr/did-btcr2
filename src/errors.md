{% import "includes/links.tera" as links %}

{{ links::include() }}


# Errors

The algorithms described in this specification can raise the specific errors listed below. Additional error types defined in Section 10 of DID Resolution v0.3 {{#cite DID-RESOLUTION}} may also be raised.

These errors are assumed to be fatal and all **did:btcr2** operations must abort when one of these errors are raised.


## `INVALID_DID_UPDATE` { #invalid_did_update }

An error was found when creating or applying a [BTCR2 Update].

## `LATE_PUBLISHING` { #late_publishing }

An error was found when processing the full history of [BTCR2 Updates][BTCR2 Update] announced by all relevant [Beacon Signals][Beacon Signal]. See [Late Publishing].

## `MISSING_UPDATE_DATA` { #missing_update_data }

[BTCR2 Update] data can not be found in either the provided [Sidecar Data] nor in [CAS].
