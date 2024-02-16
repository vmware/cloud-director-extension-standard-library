# Object Metadata 2.0

Starting with Vmware Cloud Director 10.4, metadata is available in the `/cloudapi` REST api. It is the same concept as in the legacy `/api` space but has an improved and simplified structure and rules.

The following object types have metadata(expanding list):
* Defined entities

Object metadata gives cloud operators and tenants a flexible way to associate user-defined properties (key=value pairs) with objects. New in this version:
* `File` metadata
* Simplified access control model
* Namespace as a secondary optional unique key
* Configurable lifecycle on cloned objects
* Simplified rules for the `FIQL` expression, and enhanced capabilities and performance when searching by metadata
* A new and equivalent representation of the `fields` projection for metadata of the `/api` space
* Optimistic concurrency control

## Basic structure

There currently are four entry kinds with different value types: `String`, `Number`, `Boolean` and `File`.
Here is an example of the core structure. For more details, please refer to the openapi specification. Example:

* Synchronous - `String`, `Number`, `Boolean`
  ```http request
    POST /1.0.0/entities/{id}/metadata
  ```
  ```json
    {
      "persistent": false,
      "readOnly": true,
      "keyValue": {
      "domain": "TENANT",
      "key": "test.str.3",
      "value": {
         "value": "string",
         "type": "StringEntry"
         }
      }
    }
  ```
  Response:\
  `200 Created`
  ```json
    {
      "id": <entry-urn>
      <rest of the entry fields as specified in the request>
    }
  ```
* Asynchronous - `File`
  ```http request
    POST /1.0.0/entities/{id}/metadata
  ```
  ```json
    {
      "persistent": false,
      "readOnly": true,
      "keyValue": {
      "domain": "TENANT",
      "key": "test.str.3",
      "value": {
        "type": "FileEntry",
        "value": {
          "name": "cloud_director.png",
          "size": 41071,
          "mimeType": "image/png"
          }
        }
      }
    }
  ```
  Response:\
  `202 Accepted`\
  file upload link header\
  task link header

Entries are unique on the fields: `domain`, `namespace`, `key`, within the context of the main object that they are attached to.
Once created, the entry will have a unique URN id. The id is then used to access individual entries for view/update/delete operations. You can update only the value and the persistent fields of the entry. If you want to change any other fields, you must re-create it.
```http request
GET /1.0.0/entities/{id}/metadata/{entry-urn}
```
```http request
PUT /1.0.0/entities/{id}/metadata/{entry-urn}
```
```http request
DELETE /1.0.0/entities/{id}/metadata/{entry-urn}
```

There can be up to `50` entries per entity across namespaces and domains.
## File metadata

A new kind of metadata has been introduced which is intended for storage of small bits of data – up to `32 MB` per entry. The `GET` address of such a resource is stable (you do not have to first request а download transfer) and the binary response payload will include a Content-Type header with the value of the mimeType of the entry as created/updated. In this way you can store for example an image, whose location can be embedded in a html `<img>` tag as a source for a UI extension.

The lifecycle of the `File` entries is slightly different from the other kinds, because there is an asynchronous binary content upload step. Therefore, only for this kind the creation operation returns a task, and the uniqueness validation is performed upon task(upload) completion.
The binary content upload itself is done through a link header returned to the creation request to track the task and upload the content. You must match the `Content-Length` header of this request, to the `size` field in the `FileDescriptor` of the metadata entry.

In relation to this kind of metadata a new quota type has been added – `Total metadata file size`, which enables providers to configure the amount of storage a tenant can consume through this feature.
## Access control model

The access control model is still based on `domain`, however it has a different behavior compared to the `/api` space metadata. `File` entries have an additional layer of authorization through a new right (`Metadata File Entry: Create/Modify`) which enables only specific users to work with this kind of resource(create/update/delete).

Each user has an access level to the metadata, which is defined based on the formula: `min(main object access level, entry access level)`. The entry access level is defined based on the `domain` and `readOnly` fields.\
The `domain` field allows providers to share entries created by them to their tenants. The `readOnly` field specifies whether they should additionally be able to modify the entries.

Currently, there are only two valid values for the domain in the following order: `TENANT` < `PROVIDER`. Users cannot place an entry in a domain which is greater than the one they operate in or define a `readOnly` entry in their own domain.\
For example, a provider can place an entry in the `TENANT` domain with `readOnly=true` to allow a tenant user to view it (but not modify it). However, a tenant user cannot create an entry in the `PROVIDER` domain, or a `readOnly` entry in the `TENANT` domain.

