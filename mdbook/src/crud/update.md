# Update

Updating a did:btcr2 identifier is a matter of constructing a signed
BTCR2 Update then announcing that update via one or more BTCR2 Beacons
listed in the current DID document. Updates are either announced
independently using Singleton Beacons, or announced as part of an
aggregation cohort to minimize on-chain costs, using either Map Beacons
or SMT Beacons.

Fundamentally, two steps are involved. First, create an update to the
DID Document. Second, announce and anchor the update on-chain by
broadcasting a Beacon Signal to the Bitcoin network.

