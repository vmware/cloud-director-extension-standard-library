# RDE Versioning

## Goal

Runtime Defined Entity Interfaces and Types are versioned. There can be
several RDE Interfaces and Types with the same Vendor and NSS, but with
different Version IDs. For example:

- urn:vcloud:type:vmware:tkgcluster:1.0.0
- urn:vcloud:type:vmware:tkgcluster:1.1.0

Each version has its own definition. For example, each RDE Type version
can specify a different JSON Schema.

The version mechanism preserves the consistency of the existing Runtime
Defined Entity instances as the RDE definitions evolve.

If there exist RDE instances that are based on given Type and Interface
versions, then those versions become immutable.

If an extension is upgraded and needs to use enhanced functionality in
its RDE instances, it can create a new version of its RDE Type with an
updated JSON Schema. The extension can then create new entities based on
the new RDE Type version.

The extension can also access and update RDE instances based on other RDE Type versions while keeping their data consistent. See the section [Handling different RDE instance versions](#handling-different-rde-instance-versions) for details.

## RDE Version Format

RDEs use the “Semantic Versioning” standard. Versions must be of the form
MAJOR.MINOR.PATCH, where each section is numeric, for example: 1.0.0,
1.1.0, 2.1.1.

The standard Semantic Versioning precedence is used where it is needed
(e.g. see the section Access Control and Versioning). For example, 1.0.0
\< 2.0.0 \< 2.1.0 \< 2.1.1 .

Note: RDEs do not support additional versioning labels for pre-releases,
e.g. 1.0.0-alpha.

## RDE IDs and Classification IDs

The version ID is part of the RDE Interface and Type IDs, for example:

- urn:vcloud:interface:vmware:k8s:1.0.0
- urn:vcloud:type:vmware:tkgcluster:1.0.0

RDE Instances do not have a version in their IDs, as the IDs must stay
the same, even if they are upgraded to a different version of the type.
An example instance ID:

```text
urn:vcloud:entity:vmware:tkgcluster:56bacbaa-8ddc-4bef-b7a5-e8f6758aff25
```

The version of the instance can be seen in the type ID in its
representation:

```text
GET
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:tkgcluster:56bacbaa-8ddc-4bef-b7a5-e8f6758aff25
```

```json
{
    "id": "urn:vcloud:entity:vmware:tkgcluster:56bacbaa-8ddc-4bef-b7a5-e8f6758aff25",
    "entityType": "urn:vcloud:type:vmware:tkgcluster:1.0.0",
    …
}
```

While performing RDE queries, it is possible to use “Classification” RDE
Type or Interface IDs that have an incomplete version. For example, the
following query:

```text
GET
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/types/vmware/tkgcluster/1
```

will return all entities of type
urn:vcloud:type:vmware:tkgcluster:**1.x.x** – any type version with
major version of 1.

## Handling different RDE instance versions

If an extension is upgraded and needs to use enhanced functionality in
its RDE instances, it has to create a new version of the RDE Type with
the updated JSON Schema.

RDE instances of different versions of the same RDE Type can exist at
the same time. An extension can choose how to manage its access to these
different RDE instance versions.

It can either upgrade the existing RDE instances to a new version of the
RDE Type, or it can request the entity and specify that the
contents must be converted to a specific version before they are
returned to the client.

### Upgrading an RDE instance to another type version

RDE instances can be upgraded to another type version either
individually or globally.

#### Individual RDE instance upgrade

To change the type version of an instance, it can be updated with the
"entityType" property set to the ID of the desired type version.

```text
PUT
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:tkgcluster:56bacbaa-8ddc-4bef-b7a5-e8f6758aff25
```

```json
{
    "entityType": "urn:vcloud:type:vmware:tkgcluster:1.1.0",
    …
}
```

A user must have Full Control access to the entity to be able to perform
the operation.
The new type version can be either higher or lower, hence it is possible
to downgrade the entity as well.

It is desirable to ensure that the updated entity contents match the
schema of the new type version, otherwise the entity resolution may
fail.

In case the schema of the new type version has required fields and those
fields are missing in the entity contents, then the fields will be
automatically filled in with their default values if such default values
are defined in the new schema.

#### Mass RDE upgrade

All instances of particular RDE Type versions can be upgraded or
downgraded to another version using the [RDE Version Migration API](https://developer.vmware.com/apis/vmware-cloud-director/v38.1/cloudapi/1.0.0/entityTypes/typeId/migrateEntities/post/).

The mass RDE upgrade is a long-running process that updates the selected
RDE instances using the same rules as an individual RDE
instance upgrade.

#### RDE Conversion to a specific type version upon request

It is possible to get or query RDE instances converted to a specific RDE
Type version using the “acceptType” query parameter, for example:

```text
GET
https://{{vcd_host}}:{{vcd_port}}/cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:tkgcluster:56bacbaa-8ddc-4bef-b7a5-e8f6758aff25?acceptType=urn:vcloud:type:vmware:tkgcluster:1.1.0
```

This operation will not modify the entity. It will only attempt to
convert its representation in the response.

The functionality allows several extension versions to operate
concurrently, each specifying the version they require. For performance
reasons, however, it is preferable that the extensions use the upgrade
functionality instead and also use backward and forward compatible
schema so that they could operate on entities of any version without the
need of an explicit conversion.

## RDE Type Versions and RDE Access Control

The user access to RDE Instances is controlled by a combination of RDE
Type Rights that are generated for each RDE Type, as well as ACLs.

The RDE Type Rights can be assigned to the user’s role and represent the
capabilities of the user (e.g. “Editor”). The RDE Type Rights are
version-agnostic – the same RDE Type Rights are used for all versions of
a particular RDE Type. This avoids the need to update the user roles
when new versions of an RDE Type become available.

The ACLs of RDE Instances specify the access a user has to the
corresponding instance. The RDE Instance ACLs are also version-agnostic
– they are not affected if the RDE Type version of the instance changes.

In short, RDE Type versions do not affect the typical RDE Access
Control.

### Special Case: RDE Type versions with explicitly specified limited access

Providers may sometimes want to publish new experimental RDE Type
versions only to some organizations or users. This can be achieved by
adjusting the ACLs of a specific RDE Type version via the [Type Access
Controls API](https://developer.vmware.com/apis/vmware-cloud-director/v38.1/type-access-controls/).

The RDE Type ACLs control which Users or Organizations can “see” the
Type version and perform operations with its instances based on the
users’ personal RDE Type Rights and instance ACLs.

By default when the Rights Bundle of an RDE Type is published to an
Organization, the whole Organization is automatically granted ACLs to
all defined versions of the published RDE Type.

In addition, when a new RDE Type version is defined, it automatically
inherits the ACLs of the previous version of the RDE Type. In that way
there is no need to explicitly assign ACLs to new RDE Type versions.

Providers, however can modify the RDE Type ACLs using the aforementioned
API endpoint to allow only some Users or Organizations to “see” specific
versions.

### Special Case: Defining an older RDE Type version

If an older RDE Type version is defined, it will not automatically
inherit the ACLs of the existing RDE Type versions and thus may be
invisible to the tenants. To resolve this, the provider must either
explicitly update the RDE Type version ACLs using the API, or simply
unpublish and then republish the RDE Type to the relevant Organizations.
