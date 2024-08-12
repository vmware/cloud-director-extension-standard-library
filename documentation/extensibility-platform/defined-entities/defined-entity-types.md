# Defined Entity Types

Defined entity types describe the structure and behaviors of defined entities.

The behaviors of a type are specified by associating one or more interfaces with it. At least one interface must be connected with a type. 

## Definition

Example defined entity type definition:

```json
{
    "name": "test",
    "nss": "test",
    "version": "1.0.0",
    "vendor": "vmware",
    "schema": {
		"type" : "object",
		"properties" : {
			"id" : {
                "type" : "number",
                "readOnly" : true
            }
		}
	}
}
```

### Vendor
User defined field that holds the name of the vendor.

### Name
User defined field.

### NSS
User defined field that is part of the identification.

### Version
Once an instance of a defined entity type has been created, the type, schema, and behaviors cannot be changed anymore. This is essential because if modifications are made, entities with the prior schema would become invalid. This is why types must be versioned and versions must follow [Semantic Versioning](https://semver.org/) principles.

When a defined entity instance is based on an earlier version of the entity type, you can upgrade the defined entity to use a later version of the type by setting the type property of the entity to the ID of the new type. More information on versioning can be found here: [Versioning](rde-versions.md).

### Exact and Classification IDs

The tuple `vendor:nss:version` identifies a type. The Exact ID describes the entire tuple. When used in querying it (if found) results in exactly one type. Classification IDs omits the version. When used in querying it results in all versions of the type that has the same vendor and nss. More information and examples on querying can be found here: [Version Querying](rde-queries.md)

### Schema

The structure is defined directly on the type as a schema that specifies  which fields and attributes must be included in a given entity, as well as the data types, cardinality, and optionality of the fields. When a defined entity is created, in the API call, the contents of the entity property must match the schema specified in the entity type. It is represented in [JSON Schema](https://semver.org/) format. We support draft-04, draft-06 and draft-07 of the JSON Schema.

### Custom additions to JSON Schema

The access to a defined entity's contents can be additionally restricted by annotating certain fields (which need to be restricted) with `x-vcloud-restricted` in the Defined Entity Type's JSON schema. In addition to restricting access to certain defined entity fields, users can also mark such fields as encrypted.
```json
...
"clusterState" : {
  "type" : "string",
  "x-vcloud-restricted" : ["protected", "secure"]
}
...
```
More information about the possible restriction fields and their values can be found here: [Field-level RDE Access Contol and Encryption](rde-access-control.md#field-level-rde-access-contol-and-encryption).

## Example API calls

### Create a type:

```
POST /cloudapi/1.0.0/entityTypes
```
```json
{
    "name": "test",
    "nss": "test",
    "version": "1.0.0",
    "vendor": "vmware",
    "schema": {
		"type" : "object",
		"properties" : {
			"id" : {
                "type" : "number",
                "readOnly" : true
            }
		}
	}
}
```
Response:
```json
{
    "id": "urn:vcloud:type:vmware:test:1.0.0",
    "name": "test",
    "nss": "test",
    "version": "1.0.0",
    "inheritedVersion": null,
    "schema": {
        "type": "object",
        "properties": {
            "id": {
                "type": "number",
                "readOnly": true
            }
        }
    },
    "vendor": "vmware",
    "interfaces": [],
    "hooks": null,
    "readonly": false
}
```

### Update a type:
```
PUT /cloudapi/1.0.0/entityTypes/<defined-entity-type-id>
```
```json
{
    "name": "test1",
    "nss": "test",
    "version": "1.0.0",
    "vendor": "vmware",
    "schema": {
		"type" : "object",
		"properties" : {
			"id" : {
                "type" : "number",
                "readOnly" : true
            }
		}
	}
}
```
Response:
```json
{
    "id": "urn:vcloud:type:vmware:test:1.0.0",
    "name": "test1",
    "nss": "test",
    "version": "1.0.0",
    "inheritedVersion": null,
    "schema": {
        "type": "object",
        "properties": {
            "id": {
                "type": "number",
                "readOnly": true
            }
        }
    },
    "vendor": "vmware",
    "interfaces": [],
    "hooks": null,
    "readonly": false
}
```
#### Important Note: The vendor, nss and schema cannot be changed when updating the type.

### Delete an interface
```
DELETE /cloudapi/1.0.0/entityTypes/<defined-entity-type-id>
```

#### Important Note: Defined entity type cannot be deleted if it is marked as readOnly.