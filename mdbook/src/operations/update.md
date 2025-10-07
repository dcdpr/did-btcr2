{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Update

Updating a **did:btcr2** identifier is a matter of constructing a [BTCR2 Signed Update] then
announcing that update via one or more [BTCR2 Beacons][BTCR2 Beacon] listed in the current DID
document. Updates are either announced independently using [Singleton Beacons], or announced as
part of an aggregation cohort to minimize on-chain costs, using either [Map Beacons][Map Beacon] or
[SMT Beacons][SMT Beacon].

Fundamentally, two steps are involved. First, create an update to the DID document. Second,
announce and anchor the update on-chain by broadcasting a [Beacon Signal] to the Bitcoin network.
