# Access Control of Runtime Defined Entities

## General Concepts

### Rights vs ACLs
Access to Runtime Defined Entities is controlled by two complimentary mechanisms - Rights and Access Control Lists (ACLs).

Rights grant the "capability" to perform a specific operation on defined entities of a specific defined entity type. For example, there could be Authors, Editors, and Users of a given defined entity type. Authors should be able to create new defined entities of that defined entity type, Editors should be able to modify defined entities of the defined entity type if they have read-write access to the defined entity, and Users should be able to view defined entities of the defined entity type if they have view access.

ACLs grant users certain levels of access (__Read-Only__, __Read-Write__, __Full-Control__) to a specific defined entity. For example, an Entity Author could create a defined entity and grant a set of other users just Read-Only access to that defined entity.

In order for a user to perform an operation on defined entity A, they must have both the capability to perform the operation as well as the needed level of access to defined entity A.

Also, there are Admin Rights which grant a user the power to access all defined entities of a defined entity type (such user is an administrator of the entity type).

The Rights/ACLs combination can be explained with a simple practical analogy. A Right is similar to a "license" for a capability (e.g. an electrician license). An ACL is similar to a "key" to a given defined entity (e.g. key to an apartment). In order to fix the electrical system of an apartment, a person must have both a license for an electrician (i.e. a Right) and a key to the apartment (i.e. an ACL).

### Rights
When a defined entity type is defined, 5 new type-specific Rights are created:
- `View: <RDE Type>` - grants the capability to view defined entities of this defined entity type
- `Edit: <RDE Type>` - grants the capability to edit defined entities of this defined entity type
- `Full Control: <RDE Type>` - grants the capability to have full control (view/edit/delete) over defined entities of this defined entity type
- `Administrator View: <RDE Type>` - grants the capability to view __all__ defined entities of this defined entity type within the given organization
- `Administrator Full Control: <RDE Type>` - grants the capability to have full control over __all__ defined entities of this defined entity type within the given organization

The level of access a user has to a defined entity is determined by the type-specific rights the user has, as well as the defined entity ACLs granted to them. For example, in order for a user to be able to modify a defined entity, they must have both an `Edit: <RDE Type>` right and at least Read-Write ACL to the defined entity.

When a defined entity type is created, a right bundle containing the 5 type-specific rights is also created - `<type vendor>:<type-nss> Entitlement`. You can use the VMware Cloud Director API or UI to publish the rights bundle to any organizations you want to manage the defined entities of this type. After publishing the rights bundle, you can assign rights from the bundle to roles within the organization.

### Access Controls
Access Control Lists (ACLs) are part of the access control mechanisms for Defined Entity Types and Defined Entity Instances. There are separate CRUD APIs for managing [Defined Entity Type ACLs](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/type-access-controls/) and [Defined Entity ACLs](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/access-controls/).

