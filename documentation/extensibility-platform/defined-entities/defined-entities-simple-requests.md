# Example RDE API requests

All RDE management operations are performed via the REST API. Here is a simple example
sequence of RDE API requests:

## Creating a new RDE Type representing a basic Container Cluster

A Kuberenetes extension developer may need to store information about the Kubernetes clusters that
the extension manages. Such information can be stored in a Runtime Defined Entity instance.
To do so, the extension first needs to define an RDE Type that specifies the schema of the RDE instances
that the extensions would create and use. For example:

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
  "schema": {
    "type" : "object",
    "properties" : {
      "cluster" : {
        "type" : "object",
        "properties" : {
          "name" : { "type" : "string" },
          "nodes" : {"type" : "array", "items" : { "type" : "object" }}
        }
      }
    }
  }
}
```

The request above creates a new RDE type named 'basicContainerCluster' with version '1.0.0' in the scope of vendor 'clusterVendorA'. The JSON schema of the type defines a single property 'cluster' whose
value should be an object a 'name' string property, as well as a 'nodes' array property that
specifies the cluster nodes.

The API response will contain the information about the new RDE Type including its ID:

```json
{
    "id": "urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0",
    "name": "Basic Container Cluster",
    "vendor": "clusterVendorA",
    "nss": "basicContainerCluster",
    "version": "1.0.0",
    ...
}
```

In subsequent API requests the new RDE Type can be referred to by its ID --  'urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0'.

## Creating entites of the new RDE Type

One can then create entities of the new RDE Type:

```text
POST
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entityTypes/urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0
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

## Querying the entites of the new RDE Type

Entities can be [queried by type or by interface](rde-queries.md).

```text
GET
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entityTypes/urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0?filter=(name==exhibitionEntity)
```

Response:

```json
{
    "resultTotal": 1,
    "pageCount": 1,
    "page": 1,
    "pageSize": 25,
    "values": [
      {
        "id": "urn:vcloud:entity:clusterVendorA:basicContainerCluster:b80dd0a4-d69f-407a-8577-99b6010e5847",
        "entityType": "urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0",
        "name": "exhibitionEntity",
        "entity": {
          "cluster": {
            "name": "exhibitionCluster",
            "nodes": [
              {"name": "node-1", "ip": "10.244.0.1"}
            ]
          }
        },
        "entityState": "PRE_CREATED",
        "owner": ...,
        "org": ...
      },
      ...
    ]
}
```

The response shows that the ID of the new Entity is 'urn:vcloud:entity:clusterVendorA:basicContainerCluster:b80dd0a4-d69f-407a-8577-99b6010e5847' and that its current state is 'PRE_CREATED'.

The [Runtime Defined Entities](defined-entities.md) section describes the available ways to get the ID the of a newly created Entity, as well as the lifecycle of the entities and the meaning of their states.

## Updating an entity

Entities can be updated when their contents need to be augmented or modified:

```text
PUT
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/urn:vcloud:entity:clusterVendorA:basicContainerCluster:b80dd0a4-d69f-407a-8577-99b6010e5847
```

```json
{
  "name": "exhibitionEntity",
  "entity": {
    "cluster": {
      "name": "exhibitionCluster",
      "nodes": [
        {"name": "node-1", "ip": "10.244.0.1"},
        {"name": "node-2", "ip": "10.244.0.2"}
      ]
    }
  }
}
```

Whether the contents of the entity is validated against its schema depends on the state of the entity,
as described in the [Runtime Defined Entities](defined-entities.md) section.

## Further Steps

This is a simple example sequence of RDE API requests.

To access the full RDE functionality, one can create [RDE Interfaces](rde-interfaces.md) that
categorize the [RDE Types](rde-types.md) and contain [RDE Behaviors](behaviors-general-concepts.md).

For more information about the lifecycle of the Runtime Defined Entities and the avaliable operations see
the [Runtime Defined Entities](defined-entities.md), the [RDE Versioning](rde-versions.md),
and the [RDE Access Control](rde-access-control.md) sections.
