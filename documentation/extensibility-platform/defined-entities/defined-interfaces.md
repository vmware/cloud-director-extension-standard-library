# Defined Interfaces

Interfaces represent categories of Defined Entity definitions.

For example, a `ContainerCluster` interface could represent the concept of a Cluster of Containers.
Multiple [Defined Entity Types](defined-entity-types.md) may implement that interface, each representing a different type of Container Cluster.

Interfaces can also specify custom defined actions called [behaviors](behaviors-general-concepts.md) that can be used to perform operations on Defined Entities of the corresponding categories.

For example, a `ContainerCluster` interface could define an `addNode` behavior. Defined Entity Types implementing the interface can either use the default `addNode` behavior definition in the interface or they can override it to make it specific to their implmentation.

## Definition

An example simple interface definition:

```json
{
    "name": "Container Cluster",
    "vendor": "clusterVendorA",
    "nss": "containerCluster",
    "version": "1.0.0"
}
```

The properties `nss`, `vendor`, and `version` uniquely identify the interface. Once the interface is created, these properties cannot be modified.

## Example API calls

### Create an interface

A new interface can be created by authorized clients via [an API call](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/interfaces/post/). For example:

```text
POST /cloudapi/1.0.0/interfaces
```

```json
{
    "name": "Container Cluster",
    "vendor": "clusterVendorA",
    "nss": "containerCluster",
    "version": "1.0.0"
}
```

Response:

```json
{
    "name": "Container Cluster",
    "id": "urn:vcloud:interface:clusterVendorA:containerCluster:1.0.0",
    "vendor": "clusterVendorA",
    "nss": "containerCluster",
    "version": "1.0.0",
    "readonly": false
}
```

The `id` field in the response represents how the interface will be referenced in other API requests.

The `readonly` flag is added automatically to the interface representation and indicates whether the definition is custom or built-in. It cannot be set via the API.

### Update an interface

An interface can be updated by authorized clients via [an API call](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/interfaces/id/put/). For example:

```text
PUT /cloudapi/1.0.0/interfaces/<interface-id>
```

```json
{
    "name": "Cluster of Containers",
    "vendor": "clusterVendorA",
    "nss": "containerCluster",
    "version": "1.0.0"
}
```

Response:

```json
{
    "name": "Cluster of Containers",
    "id": "urn:vcloud:interface:clusterVendorA:containerCluster:1.0.0",
    "vendor": "clusterVendorA",
    "nss": "containerCluster",
    "version": "1.0.0",
    "readonly": false
}
```

An interface cannot be updated if it is in use. An interface is in use if there is at least one RDE instance created in any of the RDE Types which implement the interface.

### Add a behavior to an interface

Intefaces can define a set of [RDE Behaviors](behaviors-general-concepts.md).
Behaviors are typically specified as part of the interface definition.

Behaviors can also be added to the interface [individually](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/interfaces/id/behaviors/post/) or [as a set](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/interfaces/id/behaviors/put/).

```text
POST /cloudapi/1.0.0/interfaces/<interface-id>/behaviors
```

```json
{
    "name": "addNode",
    "execution" : {
        "type": ...,
        ...
    }
}
```

Response:

```json
{
    "name": "addNode",
    "id": "urn:vcloud:behavior-interface:addNode:clusterVendorA:containerCluster:1.0.0",
    "ref": "urn:vcloud:behavior-interface:addNode:clusterVendorA:containerCluster:1.0.0",
    "execution": {
        "type": ...,
        ...
    }
}
```

The `id` and `ref` fields in the response represent how the specific behavior can be referenced in other API requests. The difference between them is explained in the [behavior id](behaviors-general-concepts.md#behavior-id-vs-ref) section.

The behaviors of an interface cannot be updated if the interface is in use. An interface is in use if there is at least one RDE instance created in any of the RDE Types that implement the interface.

### Delete an interface

An interface can be updated by authorized clients via [an API call](https://developer.broadcom.com/xapis/vmware-cloud-director-openapi/latest/cloudapi/1.0.0/interfaces/id/delete/).

```text
DELETE /cloudapi/1.0.0/interfaces/<interface-id>
```

An interface cannot be deleted if it is in use. An interface is in use if there is at least one RDE instance created in any of the RDE Types which implement the interface.

## Access to Defined Interface Operations

| Operation                           | Required Right                          |
| ----------------------------------- | --------------------------------------- |
| View and query interface            | All users have the necessary rights.    |
| Create interface                    | __Create new custom entity definition__ |
| Edit interface                      | __Edit custom entity definition__       |
| Delete interface                    | __Delete custom entity definition__     |
| View and query interface behaviors  | __View custom entity definitions__      |
| Create a new behavior in interface  | __Create new custom entity definition__ |
| Update behavior in interface        | __Edit custom entity definition__       |
| Delete behavior in interface        | __Edit custom entity definition__       |
