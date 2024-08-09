# RDE Queries

Runtime Defined Entities can be queried using several REST API requests.

The queries support the standart Cloud Director REST API mechanisms for paging, sorting, and filtering using the `page`, `pageSize`, `sortAsc`/`sortDesc`. and `filter` query parameters.

## Query Entities by Type

### Query Entities by Type ID

A user can perform [a query to get the accessible entities of a particular type](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entities/types/typeId/get/).
For example, for the type `urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0` the query would be:

```text
GET https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/types/urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0
```

Response:

```json
{
    "resultTotal": 37,
    "pageCount": 2,
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

### Query Entities by Type ID Segments

When it is necessary to query entities not just by a single type version, but by
several versions of that type, it is possible to [query the entities by type ID segments](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entities/types/vendor/nss/version/get/).

This query allows the specification only of the version prefix, rather than the exact version.

For example, if it is necessary to get not only the entities of the `1.0.0` version of the
`urn:vcloud:type:clusterVendorA:basicContainerCluster` type, but all of `1.x` version,
the following query can be used:

```text
GET https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/types/clusterVendorA/basicContainerCluster/1
```

## Query Entities by Interface

It is sometimes necessary to query the entities that are of types that implement
a specific interface.

### Query Entities by Interface ID

A user can perform [a query to get all accessible entities of types that implement a particular interface](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entities/interfaces/interfaceId/get/).
For example, for the interface `urn:vcloud:interface:vmware:k8s:1.0.0` the query would be:

```text
GET https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/interfaces/urn:vcloud:interface:vmware:k8s:1.0.0
```

### Query Entities by Interface ID Segments

When it is necessary to query entities not just by a single interface version, but by
several versions of that interface, it is possible to [query the entities by interface ID segments](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entities/interfaces/vendor/nss/version/get/).

This query allows the specification only of the version prefix, rather than the exact version.

For example, if it is necessary to get not only the entities of `1.0.0` version of the
`urn:vcloud:interface:vmware:k8s` interface, but all of `1.0.x` versions,
the following query can be used:

```text
GET https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/interfaces/vmware/k8s/1.0
```

## Tenancy

Tenant users can only query entities within their own tenant.

Provider users query only the entities in the 'System' organization by default.
They can, however, perform queries in the context of a tenant using
the `X-VMWARE-VCLOUD-TENANT-CONTEXT` request header to specify the tenant organization ID.

For example:

```text
    X-VMWARE-VCLOUD-TENANT-CONTEXT: urn:vcloud:org:ea806c38-09e1-482e-8d6a-582a368fbeb3
```

## Filtering

The RDE queries use the standard Cloud Director REST API filtering mechanism via the `filter` query parameter. It is possible to filter by the entity properties,
as well as the entity content's properties. For example:

Filtering by entity name:

```text
GET
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entityTypes/urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0?filter=(name==exhibitionEntity)
```

Filtering by entity content:

```text
GET
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entityTypes/urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0?filter=(entity.cluster.name==exhibitionCluster)
```

The examples above are based on having an entity with the following entity contents:

```json
 {
    "type" : "object",
    "properties" : {
      "cluster" : {"$ref" : "#/definitions/Cluster" },
      "clusterState" : {"$ref" : "#/definitions/ClusterState" },
      "topProtectedAndSecureStatus" : {
        "type" : "string",
        "x-vcloud-restricted" : ["protected", "secure"]
      },
      "privateStatus" : {
        "type" : "string",
        "x-vcloud-restricted" : "private"
      },
      "protectedStatus" : {
        "type" : "object",
        "x-vcloud-restricted" : "protected",
        "properties": {
          "phase" : {
            "type" : "string"
          },
          "privateAndSecure" : {
            "type" : "object",
            "x-vcloud-restricted" : ["private", "secure"],
            "properties": {
              "token" : {
                "type" : "string"
              }
            }
          },
          "secureArray" : {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "values"
              ],
              "properties": {
                "values": {
                  "type": "array",
                  "items": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "object"
                      }
                    ]
                  },
                  "x-vcloud-restricted": [
                    "private",
                    "secure"
                  ]
                }
              }
            }
          }
        }
      },
      "privateState" : {
        "$ref" : "#/definitions/ClusterState",
        "x-vcloud-restricted" : "private"
      }
    },
    "definitions" : {
      "Cluster" : {
        "type" : "object",
        "properties" : {
          "name" : { "type" : "string" },
          "nodes" : {"type" : "array", "items" : { "type" : "object" }}
        }
      },
      "ClusterState" : {
        "type" : "object",
        "properties" : {
          "host" : { "type" : "string" },
          "status" : {
            "type" : "string"
          }
        }
      }
    }
  }
```
