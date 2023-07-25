export interface EntityContextExtensionInterface {
    contextEntityId: string;

    // @see EntityContainerExtensionComponent in Cloud Director
    contextUrn(entityId: string): void;
}
