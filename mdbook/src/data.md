# JSON-LD Data Structures

```rust
ResolutionOptions {
  version_id: u32,
  version_time: DateTime<Utc>,
  sidecar_data: SidecarDataGeneric,
}
SMTProof {
  leaf: Hash,
  nonce: Option<Hash>,
  path: Vector<Hash>
}
MapAnnouncement { Map<DID, Hash> }
SidecarDataGeneric {
  cas_manifest   : Option<Vector<Hash>>,
  genesis_diddoc : Option<IntermediateDiddoc>,
  updates        : Vector<DocUpdateSigned>,
  map_updates    : Option<Vector<MapAnnouncement>>,
  smt_proofs     : Option<Vector<SMTProof>>,
}
```

## Discussion

The cas_manifest is an optimization so that the resolver can start network round trips immediately.

{{#include ./includes/includes.md}}
