class EntityActionExtensionComponent {}
class WizardExtensionComponent {}
class WizardExtensionWithValidationComponent {}
class WizardExtensionWithContextComponent {}

window["System"].registry.set("@vcd/common", window["System"].newModule({
    EntityActionExtensionComponent,
    WizardExtensionComponent,
    WizardExtensionWithValidationComponent,
    WizardExtensionWithContextComponent,
    API_ROOT_URL: "API_ROOT_URL",
    FLEX_APP_URL: "FLEX_APP_URL",
    SESSION_SCOPE: "SESSION_SCOPE",
    SESSION_ORGANIZATION: "SESSION_ORGANIZATION",
    EXTENSION_ASSET_URL: "EXTENSION_ASSET_URL",
    EXTENSION_ROUTE: "EXTENSION_ROUTE",
    SDK_MODE: "SDK_MODE",
    SESSION_ORG_ID: "SESSION_ORG_ID",
}));