An ACL entry contains the following fields:
- `objectId` - The ID of the object this ACL refers to.
- `accessLevelId` - The [access level](#access-levels) that this ACL entry grants.
- `grantType` - The [type](#types-of-acls) of the ACL entry. Possible values are `MembershipAccessControlGrant` and `RightAccessControlGrant`.
- `tenant` - (this field is filled automatically) The ID of the object's tenant. The ACL cannot be shared outside that tenant.
- `memberId` - (for Membership ACLs) the ID of the entity (user, organization, role) that this ACL is granted to.
- `rightId` - (for Right ACLs) the ID of the right this ACL refers to.

#### Types of ACLs
There are two categories of ACLs - `MembershipAccessControlGrant` and `RightAccessControlGrant`.

Membership ACLs are used to grant access to entities such as user, organization and role.
```json
{
    "id": "urn:vcloud:accessControl:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "tenant": {
        "name": "System",
        "id": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    },
    "grantType": "MembershipAccessControlGrant",
    "objectId": "urn:vcloud:type:vmware:1234:1.0.0",
    "accessLevelId": "urn:vcloud:accessLevel:FullControl",
    "memberId": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Right ACLs refer to a specific right in Cloud Director. They are used to associate a type-specific right with an ACL.

#### Access Levels
- `urn:vcloud:accessLevel:FullControl` - grants full control access to a defined entity
- `urn:vcloud:accessLevel:ReadWrite` - grants read-write (edit) access to a defined entity
- `urn:vcloud:accessLevel:ReadOnly` - grants read-only (view) access to a defined entity

Each access level is a superset of the access levels below.

#### Example API calls

Example API call for creating an ACL:
```
POST /cloudapi/1.0.0/entities/<entity-id>/accessControls/
```
```json
{
    "grantType": "MembershipAccessControlGrant",
    "accessLevelId": "urn:vcloud:accessLevel:ReadOnly",
    "memberId": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Response:
```
201 Created
```
```json
{
    "id": "urn:vcloud:accessControl:ac31be1c-f5b2-4178-9757-db5647daffa6",
    "tenant": {
        "name": "System",
        "id": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    },
    "grantType": "MembershipAccessControlGrant",
    "objectId": "<entity-id>",
    "accessLevelId": "urn:vcloud:accessLevel:ReadOnly",
    "memberId": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

Example API call for GET-ing an ACL:
```
GET /cloudapi/1.0.0/entities/<entity-id>/accessControls/<acl-id>
```
```json
{
    "grantType": "MembershipAccessControlGrant",
    "accessLevelId": "urn:vcloud:accessLevel:ReadOnly",
    "memberId": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Response:
```
200 OK
```
```json
{
    "id": "urn:vcloud:accessControl:ac31be1c-f5b2-4178-9757-db5647daffa6",
    "tenant": {
        "name": "System",
        "id": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    },
    "grantType": "MembershipAccessControlGrant",
    "objectId": "<entity-id>",
    "accessLevelId": "urn:vcloud:accessLevel:ReadOnly",
    "memberId": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

Example API call for updating an ACL:
```
PUT /cloudapi/1.0.0/entities/<entity-id>/accessControls/<acl-id>
```
```json
{
    "grantType": "MembershipAccessControlGrant",
    "accessLevelId": "urn:vcloud:accessLevel:ReadWrite",
    "memberId": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

Response:
```
200 OK
```
```json
{
    "id": "urn:vcloud:accessControl:ac31be1c-f5b2-4178-9757-db5647daffa6",
    "tenant": {
        "name": "System",
        "id": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    },
    "grantType": "MembershipAccessControlGrant",
    "objectId": "<entity-id>",
    "accessLevelId": "urn:vcloud:accessLevel:ReadWrite",
    "memberId": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

Example API call for deleting an ACL:
```
DELETE /cloudapi/1.0.0/entities/<entity-id>/accessControls/<acl-id>
```

Response:
```
204 No Content
```
Example API call for querying all ACLs created for a defined entity instance:
```
GET /cloudapi/1.0.0/entities/<entity-id>/accessControls/
```

Response:
```
200 OK
```
```json
{
    "resultTotal": 1,
    "pageCount": 1,
    "page": 1,
    "pageSize": 25,
    "associations": null,
    "values": [
        {
            "id": "urn:vcloud:accessControl:45241ac0-25c4-49ba-9b8d-78d6a52b757b",
            "tenant": {
                "name": "System",
                "id": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            },
            "grantType": "MembershipAccessControlGrant",
            "objectId": "<entity-id>",
            "accessLevelId": "urn:vcloud:accessLevel:FullControl",
            "memberId": "urn:vcloud:user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        }
    ]
}
```
## Defined Entity Access Control
The following matrix shows what rights/ACLs a user needs to have in order to have a certain level of access to a defined entity.
<table>
    <thead>
        <tr>
            <th>Entity Operation</th>
            <th>Option</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan=2>Read</td>
            <td><b>Administrator View: TYPE</b> right</td>
            <td>Users with this right can see all runtime defined entities of this type within an organization.</td>
        </tr>
        <tr>
            <td><b>View: TYPE</b> right and ACL entry <b>>= Read-Only</b></td>
            <td>Users with this right and a read-level ACL can view runtime defined entities of this type.</td>
        </tr>
        <tr>
            <td rowspan=2>Modify</td>
            <td><b>Administrator Full Control: TYPE</b> right</td>
            <td>Users with this right can create, view, modify, and delete runtime defined entities of this type in all organizations.</td>
        </tr>
        <tr>
            <td><b>Edit: TYPE</b> right and ACL entry <b>>= Read-Write</b> </td>
            <td>Users with this right and modify-level ACL can create, view, and modify runtime defined entities of this type.</td>
        </tr>
        <tr>
            <td rowspan=2>Delete</td>
            <td><b>Administrator Full Control: TYPE</b> right</td>
            <td>Users with this right can create, view, modify, and delete runtime defined entities of this type in all organizations.</td>
        </tr>
        <tr>
            <td><b>Full Control: TYPE</b> right and ACL entry <b>= Full Control</b></td>
            <td>Users with this right and full control-level ACL can create, view, modify, and delete runtime defined entities of this type.</td>
        </tr>
    </tbody>
</table>

### The Tenancy Barrier and Defined Entities
Cloud Director is a multi-tenant platform which enables cloud service providers to host multiple independent organizations within a single instance of the platform, ensuring resource isolation, self-service provisioning, and tailored access control for each tenant.

The Defined Entities Framework also adheres to the multi-tenancy principles. Each defined entity is created within a specific organization in Cloud Director - either the provider organization (System) or a tenant organization. Defined entities cannot "cross" the tenancy barrier - a defined entity created in tenant A cannot be shared with tenant B and vice versa. Only defined entities created in the System organization can be shared with other tenant organizations. More than one tenant organization can have access to the same System defined entity.

A provider admin can execute RDE operations in the context of a tenant organization by adding the `X-VMWARE-VCLOUD-TENANT-CONTEXT` header to such HTTP requests.
### Sharing Access to Defined Entities
You can grant access to defined entities (RDEs) by sharing them with other system administrators or tenants.

To share a defined entity with a user, the rights bundle of the defined entity type (which the entity is an instance of) must be published to the organization which the user is part of. So if you wish to share a provider defined entity with a tenant user, you must first publish the rights bundle of the defined entity type to the tenant organization. See [Publish or Unpublish a Rights Bundle](https://docs.vmware.com/en/VMware-Cloud-Director/10.5/VMware-Cloud-Director-Service-Provider-Admin-Guide/GUID-C331FF7E-2300-4F94-9E32-1F3323FD648E.html).

In general there are 3 levels of access which can be granted to a defined entity - read-only (view), read-write (edit) and full control. Assign the __View: TYPE__, __Edit: TYPE__, or __Full Control: TYPE__ right from the bundle to the user roles you want to have the specific level of access to the defined entity. Also, you must grant the specific users with Access Control Lists (ACLs) with the according access level to the entities:
```
POST /cloudapi/1.0.0/entities/<entity-id>/accessControls
```
```json
 {
   "grantType" : "MembershipAccessControlGrant",
   "accessLevelId" : "urn:vcloud:accessLevel:[Access_level]",
   "memberId" : "urn:vcloud:user:[User_ID]"
 }
```
The possible values for `Access_level` are described [here](#access-levels). `User_ID` must be the ID of the user to which you want to grant the access to the defined entity.

#### Sharing Administrator Rights to Defined Entities
You can also make a user a defined entity type administrator by sharing the administrative rights to a defined entity type to the user - __Administrator View: TYPE__ or/and __Administrator Full Control: TYPE__.

For example, if you want the users with a certain role role to view all Tanzu Kubernetes clusters within the organization, you must add the __Administrator View: Tanzu Kubernetes Guest Cluster__ right to the role. If you want the users with a certain role to create, view, modify, and delete Tanzu Kubernetes clusters within the organization, add the __Administrator Full Control: Tanzu Kubernetes Guest Cluster__ right to the user role.

Users with the __Administrator Full Control: Tanzu Kubernetes Guest Cluster__ right can grant ACL access to any VMWARE:TKGCLUSTER defined entity.

#### Max Implicit Rights and RDE Access Control
The standard workflow for creating and manipulating a RDE Type must always involve an Administrative User since the RDE type rights must be added to the appropriate roles in order for the users to be able to perform any operations on the defined entity type.

The way to enable non-admin users to manipulate dynamically created RDE types without the involvement of an Administrative User is to set the `maxImplicitRight` section in the RDE Type. This grants implicit Defined Entity Type Rights to the users based on their Type ACLs. For example a Read-Write ACL to the Type would mean that the user would also have an implicit “Edit: Type” Right.

These implicit Defined Entity Type Rights are only enabled if the Type's definition has the `maxImplicitRight` property set. The value of `maxImplicitRight` specifies the maximum Right level that can be implied from the Type ACLs.

Accepted values for `maxImplicitRight` are:
- `urn:vcloud:accessLevel:ReadOnly`
- `urn:vcloud:accessLevel:ReadWrite`
- `urn:vcloud:accessLevel:FullControl`

Example RDE Type definition with `maxImplicitRight` set:
```json
{
    "name": "testType",
    "description": "string",
    "nss": "testType",
    "version": "1.0.0",
    "schema": {
        "type": "object",
        "properties": {
            "test": {
                "class": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    }
                }
            }
        },
        "required": ["class"]
    },
    "maxImplicitRight": "urn:vcloud:accessLevel:ReadWrite",
    "interfaces": [],
    "vendor": "vmware",
    "readonly": true
}
```
The above example sets a value of `maxImplicitRight` to `urn:vcloud:accessLevel:ReadWrite`. This means that a user with Read-Only or Read-Write ACL to the defined entity type will implicitly get the `Read: <Type>` and `Write: <Type>` rights respectively. And a user with Full Control ACL to the defined entity type will implicitly get the `Write: <Type>` right, but not the `Full Control: <Type>` right.

#### Changing the Owner of a Defined Entity
The owner of a defined entity or a user with the __Administrator Full Control: TYPE__ right can transfer the ownership to another user by updating the defined entity model and changing the owner field with the ID of the new owner.
```
PUT /cloudapi/1.0.0/entities/<entity-id>
```
```json
{
    "id": "urn:vcloud:entity:vmware:testType1:39f88374-6e03-4d39-8c81-f9e92a3020cf",
    "entityType": "urn:vcloud:type:vmware:testType1:1.0.0",
    "name": "test",
    "externalId": null,
    "entity": {
        "entity": {
            "VcdVm": {
                "name": true
            }
        }
    },
    "entityState": "RESOLVED",
    "owner": { // change this to the new owner
        "name": "administrator",
        "id": "urn:vcloud:user:943a9c3c-e653-42a1-a33a-e27362daa6ef"
    },
    "org": {
        "name": "System",
        "id": "urn:vcloud:org:a93c9db9-7471-3192-8d09-a8f7eeda85f9"
    }
}
```
#### Operating in Tenant Context
There are use cases where a provider user wants to make API calls to Cloud Director from the context of a tenant organization. For example, granting ACLs for a defined entity to a tenant organization in the API must be made from the context of that tenant organization.

This is done by adding a `X-VMWARE-VCLOUD-TENANT-CONTEXT` header to the API request containg the ID of the organization which context you wish to operate in.

Example API call for granting ACL to a tenant organization as a provider admin user.
```
POST /cloudapi/1.0.0/entities/<entity-id>/accessControls

Headers:
X-VMWARE-VCLOUD-TENANT-CONTEXT: urn:vcloud:org:bc2b700d-dd4b-4b1c-8f47-5b8010ac0aa9
```
```json
{
    "tenant": {
        "name": "org2",
        "id": "urn:vcloud:org:bc2b700d-dd4b-4b1c-8f47-5b8010ac0aa9"
    },
    "grantType": "MembershipAccessControlGrant",
    "objectId": "urn:vcloud:type:vmware:test:1.0.0",
    "accessLevelId": "urn:vcloud:accessLevel:ReadWrite",
    "memberId": "urn:vcloud:org:bc2b700d-dd4b-4b1c-8f47-5b8010ac0aa9"
}
```

## Field-level RDE Access Contol and Encryption

### Field Access Control

The access to a defined entity's contents can be additionally restricted by annotating certain fields (which need to be restricted) with `x-vcloud-restricted` in the Defined Entity Type's JSON schema.

```json
...
"clusterState" : {
  "type" : "string",
  "x-vcloud-restricted" : "protected"
}
...
```

The possible values for the `x-vcloud-restricted` annotation are:

- `public` - All users with any access to the defined entity can read/write this field.
- `protected` - Only users with Full Control access to the defined entity can write this field and all users with any access to the defined entity can read this field.
- `private` - only users with Full Control access to the defined entity can read/write this field.

Field access restriction annotations can be added at any content level.

An example use of the field-level access control feature is to have an entity with a public 'desiredState' field that users can update, a protected 'currenState' field that is visible to users, but only the extension can update, and a private 'internalState' field that the extension can use to keep track of its internal information.

### Field Encryption

In addition to restricting access to certain defined entity fields, users can also mark such fields as encrypted (or `secure`). The secure marker cannot be used on its own, it must be used in addition to `private`/`protected`/`public` and it does not bring any changes to the actual access restrictions which the `public`/`protected`/`private` markers impose.

```json
...
"schema":   {
        "type" : "object",
        "properties" : {
            "protectedAndSecureField" : {
              "type" : "string",
              "x-vcloud-restricted" : ["protected", "secure"]
            },
            "privateAndSecureField" : {
              "type" : "string",
              "x-vcloud-restricted" : ["private", "secure"]
            },
            "protectedField" : {
              "type" : "string",
              "x-vcloud-restricted" : "protected"
            },
            "privateField" : {
              "type" : "string",
              "x-vcloud-restricted" : "private"
            }
        }
    }
...
```
Secure fields are stored in the DB in an encrypted format (as a `base64-encoded` cipher string) and cannot be obtained via the Defined Entities API - they are either omitted or masked depending on the API version used.

When using API version `>= 38.0` secure fields are masked when returned in the API.Doing a `GET` on a defined entity with API version `38.1` for example, will return its `secure` fields masked (`******`) even if the user has Full Access Control to the defined entity instance.

When using API version `< 38.0` secure fields are omitted when returned in the API.
Doing a `GET` on a defined entity with API version `37.2` for example, will not return the entity's `secure` fields in the response even if the user has Full Access Control to the defined entity instance.

### Accessing secure fields
Behavior executions can access a defined entity instance's `secure` fields in a decrypted format if the user, who invoked the behavior has the required level of access to the defined entity (i.e. if the field is marked as `private` only users with Full Control access to the defined entity can access this field).

A user with explicit Full Control Access to the defined entity (Admin Full Control users must also have a Full Control ACL to the specific defined entity) can access the secure fields of this entity via a dedicated API call:
```
GET /cloudapi/1.0.0/entities/<entity-id>/fullContents
```
This API is audited.

### Updating a defined entity instance with "secure" fields

Updating a defined entity's secure fields is done differently depending on the API version you use.

#### API version `>= 38.0`
Doing a `PUT` on a defined entity instance with its `secure` fields masked (`******`) in the body of the request will not delete those fields. They will not be modified.

Doing a `PUT` on a defined entity instance with a secure field's value set to anything other than `******` will update the value of that field.

The way to remove a secure field from a defined entity instance is to execute a `PUT` request on the defined entity and set the `secure` field's value to `null` or not set its value at all (provided the user executing the request has the required level of access to the defined entity).

#### API version `< 38.0`
Doing a `PUT` on a defined entity instance with its `secure` fields missing from the body of the request will not delete those fields. They will not be modified.

Doing a `PUT` on a defined entity instance with a secure field's value set to anything other than `null` will update the value of that field.

The way to remove a secure field from a defined entity instance is to execute a PUT request on the defined entity and set the `secure` field's value to `null` (provided the user executing the request has the required level of access to the defined entity).

## Defined Entity Operations Access Control
<table>
  <thead>
    <tr>
      <th>Operation</th>
      <th>Requirement</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>View and query interface</td>
      <td>All users have the necessary rights.</td>
    </tr>
    <tr>
      <td>Create interface</td>
      <td>User must be a Provider user and must have the <b>Create new custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>Edit interface</td>
      <td>User must be a Provider user and must have the <b>Edit custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>Delete interface</td>
      <td>User must be a Provider user and must have the <b>Delete custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>View and query interface behaviors</td>
      <td>User must have the <b>View custom entity definitions</b> right.</td>
    </tr>
    <tr>
      <td>Add interface behavior</td>
      <td>User must be a Provider user and must have the <b>Create new custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>Edit interface behavior</td>
      <td>User must be a Provider user and must have the <b>Edit custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>Delete interface behavior</td>
      <td>User must be a Provider user and must have the <b>Edit custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>View and query defined entity type behavior overrides</td>
      <td>User must have at least <b>Read-Only</b> access to the defined entity type.</td>
    </tr>
    <tr>
      <td>Edit defined entity type behavior override</td>
      <td>User must be a Provider user, must have the <b>Edit custom entity definition</b> right and must have <b>Full Control</b> access to the defined entity type.</td>
    </tr>
    <tr>
      <td>Remove defined entity type behavior override</td>
      <td>User must be a Provider user, must have the <b>Edit custom entity definition</b> right and must have <b>Full Control</b> access to the defined entity type.</td>
    </tr>
    <tr>
      <td>View defined entity type</td>
      <td>The minimum requirement is <b>ReadOnly</b> Type ACL.</td>
    </tr>
    <tr>
      <td>Create defined entity type</td>
      <td>User must be a Provider user and must have the <b>Create new custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>Edit defined entity type</td>
     <td>User must be a Provider user and must have the <b>Edit custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>Delete defined entity type</td>
      <td>User must be a Provider user and must have the <b>Delete custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>Create defined entity</td>
      <td>User must have at least <b>Edit: RDE Type</b> right and at least <b>Read-Write</b> entity type ACL</td>
    </tr>
    <tr>
      <td>Resolve defined entity</td>
      <td>User must have at least <b>Read-Write</b> access to the defined entity.</td>
    </tr>
    <tr>
      <td>View/Query defined entity ACLs</td>
      <td>User must have at least <b>Read-Only</b> access to the defined entity.</td>
    </tr>
    <tr>
      <td>Create defined entity ACL</td>
      <td>User must have at least <b>Read-Write</b> access to the defined entity.</td>
    </tr>
    <tr>
      <td>Edit defined entity ACL</td>
      <td>User must have at least <b>Read-Write</b> access to the defined entity. Also, user's access must be equal or better than that of the ACL to modify, equal or better than that of the ACL level to be set.</td>
    </tr>
    <tr>
      <td>Delete defined entity ACL</td>
      <td>User must have at least <b>Read-Write</b> access to the defined entity. Also, user's access must be equal or better than that of the ACL to delete.</td>
    </tr>
    <tr>
      <td>View/Query defined entity type ACL</td>
      <td>User must have at least <b>Full Control</b> access to the defined entity type.</td>
    </tr>
    <tr>
      <td>Create defined entity type ACL</td>
      <td>User must have <b>Full Control</b> access to the defined entity type or the <b>Custom entity: Manage any custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>Edit defined entity type ACL</td>
      <td>User must have <b>Full Control</b> access to the defined entity type or the <b>Custom entity: Manage any custom entity definition</b> right.</td>
    </tr>
    <tr>
      <td>Delete defined entity type ACL</td>
      <td>User must have at <b>Full Control</b> access to the defined entity type or the <b>Custom entity: Manage any custom entity definition</b> right</td>
    </tr>
  </tbody>
</table>

## Examples
The examples below assume there is a tenant organization named `Tenant1` created in the Cloud Director instance.

Let's create a RDE type to use for the examples.

```
POST /cloudapi/1.0.0/entityTypes
```
```json
{
    "name": "testType",
    "description": "string",
    "nss": "testType",
    "version": "1.0.0",
    "schema": {
        "type": "object",
        "properties": {
            "test": {
                "class": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    }
                }
            }
        },
        "required": ["test"]
    },
    "interfaces": [],
    "vendor": "vmware",
    "readonly": true
}
```
Response:
```json
{
    "id": "urn:vcloud:type:vmware:testType:1.0.0",
    "name": "testType",
    "description": "string",
    "nss": "testType",
    "version": "1.0.0",
    "inheritedVersion": null,
    "externalId": null,
    "schema": {
        "type": "object",
        "properties": {
            "test": {
                "class": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    }
                }
            }
        },
        "required": [
            "test"
        ]
    },
    "vendor": "vmware",
    "interfaces": [],
    "hooks": null,
    "readonly": false,
    "maxImplicitRight": null
}
```
Let's create a defined entity instance of this type in the System organization.

```
POST /cloudapi/1.0.0/entityTypes/urn:vcloud:type:vmware:testType:1.0.0
```
```json
{

      "name": "testEntity1",
      "externalId": null,
      "entity": {
        "class": {
            "name": "test"
        }
    }
}
```
Response:
```
202 Accepted