In summary:
* In order to be able to view the metadata of the object, you must at least have read access level to it and the entries must be in a domain up to- or below the one you are operating in
* In order to be able to create/update the metadata of the object, you must at least have `write` access level to it.
* In order to be able to update metadata, it must be in a domain up to- or below the one you are operating in and not `readOnly`. Additionally, for file entries you must have the right `Metadata File Entry: Create/Modify`
# Namespace

Think of the `namespace` as an optional secondary key by which entries are unique. It provides a more obvious mechanism to group entries by vendor.
## Configurable lifecycle on cloned objects

You can specify if the metadata of the object should be copied over on certain clone type of operations on the object. The list of operations depends on the type of the object. Entries with their `persistent` field set to `true` will be copied on such operations automatically.
## Searching by metadata

In the query service of the `/api` space, searching by metadata has two aspects:
* a filter for entry existence
* a projection to include specific entries in the representation of the main object

These have equivalent representations in the new version – _filter_ and _summary_.
### Metadata Filter

Various api endpoints which allow searching for instances of an object type having metadata now have an additional query parameter – `metadata`. For example:
```http request
GET /1.0.0/entities/types/{vendor}/{nss}/{version}?metadata=
```
Users can specify a `FIQL` expression selecting by metadata as if the keys and values are regular properties of the object. The structure of a single entry selection is the following: `[namespace|]key operator value`. The `namespace` is optional and must be separated from the `key` by the pipe symbol. Therefore, the pipe symbol is a restricted character and cannot be used in the `namespace` or `key` of the entries.
You can search by wildcard and key-only expressions.
Examples:
* `?metadata=org:vmware|test:key:8=='string'` – search by a string entry, ie when searching for a string always enclose in single quotes
* `?metadata=test.key.3==42` – search by a number entry
* `?metadata=test.key.3==*` - search by `key`
* `?metadata=test.key.*==*` - search by `key` starting with `test.key`.
* `?metadata=test.key.3=lt=43`
* `?metadata=test.key.4=='str*'` – search by a string entry with a value starting with `str`
There are no limitations on the size of the `FIQL` expression or the number of different key-values in it.\
The resulting objects will only contain metadata accessible to the user. For example, a tenant user who searches for `test.key`, which is only present on an entry in the `PROVIDER` domain will not get any results back.

Example of filtering both at a core object property and metadata:
```http request
GET /1.0.0/entities/types/{vendor}/{nss}/{version}?metadata=test.key.3==42&filter=name==testEntity
```
This functionality should not be confused with the individual entries search on a particular object. The api `GET …/{object-id}/metadata` supports a regular filter query parameter, which enables you to search for particular entries on the object by key (note the syntax which is a consequence of the resource structure: `?filter=keyValue.key==test.key`).
### Metadata Summary

Instead of specifying a particular projection of which entries to include in the payload, users will now receive additional link headers in the response of the previous search operation. The response of such a link will contain a portion of a simplified representation of the metadata of the previously retrieved main objects. Consumers of this api must fetch all the links and merge the result in order to retrieve the total metadata summary. Example:
* Link: `/1.0.0/metadataSummaries/rHLWh2aJRxazDCACHOaRqlqaXw7JdE0avCSxVYnG_IZBFhs1UTxP_6j7amOI8hHU>;rel=”related";title=1;type="application/json";model="MetadataSummaries"`
* response payload is a `map` of object urn to array of `KeyValue`:
* ```json
    {
    "urn:…ac72d687-6689-4716-b30c-20021ce691aa": [
      {
        domain:, 
        namespace:, 
        key:, 
        value:
      }, …
    ],…
    }
  ```
The `title` property of the link contains an index for the links returned. Each link can (optionally) be ordered on the title.\
The response content will include only metadata to which the user has access to at the time of request. If the configuration of the objects/entries related to the access control model changes between requests, you will potentially receive different contents.
## Optimistic concurrency control

Users can optionally enable safe concurrent modifications of entries via the standard `If-Match` and `ETag` headers. When an entry is retrieved, an `ETag` header is returned, representing the current _state id_. When an `If-Match` header with that id is added to an update/delete request, the system will only perform the operation if the current state matches the requested reference state.
