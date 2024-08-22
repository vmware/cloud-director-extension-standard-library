# No-op Behaviors

No-op behaviors, as the name suggests, are behaviors which do not perform any operation as part of their execution. They always succeed or always fail (depending on how they are configured). This type of behaviors can be used for testing purposes.

## Behavior Definition

The no-op behavior execution type is `noop`. By default no-op behavior execution always succeeds and returns a `null` result. However, a no-op behavior can be configured to return a custom result. Also no-op behaviors can be configured to always fail with custom error.

### Special execution properties

There are some special properties which can be set in the behavior definition `execution_properties` section.

- `returnValue` - any - this property is used to set a custom result value for the behavior.
- `returnError` - Object - this property is used to set a custom error for the behavior:

    ```json
    "returnError": {
                "majorErrorCode": 501,
                "minorErrorCode": "NOT_IMPLEMENTED",
                "message": "Not Implemented"
            }
    ```

Default no-op behavior definition:

```json
{
    "name": "testNoOp",
    "execution": {
        "type": "noop"
    }
}
```

No-op behavior definition returning custom result:

```json
{
    "name": "testNoOpWithReturnArgument",
    "execution": {
        "type": "noop",
        "execution_properties": {
            "returnValue": "Successful Behavior Execution"
        }
    }
}
```

No-op behavior definition for behavior failing with custom error:

```json
{

    "name": "testNoOpError",
    "execution": {
        "type": "noop",
        "execution_properties": {
            "returnError": {
                "majorErrorCode": 501,
                "minorErrorCode": "NOT_IMPLEMENTED",
                "message": "Not Implemented"
            }
        }
    }
}
```
