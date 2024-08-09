# Defined Entity Types

A Defined Entity Type describes the content structure of the defined entities that are of that type
using a JSON schema.

In addition, the interfaces the type implements define the behaviors that can be executed on its entities.

## Definition

A new Defined Entity Type can be created via [an API call that specifies its definition](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entityTypes/post/)

Here is an example Defined Entity Type definition:

```json
{
    "name": "Basic Conainer Cluster",
    "vendor": "clusterVendorA",
    "nss": "basicContainerCluster",
    "version": "1.0.0",
    "interfaces": ["urn:vcloud:interface:clusterVendorA:containerCluster:1.0.0"],
    "schema": {
      "cluster" : {
        "type" : "object",
        "properties" : {
          "name" : { "type" : "string" },
          "nodes" : {"type" : "array", "items" : { "type" : "object" }}
        },
        "required": [ "name" ]
      }
    }
}
```

The properties `nss`, `vendor`, and `version` uniquely identify the type. Once the type is created, these properties cannot be modified.

The key Defined Entity Type properties are the following:

### Name

The human-readable name of the entity type. It may contain spaces and special symbols.

### Vendor

The ID of the vendor providing the entity type. It must be alpha-numeric.

### NSS

The ID of the entity type. It must be alpha-numeric.

### Version

The version of the entity type. It must follow the [Semantic Versioning](https://semver.org/) format.
See the [RDE Versioning](rde-versions.md) section for more details.

Once an instance of a defined entity type has been created, the entity type cannot be modified anymore. This preserves the consistency of the entities in time.
If changes are needed, [a new version](rde-versions.md) of the type must be created.

### Schema

The structure of the type entities is defined via a [JSON schema](https://json-schema.org/) that specifies the fields and attributes to be included in a given entity. We support draft-04, draft-06 and draft-07 versions of the JSON Schema.

The contents of a newly created entity do not have to match the type schema [immediately upon the entity creation](defined-entities-lifecycle.md#creation-phase). However, the contents must match the schema for the entity to be resolved.

#### Custom additions to the JSON Schema

Fields defined in the JSON schema of a Defined Entity Type can be annotated with `x-vcloud-restricted` to restrict the access to the fields or to mark them as encrypted. For example:

```json
...
"clusterState" : {
  "type" : "string",
  "x-vcloud-restricted" : ["protected", "secure"]
}
...
```

More information about the possible field annotations and their values can be found in the [Field-level RDE Access Contol and Encryption](rde-access-control.md#field-level-rde-access-contol-and-encryption) section.

### Interfaces

The list of IDs of the [interfaces](defined-interfaces.md) that the type implements.

### Hooks

The behaviors that must be bound to the [type lifecycle event hooks](rde-hooks.md).

## Example API calls

### Create a Defined Entity Type

A new Defined Entity Type can be created by authorized clients via [an API call](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entityTypes/post/). For example:

```text
POST /cloudapi/1.0.0/entityTypes
```

```json
{
    "name": "Basic Conainer Cluster",
    "vendor": "clusterVendorA",
    "nss": "basicContainerCluster",
    "version": "1.0.0",
    "schema": {
      "cluster" : {
        "type" : "object",
        "properties" : {
          "name" : { "type" : "string" },
          "nodes" : {"type" : "array", "items" : { "type" : "object" }}
        },
        "required": [ "name" ]
      }
    }
}
```

Response:

```json
{
    "name": "Basic Conainer Cluster",
    "id": "urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0",
    "vendor": "clusterVendorA",
    "nss": "basicContainerCluster",
    "version": "1.0.0",
    "schema": {
      "cluster" : {
        "type" : "object",
        "properties" : {
          "name" : { "type" : "string" },
          "nodes" : {"type" : "array", "items" : { "type" : "object" }}
        },
        "required": [ "name" ]
      }
    },
    "interfaces": [],
    "hooks": null,
    "inheritedVersion": null,
    "readonly": false
}
```

### Update a Defined Entity Type

A Defined Entity Type definition can be updated by authorized clients via [an API call](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entityTypes/id/put/). For example:

The `vendor`, `nss`, and `schema` cannot be changed when updating the type.

A Defined Entity Type can only be updated if no entities exist that are instances of the type.

```text
PUT /cloudapi/1.0.0/entityTypes/<defined-entity-type-id>
```

```json
{
    "name": "Simple Conainer Cluster",
    "vendor": "clusterVendorA",
    "nss": "basicContainerCluster",
    "version": "1.0.0",
    "schema": {
      "cluster" : {
        "type" : "object",
        "properties" : {
          "name" : { "type" : "string" },
          "nodes" : {"type" : "array", "items" : { "type" : "object" }}
        },
        "required": [ "name" ]
      }
    }
}
```

Response:

```json
{
    "name": "Simple Conainer Cluster",
    "id": "urn:vcloud:type:clusterVendorA:basicContainerCluster:1.0.0",
    "vendor": "clusterVendorA",
    "nss": "basicContainerCluster",
    "version": "1.0.0",
    "schema": {
      "cluster" : {
        "type" : "object",
        "properties" : {
          "name" : { "type" : "string" },
          "nodes" : {"type" : "array", "items" : { "type" : "object" }}
        },
        "required": [ "name" ]
      }
    },
    "interfaces": [],
    "hooks": null,
    "inheritedVersion": null,
    "readonly": false
}
```

### Delete a Defined Entity Type

A Defined Entity Type definition can be deleted by authorized clients via [an API call](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/entityTypes/id/delete/):

```text
DELETE /cloudapi/1.0.0/entityTypes/<defined-entity-type-id>
```

A Defined Entity Type can only be deleted if no entities exist that are instances of the type.
