# Runtime Defined Entities Operations

## Entity Creation

### Entity Creation Request

А new Runtime Defined Entity is [created as an instance of its RDE Type](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entityTypes/id/post/). For example, an entity of the type `urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0` is created in the following way:

```text
POST https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entityTypes/urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0
```

```json
{
  "name": "exhibitionEntity",
  "entity": {
    "cluster": {
      "name": "exhibitionCluster",
      "nodes": [{"name": "node-1", "ip": "10.244.0.1"}]
    }
  }
}
```

The initial contents of the new Defined Entity are provided in the `entity` property.
The entity contents do not have to be valid with respect to the JSON Schema of the entity's type
until the entity is resolved.

Besides `entity`, the other properties that can be provided upon entity creation are

- `name` - the name of the entity
- `externalId` (optional) - the ID of an external entity that the entity may have a relation to

The following entity properties are filled in automatically upon creation and do not need to be provided:

- `id` - the entity ID
- `entityType` - the ID of the entity's type
- `entityState` - the current state of the entity
- `owner` - the owner of the entity
- `org` - the tenant of the entity

### Creation Task and Entity ID

The entity creation REST API call constructs a task to track the RDE creation process.
The entity creation task completes successfully when the entity is resolved.

The entity creation API call returns a 202 response with the task URI in its Location header. For example:

```text
202 Accepted
...
Location: https://.../api/task/d475baf9-c6fe-45c1-a1a0-968b0bc46e49
```

The entity creation task representation contains the ID of the new entity in its `owner` property:

```text
GET https://.../api/task/d475baf9-c6fe-45c1-a1a0-968b0bc46e49
```

```json
{
  "id": "urn:vcloud:task:d475baf9-c6fe-45c1-a1a0-968b0bc46e49",
  "operationName": "createDefinedEntity",
  "status": "running",
  "owner": {
    "id": "urn:vcloud:type:clusterVendorA:basicContainerCluster:fcba8536-c4e3-4cfa-bf46-02971b1e4cd4",
    ...
  },
  ...
}
```

In this case the ID of the newly created entity is `urn:vcloud:type:clusterVendorA:basicContainerCluster:fcba8536-c4e3-4cfa-bf46-02971b1e4cd4`.

Another way to obtain the ID of the newly created Entity is by [using a query](rde-queries.md).

### Immediate Entity Resolution after Creation

If the Runtime Defined Entity is created using its complete contents, it is possible to initiate entity resolution immediately after its creation using the `resolveEntity` query parameter:

```text
POST https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entityTypes/urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0?resolveEntity=true
```

```json
{
  ...
}
```

The entity contents will be validated against its type schema immediatly after its creation.
If the validation is successful, the entity state will be set to `RESOLVED`.
If the validation fails, the entity state will be set to `RESOLUTION_ERROR`.

Note: The `resolveEntity` query parameter is inactive if the type has a `PostCreate` hook defined.

## Entity Retrieval

Runtime Defined Entities can be [retrieved by their IDs](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entities/id/get/) or [via queries](rde-queries.md).

For example, the entity with ID `urn:vcloud:type:clusterVendorA:basicContainerCluster:fcba8536-c4e3-4cfa-bf46-02971b1e4cd4` can be retrieved via a `GET` request:

```text
GET https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/urn:vcloud:entity:clusterVendorA:basicContainerCluster:646849d7-bc44-461c-96a4-6c297af0e753
```

```json
{
    "id": "urn:vcloud:entity:clusterVendorA:basicContainerCluster:646849d7-bc44-461c-96a4-6c297af0e753",
    "entityType": "urn:vcloud:type:clusterVendorA:basicContainerCluster:1.1.0",
    "name": "exhibitionEntity",
    "entity": {
        "cluster": {
            "name": "testCluster",
            "nodes": [
                {
                    "name": "node-1",
                    "ip": "10.244.0.1"
                }
            ]
        }
    },
    "entityState": "PRE_CREATED",
    "creationDate": "...",
    "lastModificationDate": "...",
    "owner": {
        "name": "companyAUser",
        "id": "urn:vcloud:user:aeecf2ac-1e79-4f6d-8b09-53c3af93770e"
    },
    "org": {
        "name": "CompanyA Organization",
        "id": "urn:vcloud:org:6d1b1d2e-7b55-4b32-82c0-534a6b23ea2f"
    }
}
```

## Entity Resolution

