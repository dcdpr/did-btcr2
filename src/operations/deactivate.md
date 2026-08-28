{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Deactivate

To deactivate a **did:btcr2**, the DID controller MUST add the property `deactivated` with the value `true` to the DID document. Once a **did:btcr2** has been deactivated this state is considered permanent and resolution MUST terminate.

The deactivate operation has the following function signature:

```rust
fn deactivate(
  didSourceDocument,
  targetVersionId,
  verificationMethodId,
  signer,
) ->
  signedUpdate
```

Input arguments:

- `didSourceDocument`: The DID document being deactivated.
- `targetVersionId`: The `versionId` that will be returned in the [DID document metadata (data structure)] once the new [BTCR2 Signed Update] is applied.
- `verificationMethodId`: The `verificationMethod` ID used for signing the [BTCR2 Update].
- `signer`: A signing interface, as defined for the [Update](update.md) operation.

Outputs:

- `signedUpdate`: A [BTCR2 Signed Update] with a patch that adds the `deactivated` property with the value `true`.


## Process

The deactivate operation is the [Update](update.md) operation with a predetermined patch:

```json
[
  {
    "op": "add",
    "path": "/deactivated",
    "value": true
  }
]
```

The DID controller constructs a valid [BTCR2 Update] with a JSON Patch {{#cite RFC6902}} that adds the `deactivated` property with the value `true`, and announces the [BTCR2 Update] by broadcasting an [Authorized Beacon Signal] following the algorithms defined in [Update](update.md).
