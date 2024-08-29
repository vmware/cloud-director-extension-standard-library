
# AWS Lambda Behaviors

AWS Lambda behaviors act as an interface for communicating with Amazon AWS Lambda functions in VMware Cloud Director. Each behavior represents one Lambda function and upon invoking this behavior, that function is executed in AWS by VMware Cloud Director as well.

## Prerequisites

In order to create an AWS Lambda behavior in VMware Cloud Director, a function in [AWS Lambda](https://aws.amazon.com/lambda/) needs to be created for the behavior to invoke.

## Behavior Definition

Example AWS Lambda behavior definition:

```json
{
  "name": "test-behavior-lambda-squared",
  "execution": {
    "type": "AWSLambdaFaaS",
    "id": "arn:aws:lambda:us-east-2:xxxxxxxxxxxx:function:squared_function",
    "execution_properties" : {
        "_secure_credentials": {
            "access_key": "...",
            "secret_key": "..."
        },
        "aws_invocation_type": "RequestResponse",
        "actAsToken": true,
        "aws_include_log_tail": true,
        "aws_region": "us-east-2"
    }
  }
}
```

The AWS Lambda behavior's `executionType` is `AWSLambdaFaaS`.  This is a required field.

The `id` can be any valid function identifier in AWS Lambda. It is a required field. If the `id` is not the full function arn, then the function region must be explicitly specified in the `execution_properties` as `aws_region`.

- Function name - `my-function` (name-only), `my-function:v1` (with alias)
- Function ARN - `arn:aws:lambda:us-west-2:123456789012:function:my-function`
- Partial ARN - `123456789012:function:my-function`

The `_secure_credentials` field contains the needed credentials for a AWS user to execute the function, including `access_key` and `secret_key`. It is a required field.

The `aws_region` field specifies the function region (i.e. `us-east-2`). It is only optional when the `id` contains the full function arn.

The `aws_invocation_type` specifies the function invocation type. Possible values are `RequestResponse`, `Event` and `DryRun`. If no value is specified, `RequestResponse` is the default.

The `aws_include_log_tail` is a boolean field which specifies whether to create a behavior log, containing the AWS function execution log tail (the last 4KB). Logs are supported only for `RequestResponse` invocation type. The default value is `false`.

The `aws_function_qualifier` field specifies a version or alias to invoke a published version of the function (if not specified latest published verson is invoked).

## Payload sent from VMware Cloud Director to AWS Lambda function

When invoking an AWS Lambda behavior the corresponding AWS Lambda function receives the following event:

```json
{
   "arg1":"arg1",
   "arg2":"arg2",
   ...
   "argn": "argn",
   "entityId": "<entityId>",
   "entity":{
     ...
   },
   "vcdContext": {
      "hostname": "<vcd-host>",
      "port": <vcd-port>,
      "actAsToken": ...
   }
}
```

The arguments from the behavior invocation are at top level in the payload.

The `entityId` holds the ID of the RDE which the behavior was invoked on.

The `entity` holds the entity contents of the RDE which the behavior was invoked on.

The `vcdContext` contains VMware Cloud Director's hostname and port, and an act-as token if one was requested (from the behavior definition).

## Behavior Invocation Task

When invoked, an AWS Lambda behavior returns a task in the response `Location` header (same as all other types of behaviors). Depending on the function invocation type, the behavior invocation task result looks differently:

1. `RequestResponse` invocation type
    - success execution

    ```json
    …
    "result": {
        "resultContent": "{\"x\":7,\"xSquared\":49,\"version\":\"New version\"}",
        "resultReference": {
            "otherAttributes": {},
            "href": "https://85.14.33.161:8443/cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:test_entity_type_1:de232044-ac16-4080-8929-5b2a9d91c82b/behaviors/urn:vcloud:behavior-interface:test-behavior-lambda-squared:vmware:test_interface_3:1.0.0/invocations/a8f1f87e-9cea-411a-916b-d3d7f2b24987/log",
            "id": "a8f1f87e-9cea-411a-916b-d3d7f2b24987",
            "type": "text/plain",
            "name": "behaviorLog",
            "vCloudExtension": []
        }
    },
    "status": "success",
    …
    ```

    - error execution - task results in `error` and the task `error` field contains the error details. A reference to the behavior log is located in the `resultReference` field if log was requested.
2. `Event` invocation type

    - Success execution -  task results in `success` and `result` field contains `Function <function_id> was invoked successfully. Response status code is: <response_status>`.
    - Error execution - task results in `error`.
3. `DryRun` invocation type
    - Success execution - task results in `success`.
    - Error execution - task results in `error`.

## Steps to execute an AWS Lambda behavior and example function code in AWS

1. Create a function in AWS Lambda

    Example function code in JS for a function returning `x` squared:

    ```javascript
    exports.handler = function (event, context, callback) {
        console.log('Received event:', JSON.stringify(event,null,2));
        console.log('Received context:', JSON.stringify(context,null,2));

        if(event.x === undefined){
            callback("400 Invalid Input" + JSON.stringify(event));
        }

        var res={};
        res.x=Number(event.x);

        if(isNaN(res.x)){
            throw "400 Invalid Operand";
        }
        res.xSquared=res.x*res.x;

        callback(null, res);
    };
    ```

2. Get credentials for an AWS user to execute the function, including `access_key` and `secret_key`

3. Create an Interface in VMware Cloud Director

    ```text
    POST /cloudapi/1.0.0/interfaces
    ```

    ```json
    {
        "name": "test",
        "vendor": "vmware",
        "nss": "test",
        "version": "1.0.0"
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

4. Create an AWS Lambda behavior in the test interface

    ```text
    POST /interfaces/urn:vcloud:interface:vmware:test:1.0.0/behaviors
    ```

    ```json
    {
    "name": "test-behavior-lambda-squared",
    "execution": {
        "type": "AWSLambdaFaaS",
        "id": "arn:aws:lambda:us-east-2:xxxxxxxxxxxx:function:squared_function",
        "execution_properties" : {
            "_secure_credentials": {
                "access_key": "...",
                "secret_key": "..."
            },
            "aws_invocation_type": "RequestResponse",
            "actAsToken": true,
            "aws_include_log_tail": true,
            "aws_region": "us-east-2"
        }
    }
    }
    ```

    Response:

    ```json
    {
        "name": "test-behavior-lambda-squared",
        "id": "urn:vcloud:behavior-interface:test-behavior-lambda-squared:vmware:test:1.0.0",
        "ref": "urn:vcloud:behavior-interface:test-behavior-lambda-squared:vmware:test:1.0.0",
        "description": null,
        "execution": {
            "id": "arn:aws:lambda:us-east-2:xxxxxxxxxxxx:function:squared_function",
            "type": "AWSLambdaFaaS",
            "execution_properties": {
                "aws_region": "us-east-2",
                "aws_invocation_type": "RequestResponse",
                "actAsToken": true,
                "aws_include_log_tail": true
            }
        }
    }
    ```

5. Create a RDE Type implementing the newly created interface

    ```text
    POST /cloudapi/1.0.0/entityTypes
    ```

    ```json
    {
        "name": "testType",
        "description": "string",
        "nss": "testType",
        "version": "1.0.0",
        "externalId": "123",
        "schema": {
            "type": "object",
            "properties": {
                "application/json": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "interfaces": ["urn:vcloud:interface:vmware:test:1.0.0"],
        "vendor": "vmware",
        "readonly": false
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
        "externalId": "123",
        "schema": {
            "type": "object",
            "properties": {
                "application/json": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "vendor": "vmware",
        "interfaces": [
            "urn:vcloud:interface:vmware:test:1.0.0"
        ],
        "hooks": null,
        "readonly": false,
        "maxImplicitRight": null
    }
    ```

6. Create a Behavior Access Control for the AWS Lambda behavior

    We will limit the webHook behavior invocations to users who have Full Control access to the defined entity the behavior will be invoked on.

    ```text
    POST /cloudapi/1.0.0/entityTypes/urn:vcloud:type:vmware:testType:1.0.0/behaviorAccessControls
    ```

    ```json
    {
        "behaviorId": "urn:vcloud:behavior-interface:test-behavior-lambda-squared:vmware:test:1.0.0",
        "accessLevelId": "urn:vcloud:accessLevel:FullControl"
    }
    ```

    Response:

    ```json
    {
        "behaviorId": "urn:vcloud:behavior-interface:test-behavior-lambda-squared:vmware:test:1.0.0",
        "accessLevelId": "urn:vcloud:accessLevel:FullControl"
    }
    ```

7. Create an entity of the `testType` RDE type

    ```text
    POST /cloudapi/1.0.0/entityTypes/urn:vcloud:type:vmware:testType:1.0.0
    ```

    ```json
    {

        "name": "testEntity",
        "externalId": null,
        "entity": {
            "application/json": {
                "name": "test"
            }
        }
    }
    ```

    Response:

    ```text
    Headers:

    Location: https://localhost:8443/api/task/9f1fe9a7-dd5e-4975-a6eb-06502359e2e4
    ```

    The newly created entity's ID can be found in the associated `createDefinedEntity` task from the response headers. The `owner` property holds the entity's ID:

    ```json
    {
        ...
        "owner": {
            "otherAttributes": {},
            "href": "",
            "id": "urn:vcloud:entity:vmware:testType:14f02e11-d8e1-4c23-8cd9-8fa256ed9b8e",
            "type": "application/json",
            "name": "entity",
            "vCloudExtension": []
        },
        ...
    }
    ```

8. Resolve newly created entity

    ```text
    POST /cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:testType:089da549-a905-41a4-825e-ec7534973578/resolve
    ```

    Response:

    ```json
    {
        "id": "urn:vcloud:entity:vmware:testType:089da549-a905-41a4-825e-ec7534973578",
        "entity": {
            "application/json": {
                "name": "test"
            }
        },
        "state": "RESOLVED",
        "entityState": "RESOLVED",
        "message": null
    }
    ```

9. Invoke AWS Lambda behavior

    ```text
    POST /cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:testType:089da549-a905-41a4-825e-ec7534973578/behaviors/urn:vcloud:behavior-interface:test-behavior-lambda-squared:vmware:test:1.0.0/invocations
    ```

    ```json
    {
        "arguments" : {
            "x": "7"
            }

    }
    ```

    Response:

    ```text
    Headers:

    Location: https://localhost:8443/api/task/2ca64b62-508b-49db-86e8-0ed62abf6fbd
    ```

The result of the behavior invocation will be located in the `result` field of the associated `executeBehavior` task.

```json
{
    ...
    "result": {
        "resultContent": "{\"x\":7,\"xSquared\":49}",
        "resultReference": {
            "otherAttributes": {},
            "href": "https://localhost:8443/cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:testType:089da549-a905-41a4-825e-ec7534973578/behaviors/urn:vcloud:behavior-interface:test-behavior-lambda-squared:vmware:test:1.0.0/invocations/fac81757-bb5c-4e3f-adec-71031d85386c/log",
            "id": "fac81757-bb5c-4e3f-adec-71031d85386c",
            "type": "text/plain",
            "name": "behaviorLog",
            "vCloudExtension": []
        }
    },
    "status": "success",
    "operation": "Invoking test-behavior-lambda-squared testEntity(urn:vcloud:entity:vmware:testType:089da549-a905-41a4-825e-ec7534973578)",
    "operationName": "executeBehavior",
    ...
}
```

The execution log can be retrieved by using the `href` from the `resultReference`. The execution log is stored only if it was requested with the `aws_include_log_tail` flag in the behavior definition.

```text
GET /cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:testType:089da549-a905-41a4-825e-ec7534973578/behaviors/urn:vcloud:behavior-interface:test-behavior-lambda-squared:vmware:test:1.0.0/invocations/fac81757-bb5c-4e3f-adec-71031d85386c/log

Headers:
Accept: text/plain;version=38.0
```

```text
2024-03-27T08:08:26.316Z undefined INFO Loading squared function
START RequestId: 14e309d5-1ee1-4c39-b3ca-e51894ebd5c3 Version: $LATEST
2024-03-27T08:08:26.322Z 14e309d5-1ee1-4c39-b3ca-e51894ebd5c3 INFO Received event: {
  "x": 7,
  "entityId": "urn:vcloud:entity:vmware:testType:089da549-a905-41a4-825e-ec7534973578",
  "entity": {
    "application/json": {
      "name": "test"
    }
  },
  "vcdContext": {
    "hostname": "localhost",
    "port": 8443,
    "actAsToken": "..."
  }
}
2024-03-27T08:08:26.322Z 14e309d5-1ee1-4c39-b3ca-e51894ebd5c3 INFO Received context: {
  "callbackWaitsForEmptyEventLoop": true,
  "functionVersion": "$LATEST",
  "functionName": "squared_function",
  "memoryLimitInMB": "128",
  "logGroupName": "/aws/lambda/squared_function",
  "logStreamName": "2024/03/27/[$LATEST]f095e0c4b4204f58a068aaf0ad3a3b15",
  "invokedFunctionArn": "arn:aws:lambda:us-east-2:960978609163:function:squared_function",
  "awsRequestId": "14e309d5-1ee1-4c39-b3ca-e51894ebd5c3"
}
END RequestId: 14e309d5-1ee1-4c39-b3ca-e51894ebd5c3
REPORT RequestId: 14e309d5-1ee1-4c39-b3ca-e51894ebd5c3 Duration: 27.67 ms Billed Duration: 28 ms Memory Size: 128 MB Max Memory Used: 66 MB Init Duration: 169.85 ms

```