Location: /api/task/037de38f-af91-4589-a620-96245fa72234
```

The defined entity ID can be found in the `owner` field of the `createDefinedEntity` task:
```
GET /api/task/037de38f-af91-4589-a620-96245fa72234
```
```json
  ...
  "owner": {
      "otherAttributes": {},
      "href": "",
      "id": "urn:vcloud:entity:vmware:testType:f62a2903-7fb3-468e-a447-d3a16dd2cf5b",
      "type": "application/json",
      "name": "entity",
      "vCloudExtension": []
  },
  ...
```
### Granting View access to the defined entity
If the user that needs to be granted access to the defined entity is in a tenant organization, the RDE Type right bundle must be published to the user's organization as a prerequisite.

Granting View (Read-Only) access to the newly created defined entity to a user is done by first granting the user with the __View: VMWARE:TESTTYPE__ right. A read-only ACL to the defined entity also must granted.

```
POST /cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:testType:f62a2903-7fb3-468e-a447-d3a16dd2cf5b/accessControls
```
```json
{
    "grantType": "MembershipAccessControlGrant",
    "accessLevelId": "urn:vcloud:accessLevel:ReadOnly",
    "memberId": "urn:vcloud:user:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Response:
```json
{
    "id": "urn:vcloud:accessControl:5abb9bb4-75d1-4bc6-95bd-90a3ea74d5ce",
    "tenant": {
        "name": "System",
        "id": "urn:vcloud:org:a93c9db9-7471-3192-8d09-a8f7eeda85f9"
    },
    "grantType": "MembershipAccessControlGrant",
    "objectId": "urn:vcloud:entity:vmware:testType:f62a2903-7fb3-468e-a447-d3a16dd2cf5b",
    "accessLevelId": "urn:vcloud:accessLevel:ReadOnly",
    "memberId": "urn:vcloud:user:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Now the user can view the defined entity.
### Granting Edit access to the defined entity
If the user that needs to be granted access to the defined entity is in a tenant organization, the RDE Type right bundle must be published to the user's organization as a prerequisite.

Granting Edit (Read-Write) access to the newly created defined entity to a user is done by first granting the user with the __Edit: VMWARE:TESTTYPE__ right. A read-write ACL to the defined entity also must granted.

```
POST /cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:testType:f62a2903-7fb3-468e-a447-d3a16dd2cf5b/accessControls
```
```json
{
    "grantType": "MembershipAccessControlGrant",
    "accessLevelId": "urn:vcloud:accessLevel:ReadWrite",
    "memberId": "urn:vcloud:user:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Response:
```json
{
    "id": "urn:vcloud:accessControl:5abb9bb4-75d1-4bc6-95bd-90a3ea74d5ce",
    "tenant": {
        "name": "System",
        "id": "urn:vcloud:org:a93c9db9-7471-3192-8d09-a8f7eeda85f9"
    },
    "grantType": "MembershipAccessControlGrant",
    "objectId": "urn:vcloud:entity:vmware:testType:f62a2903-7fb3-468e-a447-d3a16dd2cf5b",
    "accessLevelId": "urn:vcloud:accessLevel:ReadWrite",
    "memberId": "urn:vcloud:user:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Now the user can view and edit the defined entity.
### Granting Full Control access to the defined entity
If the user that needs to be granted access to the defined entity is in a tenant organization, the RDE Type right bundle must be published to the user's organization as a prerequisite.

Granting Full Control access to the newly created defined entity to a user is done by first granting the user with the __Full Control: VMWARE:TESTTYPE__ right. A full control ACL to the defined entity also must granted.

```
POST /cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:testType:f62a2903-7fb3-468e-a447-d3a16dd2cf5b/accessControls
```
```json
{
    "grantType": "MembershipAccessControlGrant",
    "accessLevelId": "urn:vcloud:accessLevel:FullControl",
    "memberId": "urn:vcloud:user:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Response:
```json
{
    "id": "urn:vcloud:accessControl:5abb9bb4-75d1-4bc6-95bd-90a3ea74d5ce",
    "tenant": {
        "name": "System",
        "id": "urn:vcloud:org:a93c9db9-7471-3192-8d09-a8f7eeda85f9"
    },
    "grantType": "MembershipAccessControlGrant",
    "objectId": "urn:vcloud:entity:vmware:testType:f62a2903-7fb3-468e-a447-d3a16dd2cf5b",
    "accessLevelId": "urn:vcloud:accessLevel:FullControl",
    "memberId": "urn:vcloud:user:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Now the user can view, edit and delete the defined entity.

