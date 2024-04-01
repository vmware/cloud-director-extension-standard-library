# Defined Interfaces
Interfaces are collections of behaviors (or actions). A behavior is always created as part of an interface. Interfaces are implemented by [Defined Entity Types]()<!-- TODO add link to RDE Type docs -->.

## Definition

Example interface definition:

```json
{
    "name": "test_interface",
    "version": "1.0.0",
    "vendor": "vmware",
    "nss": "test_interface",
    "readonly": false
}
```
The `nss`, `vendor` and `version` triple uniquely identifies an interface. Once created, these fields cannot be updated. 

The `readonly` flag has a default value of false. It cannot be modified via the API and is used internally by the RDE framework.

## Example API calls

### Create an interface:
```
POST /cloudapi/1.0.0/interfaces
```
```json
{
    "name": "test",
    "vendor": "vmware",
    "nss": "test",
    "version": "1.0.0",
    "readonly": false
}
```
Response:
```json
{
    "name": "test",
    "id": "urn:vcloud:interface:vmware:test:1.0.0",
    "version": "1.0.0",
    "vendor": "vmware",
    "nss": "test",
    "readonly": false
}
```

### Update an interface:
```
PUT /cloudapi/1.0.0/interfaces/<interface-id>
```
```json
{
    "name": "test1",
    "vendor": "vmware",
    "nss": "test",
    "version": "1.0.0",
    "readonly": false
}
```
Response:
```json
{
    "name": "test1",
    "id": "urn:vcloud:interface:vmware:test:1.0.0",
    "version": "1.0.0",
    "vendor": "vmware",
    "nss": "test",
    "readonly": false
}
```
An interface cannot be updated if it is in use. An interface is in use if there is at least one RDE instance created in any of the RDE Types which implement the interface.
### Add a behavior to an interface:
```
POST /cloudapi/1.0.0/interfaces/<interface-id>/behaviors
```
```json
{ 
    "name": "noopBehavior",
    "execution" : {
        "type": "noop",
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
An interface's behavior list cannot be updated if it is in use. An interface is in use if there is at least one RDE instance created in any of the RDE Types which implement the interface.
### Delete an interface
```
DELETE /cloudapi/1.0.0/interfaces/<interface-id>
```
An interface cannot be deleted if it is in use. An interface is in use if there is at least one RDE instance created in any of the RDE Types which implement the interface.

## Access to Defined Interface Operations

| Operation                           | Requirement                                                      |
| ----------------------------------- | ---------------------------------------------------------------- |
| View and query interface            | All users have the necessary rights.                             |
| Create interface                    | You must have the __Create new custom entity definition__ right. |     
| Edit interface                      | You must have the __Edit custom entity definition__ right.       |
| Delete interface                    | You must have the __Delete custom entity definition__ right.     |
| View and query interface behaviors  | You must have the __View custom entity definitions__ right.      |
| Create a new behavior in interface  | You must have the __Create new custom entity definition__ right. |
| Update behavior in interface        | You must have the __Edit custom entity definition__ right.       |
| Delete behavior in interface        | You must have the __Edit custom entity definition__ right.       |
