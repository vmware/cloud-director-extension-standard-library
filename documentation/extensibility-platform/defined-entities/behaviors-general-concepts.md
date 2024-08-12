# Runtime Defined Entity Behaviors

## Prerequisites
It is recommended to get familiar with the concepts of [Defined Entity Types](defined-entity-types.md), [Defined Entities](defined-entities-overview.md) and [Interfaces](defined-interfaces.md) before moving on to Behaviors. 

## Overview
Runtime Defined Entity Behaviors (or just Behaviors) are operations which execute custom logic in Cloud Director. 

A number of behavior execution types are supported:
- [Webhook behaviors](webhook-behaviors.md)
- [MQTT behaviors](mqtt-behaviors.md)
- [VRO behaviors](vro-behaviors.md)
- [AWS Lambda behaviors](aws-lambda-behaviors.md)
- [No-op behaviors](no-op-behaviors.md)

Behaviors can be executed on a defined entity via an API call if the user has the [necessary access permissions](#behaviors-access-control). In addition, behaviors can also be configured to be automatically executed in relation to the defined entity’s lifecycle events (PostCreate, PostUpdate, PreDelete, PostDelete). Starting with Cloud Director 10.5.1, behaviors can also be [invoked statically](#staticstandalone-behavior-invocation) without referring to a defined entity.

## General concepts
### Interface Behaviors
Behaviors are defined in an Interface (a collection of Behaviors). 

```
POST /cloudapi/1.0.0/interfaces/<interface-id>/behaviors
```

```json
{ 
    "name": "noopBehavior",
    "execution" : {
        "type": "noop"
    }
}
```
Response:
```json
{
    "name": "noopBehavior",
    "id": "urn:vcloud:behavior-interface:noopBehavior:vmware:test:1.0.0",
    "ref": "urn:vcloud:behavior-interface:noopBehavior:vmware:test:1.0.0",
    "description": null,
    "execution": {
        "type": "noop"
    }
}
```
API reference can be found [here](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/interfaces/id/behaviors/post/).
### Type Behaviors
Each RDE Type implements one or more interfaces. The behaviors defined in those interfaces can be executed on instances of the RDE Type.

It is possible for the RDE Type definition to override the execution and description of interface behaviors. If an overridden behavior is executed on an instance of that RDE Type, then the behavior defined in the RDE Type will be invoked, rather than the default behavior in the inherited Interface, even if the behavior is specified by its Interface ID.

```
PUT cloudapi/1.0.0/entityTypes/<entity-id>/behaviors/<behavior-ref>
```

```json
{
    "name": "noopBehavior",
    "description": "Some description",
    "execution": {
             "type": "WebHook",
             "id": "testWebHook",
             "href": "..." ,
             "_internal_key": "...",
             "execution_properties": {
                "actAsToken": true
             }
    }
}
```
Response:

```json
{
    "name": "noopBehavior",
    "id": "urn:vcloud:behavior-type:noopBehavior:vmware:testType:1.0.0:vmware:test:1.0.0",
    "ref": "urn:vcloud:behavior-interface:noopBehavior:vmware:test:1.0.0",
    "description": "Some description",
    "execution": {
        "id": "testWebHook",
        "href": "...",
        "type": "WebHook",
        "execution_properties": {
            "actAsToken": true
        }
    }
}
```
API reference can be found [here](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entityTypes/id/behaviors/behaviorId/put/).
### Behavior Definition
All types of behavior execution have a common definition structure:

```json
{
    "name": "noopBehavior",
    "id": "urn:vcloud:behavior-type:behaviorName:typeVendor:typeName:typeVersion:interfaceVendor:interfaceName:interfaceVersion",
    "ref": "urn:vcloud:behavior-interface:behaviorName:interfaceVendor:interfaceName:interfaceVersion",
    "description": null,
    "execution": {
        "type": "...",
        "execution_properties": {...}
    }
}
```
The behavior __execution type__ is set in the `type` field of the `execution` section. 
#### Behavior id vs. ref
A behavior has both an `id` and a `ref`. Their values can be both the same or different. This is depending on whether the behavior is overridden in a Defined Entity Type. More information on how to override a behavior can be found [here](#type-behaviors). 

The `id` property holds the actual behavior id. If the behavior is not overridden, it is a `behavior-interface` id: 
```
urn:vcloud:behavior-interface:behaviorName:interfaceVendor:interfaceName:interfaceVersion
```
Otherwise, it is a `behavior-type` id: 
```
urn:vcloud:behavior-type:behaviorName:typeVendor:typeName:typeVersion:interfaceVendor:interfaceName:interfaceVersion
```

The `ref` property always holds a reference to the interface behavior to be used for polymorphic behavior invocations - it always holds the `behavior-interface` id.

#### Special execution properties
There are some special properties which can be set in the behavior definition `execution` or `execution_properties` sections.
- scope - `static`/`dynamic` - default is `dynamic`. This property sets the scope of the behavior. If set to `dynamic` the behavior must be invoked on a RDE instance. If set to `static` the behavior can be invoked both statically (without a RDE instance) and dynamically. More about static and dynamic behaviors can be found [here](#behavior-invocation).

- Fields with the prefix `_internal_` are write-only. Once they are set, they cannot be obtained through a GET request on the behavior. The field value is saved in the DB in an encrypted form. It is only accessible to Cloud Director (e.g. the shared secret in webHook behaviors). These fields can be defined at the top level of the behavior's `execution` or `execution_properties` sections.

```json
"execution": {
         "type": "...",
         "_internal_key": "...",
         "execution_properties": {
             "_internal_key_1": "..."
         }
}
```
- Fields with the prefix `_secure_` are write-only. Once they are set, they cannot be obtained through a `GET` request on the behavior. The field value is saved in the DB in an encrypted form. However, this field is accessible to the behavior execution code. This means a different thing in the context of different types of behaviors (i.e. these fields are accessible to the webHook behaviors' template). These fields can be defined at the top level of the behavior's `execution` or `execution_properties` sections.

```json
 "execution": {
         "type": "...",
         "_secure_key": "...",
         "execution_properties": {
             "_secure_key_1": "..."
         }
}
```
- `actAsToken` - `boolean` (default is `false`) – set to true if a Cloud Director act-as token needs to be included in the behavior invocation arguments. Depending on the type of behavior an act-as token might be needed in order to make additional API calls to Cloud Director. The token invalidates when the behavior execution completes (the behavior invocation task is completed). The token is created on behalf of the user who invokes the behavior. This property is part of the `execution_properties` section.

```json
 "execution": {
         "type": "...",
         "execution_properties": {
             "actAsToken": "true"
         }
}
```

Here is a sample API call for creating a behavior:

```
POST /cloudapi/1.0.0/interfaces/<interface-id>/behaviors
```
```json
{ 
    "name": "noopBehavior",
    "execution" : {
        "type": "noop"
    }
}
```
Response:

```json
{
    "name": "noopBehavior",
    "id": "urn:vcloud:behavior-interface:noopBehavior:vmware:test:1.0.0",
    "ref": "urn:vcloud:behavior-interface:noopBehavior:vmware:test:1.0.0",
    "description": null,
    "execution": {
        "type": "noop"
    }
}
```
API reference can be found [here](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/interfaces/id/behaviors/post/).
## Behavior Invocation
Behavior invocation is an asynchronous operation in Cloud Director since a behavior execution is a long running process. For each behavior invocation, a `BEHAVIOR_INVOCATION` task is created to track the execution. 

Behaviors can be defined as either dynamic or static.

Dynamic behaviors must be invoked in the context of an RDE instance.

Static (or standalone) behaviors do not need to refer to a defined entity instance in order to be invoked. However, such behaviors can be invoked in the context of a defined entity instance as well.

By default, behaviors as created as dynamic. In Cloud Director 10.4.3 and Cloud Director 10.5.1+ there is the option to define a behavior as static as well.

### Dynamic Behavior Invocation
A dynamic behavior invocation on a defined entity is performed with the following API call:

```
POST /cloudapi/1.0.0/entities/<entity-id>/behaviors/<behavior-id>/invocations
```
```json
{
    "arguments": {
        "x": 7
    }, 
    "metadata": {
        "convert": true
    } 
}
```

Response:
```
202 Accepted

Headers:
Location: https://<vcd-host>/api/task/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```
API reference can be found [here](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entities/id/behaviors/behaviorId/invocations/post/).

The `<entity-id>` represents the id of the entity which the behavior will be invoked on.

### Static/Standalone Behavior Invocation
A static/standalone behavior invocation is performed with the following API call:
```
POST /cloudapi/1.0.0/interfaces/<interface-id>/behaviors/<behavior-id>/invocations
```
```
Response:
202 Accepted

Headers:
Location: https://<vcd-host>/api/task/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```
API reference can be found [here](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/interfaces/id/behaviors/behaviorId/invocations/post/).
The `<interface-id>` is the id of the interface which the behavior is defined in.

### Invocation Arguments
When invoking a behavior, an API user can supply arguments and metadata to the behavior invocation. Apart from user-defined arguments, the behavior code might also receive additional metadata information upon execution. The metadata depends on the specific type of behavior execution.
#### User Defined Invocation Arguments
The user defined invocation arguments are defined in the body of the behavior invocation request.

```json
{
    "arguments": {
        "x": 7,
        ...
    }, 
    "metadata": {
        "convert": true,
        ...
    } 
}
```
#### Payload Received by the Behavior Execution Code
The different types of behavior execution types have a different format of the payload which the custom execution code receives. More detailed information for each behavior execution type can be found in the dedicated documentation for this execution type:
- [Webhook behaviors](webhook-behaviors.md)
- [MQTT behaviors](mqtt-behaviors.md)
- [VRO behaviors](vro-behaviors.md)
- [AWS Lambda behaviors](aws-lambda-behaviors.md)
- [No-op behaviors](no-op-behaviors.md)

### Behavior Invocation Task
Each behavior invocation is tracked by a `BEHAVIOR_INVOCATION` task. Once the behavior execution is completed, the tracking task will also be completed. If the behavior execution is successful, the task will succeed and the result of the execution will be in the `result` field of the task. If the behavior execution fails, the task will also fail with the appropriate error in the `error` field of the task. The execution result is always a JSON-encoded string (or null).

If the behavior execution type supports a behavior execution log, a reference to the log will be in the `resultReference` of the task.

API call to get a task:

```
GET /api/task/<task-id>
```
Response:
```json
{
    "otherAttributes": {},
    "link": [
        {
            "otherAttributes": {},
            "href": "https://127.0.0.1:8443/api/task/d5ca75e4-9d14-4a9e-98d2-1fbdb4ce7d97",
            "id": null,
            "type": "application/vnd.vmware.vcloud.task+xml",
            "name": "task",
            "rel": "edit",
            "model": null,
            "vCloudExtension": []
        },
        {
            "otherAttributes": {},
            "href": "https://127.0.0.1:8443/api/task/d5ca75e4-9d14-4a9e-98d2-1fbdb4ce7d97",
            "id": null,
            "type": "application/vnd.vmware.vcloud.task+json",
            "name": "task",
            "rel": "edit",
            "model": null,
            "vCloudExtension": []
        }
    ],
    "href": "https://127.0.0.1:8443/api/task/d5ca75e4-9d14-4a9e-98d2-1fbdb4ce7d97",
    "type": "application/vnd.vmware.vcloud.task+json",
    "id": "urn:vcloud:task:d5ca75e4-9d14-4a9e-98d2-1fbdb4ce7d97",
    "operationKey": null,
    "description": null,
    "tasks": null,
    "name": "task",
    "owner": {
        "otherAttributes": {},
        "href": "",
        "id": "urn:vcloud:entity:vmware:testType:92016846-f98b-400e-aa4b-db4a4c6b9007",
        "type": "application/json",
        "name": "entity",
        "vCloudExtension": []
    },
    "error": null,
    "user": {
        "otherAttributes": {},
        "href": "https://127.0.0.1:8443/api/admin/user/3b81c0f4-5463-4177-aa6c-26e603323d6c",
        "id": "urn:vcloud:user:3b81c0f4-5463-4177-aa6c-26e603323d6c",
        "type": "application/vnd.vmware.admin.user+xml",
        "name": "administrator",
        "vCloudExtension": []
    },
    "organization": {
        "otherAttributes": {},
        "href": "https://127.0.0.1:8443/api/org/a93c9db9-7471-3192-8d09-a8f7eeda85f9",
        "id": "urn:vcloud:org:a93c9db9-7471-3192-8d09-a8f7eeda85f9",
        "type": "application/vnd.vmware.vcloud.org+xml",
        "name": "System",
        "vCloudExtension": []
    },
    "progress": null,
    "params": null,
    "details": "",
    "vcTaskList": {
        "otherAttributes": {},
        "vcTask": [],
        "vCloudExtension": []
    },
    "result": { // the behavior result
        "resultContent": "{\"arguments\":{\"x\":7},\"entityId\":\"urn:vcloud:entity:vmware:testType:92016846-f98b-400e-aa4b-db4a4c6b9007\",\"typeId\":\"urn:vcloud:type:vmware:testType:1.0.0\",\"entity\":{\"entity\":{\"VcdVm\":{\"name\":true}}}}",
        "resultReference": null
    },
    "status": "success",
    "operation": "Invoked noopBehavior test(urn:vcloud:entity:vmware:testType:92016846-f98b-400e-aa4b-db4a4c6b9007)",
    "operationName": "executeBehavior",
    "serviceNamespace": "com.vmware.vcloud",
    "startTime": "2024-03-06T14:11:57.473+0200",
    "endTime": "2024-03-06T14:11:59.989+0200",
    "expiryTime": "2024-06-04T14:11:57.473+0300",
    "cancelRequested": false,
    "vCloudExtension": []
}
```

### Behavior Execution Log
AWSLambda behaviors support storing a behavior execution log. A reference to the log is saved in the `resultReference` section of the behavior invocation task:

```json
{
...
"result": {
        "resultContent": null,
        "resultReference": {
            "otherAttributes": {},
            "href": "https://<vcd-host>/cloudapi/1.0.0/entities/<entity-id>/behaviors/<behavior-id>/invocations/e7b750e0-4b4e-4cf2-9277-2aa9d2af5349/log",
            "id": "e7b750e0-4b4e-4cf2-9277-2aa9d2af5349",
            "type": "text/plain",
            "name": "behaviorLog",
            "vCloudExtension": []
        }
    }
...
}
```

By using the `href` from the `resultReference` field, the specific log file can be downloaded provided the user has the right to invoke the behavior on the specified entity.

The lifetime of log entries can be configured in the `behavior.logs.lifetime.hours` configuration property. The default is 48 hours.
## Behaviors Access Control
### Dynamic Behaviors Access Control
Dynamic behaviors have an access control mechanism for execution based on the RDE instance which the behavior is invoked on. The access controls are defined in the defined entity type scope. They specify what minimum level of access an API user must have to a defined entity instance of that type in order to invoke a specific behavior on that defined entity instance. If no behavior access control is created for a specific RDE Type and a specific behavior, then this behavior is effectively not executable on any of the RDE instances of the type.

Behavior executions are not subject to any access control rules if the execution is initiated as a [RDE lifecycle hook](rde-hooks.md) execution.

Example API call to create a behavior access control:
```
POST /cloudapi/1.0.0/entityTypes/<entity-type-id>/behaviorAccessControls
```
```json
{
    "behaviorId": "<behavior-id>",
    "accessLevelId": "urn:vcloud:accessLevel:ReadWrite"
}
```

API reference can be found [here](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entityTypes/id/behaviorAccessControls/post/).

The possible access levels are:
- `urn:vcloud:accessLevel:ReadOnly` - if `accessLevelId` is set to this value, an API user must have at least RO (read-only) access to a defined entity instance in order to invoke the behavior with id `<behavior-id>` on that defined entity instance.
- `urn:vcloud:accessLevel:ReadWrite`- if `accessLevelId` is set to this value, an API user must have at least RW (read-write) access to a defined entity instance in order to invoke the behavior with id `<behavior-id>` on that defined entity instance.
- `urn:vcloud:accessLevel:FullControl`- if `accessLevelId` is set to this value, an API user must have FC (full control) access to a defined entity instance in order to invoke the behavior with id `<behavior-id>` on that defined entity instance.

More information on RDE access control can be found [here](rde-access-control.md).

### Static Behaviors Access Control
Currently, static behaviors do not have an access control mechanism for execution.

## Behaviors as RDE Lifecycle hooks
Behaviors can be configured to execute at the different lifecycle stages of a defined entity:
- [Post Create](#post-create-behavior-hook)
- [Post Update](#post-update-behavior-hook)
- [Pre Delete](#pre-delete-behavior-hook)
- [Post Delete](#post-delete-behavior-hook)

More information on RDE lifecycle hooks can be found [here](rde-hooks.md).