Once the entity contents have been fully filled in, [the entity can be resolved](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entities/id/resolve/post/).
For example:

```text
POST https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/urn:vcloud:entity:clusterVendorA:basicContainerCluster:646849d7-bc44-461c-96a4-6c297af0e753/resolve
```

```json
{
    "id": "urn:vcloud:entity:clusterVendorA:basicContainerCluster:646849d7-bc44-461c-96a4-6c297af0e753",
    "entityType": "urn:vcloud:type:clusterVendorA:basicContainerCluster:1.1.0",
    "name": "exhibitionEntity",
    "entity": { ... },
    "entityState": "RESOLVED",
    ...
}
```

Upon resolution, the entity contents will be validated against the entity type schema. If the validation is successful, the entity will transition to a `RESOLVED` state. Otherwise, it will transition to an `RESOLUTION_ERROR` state and the `message` property in the response will contain
a description of the validation error.

## Entity Update

Runtime Defined Entities can be modified via the [RDE Update API request](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entities/id/put/).

### Update the RDE `name` and `entity` properties

Runtime Defined Entities are usually modified to update their `entity` contents
or their `name`.

Clients typically first perform a GET request to retrieve the current contents of the entity, modify the contents as needed, and then apply the modified contents using a PUT request. For example:

```text
PUT https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/urn:vcloud:entity:clusterVendorA:basicContainerCluster:646849d7-bc44-461c-96a4-6c297af0e753
```

```json
  "name": "updatedExhibitionEntity",
  "entity": {
    "cluster": {
      "name": "exhibitionCluster",
      "nodes": [{"name": "node-1", "ip": "10.244.0.1"},
                {"name": "node-3", "ip": "10.244.0.3"}]
    }
  }
```

An important note here is that the client must be using the same API version for the GET and PUT requests in order to avoid inconsistencies due to different API behavior in the diffeent API versions.

The `entity` and `name` properties can be updated by any user who has [ReadWrite access](rde-access-control.md) to the entity.
To avoid concurrency issues during update, use the [RDE Optimistic Concurrency Control](#optimistic-concurrency-control-occ) mechanism.

### Update the RDE `owner` property

The RDE `owner` property is intended to identify the user whose quota would be used to account
for the resources used by the Defined Entity.
Its initial value is the user who created the entity.

Only users with FullControl access to the entity can update the `owner` property.

### Update the RDE `entityType` property

The RDE `entityType` property identifies the type of the entity and can only be changed
to another version of the current type. See the [RDE Versioning](rde-versions.md#upgrading-an-rde-instance-to-another-type-version) section for details.

Only users with FullControl access to the entity can update the `entityType` property.

### Optimistic Concurrency Control (OCC)

RDE Update and Delete operations support Optimistic Concurrency Control using ETags.

RDE operations that return a Defined Entity (e.g. GET) include an `ETag` header in the response. The `ETag` value represents the state of the returned Defined Entity.

Operations on the Defined Entity which need to make use of the OCC functionality must include an `If-Match` header with the ETag in each request.

A Defined Entity can be updated with a PUT request that contains an `If-Match` header with the ETag. If the current state of the Defined Entity differs from that of the provided ETag due to a concurrent modification, then the update request will fail.

Thus, if multiple clients try to concurrently update a Defined Entity and use ETags, only one will succeed. The others would have to retry the operation.
The pattern to safely update a Defined Entity concurrently is the following:

1. Perform a `GET` operation to obtain the current Defined Entity state and record the returned `ETag` header value
2. Modify the Entity contents as needed
3. Perform a `PUT` with the updated contents and add an `If-Match` header using the recorded ETag
4. If the operation fails, retry the process starting with step 1

Similarly, a Defined Entity can be deleted with a DELETE request that contains an `If-Match` header with the ETag. If the current state of the Defined Entity differs from that of the provided ETag due to a concurrent operation, then the delete request will fail.

## Entity Deletion

Runtime Defined Entities are deleted via the [DELETE API request](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entities/id/delete/).
Typically the API request deletes the entity immeidately.

If the Entity Type specifies a [`PreDelete` hook](rde-hooks.md#pre-delete-hook-behavior), however, then that hook is executed to validate whether the deletion can occur.

If the Entity Type specifies a [`PostDelete` hook](rde-hooks.md#post-delete-hook-behavior), then the entity is placed in the `IN_DELETION` state and the `PostDelete` hook is executed to clean up the related resources.
The entity is deleted once the hook completes successfully.
