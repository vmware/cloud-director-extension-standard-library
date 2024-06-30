# Runtime Defined Enity Hooks

## Overview

The processing of the events in the [Runtime Defined Entities lifecycle](defined-entities.md#rde-lifecycle)
can be automated by binding [behaviors](behaviors-general-concepts.md) to the lifecycle events.

For example, an extension can define a type that has a property in its schema that describes
the desired state of a system.
Users can create new instances of that type and fill in the property with their desired system state.

The extension can bind behaviors to the `OnCreate` and `OnUpdate` hooks of that type to observe the
modifications in the desired state requested by the users.
The hook behaviors will be invoked upon such modifications and can initiate or perform
processes to satisfy the modified desired state.

## Example

The following REST API call creates an RDE Type that implements the interface `urn:vcloud:interface:clusterVendorA:containerCluster:1.0.0`:

```text
POST
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entityTypes
```

```json
{
    "name": "Basic Container Cluster",
    "vendor": "clusterVendorA",
    "nss": "basicContainerCluster",
    "version": "1.0.0",
    "interfaces": ["urn:vcloud:interface:clusterVendorA:containerCluster:1.0.0"],
    ...
    "hooks": {
        "PostCreate": "urn:vcloud:behavior-interface:autoResolve:clusterVendorA:containerCluster:1.0.0",
        "PostUpdate": "urn:vcloud:behavior-interface:processUpdate:clusterVendorA:containerCluster:1.0.0",
        "PreDelete" : "urn:vcloud:behavior-interface:validateDelete:clusterVendorA:containerCluster:1.0.0",
    }
}
```

The type definition binds three of the interface behaviors to different lifecycle events of the entities of the type:

- the `autoResolve` behavior will be invoked after the initial entity creation
- the `processUpdate` behavior will be invoked every time the entity is modified
- the `validateDelete` behavior will be invoked to check whether the entity can be deleted or not

## Available RDE Lifecycle Hooks

### PostCreate

A behavior bound to the `PostCreate` hook will be invoked immediately after the initial creation
of a new entity of the type. The behavior may perform operations like allocating external resources.
It can also update the entity contents.

If the behavior execution is successful, the entity resolution process will be initiated
automatically and the entity state will be switched to `RESOLVED` if the content validation
against the schema is successful.

If the behavior execution fails, the entity state will switched to the `RESOLUTION_ERROR` state.

### PostUpdate

A behavior bound to the `PostUpdate` hook will be invoked immediately after an entity
of the type is modified. The behavior may perform operations like allocating external resources.
It can also update the entity contents.

### PreDelete

A behavior bound to the `PreDelete` hook will be invoked when a request for the deletion
of an entity of the type is received.
The entity deletion will proceed only if the behavior execution is successful.

### PostDelete

A behavior bound to the `PostDelete` hook will be invoked when a request for the deletion
of an entity of the type has been approved and the entity status has been switched
to `IN_DELETION`.

The behavior may perform operations like releasing the external resources
associated with the entity.
If the behavior execution is successful, the entity will be fully removed.

## Hook Execution Control

The creators of the RDE Type use the hooks to specify the behavior that an entity of the RDE Type must have. 
Thus the hook execution cannot be turned off by users of the type.

Users who have Full Control access to the type definition, 
however, can explicitly turn off the hook executions for an operation by providing the `invokeHooks=false` query parameter
in the request. For example:

```text
POST https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entityTypes/urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0?invokeHooks=false
```

The `invokeHooks` query parameter is accepted only if the user making the request has a Full Control ACL for the specific type. The creator of the RDE type is granted such ACL by default. An ACL can be granted to other users as well via the [Type Access
Controls API](https://developer.vmware.com/apis/vmware-cloud-director/v38.1/type-access-controls/).
