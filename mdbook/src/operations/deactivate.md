{% import "includes/links.tera" as links %}

{{ links::include(root="../") }}


# Deactivate

To deactivate a **did:btcr2**, the DID controller MUST add the property `deactivated` with the value `true` to the DID document. To do this, the DID controller constructs a valid [BTCR2 Update] with a JSON Patch {{#cite RFC6902}} that adds this property and announces the [BTCR2 Update] by broadcasting an [Authorized Beacon Signal] following the algorithms defined in [Update](update.md). Once a **did:btcr2** has been deactivated this state is considered permanent and resolution MUST terminate.
