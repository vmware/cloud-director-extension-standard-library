# WebHook Behaviors

WebHook behaviors provide webHook functionality in the context of VMware Cloud Director. In short, upon invocation a webHook behavior a POST request is sent to a webHook server. After receiving the server's response, the behavior invocation task is updated accordingly. The payload sent to the webHook server is configurable.

## Prerequisites

A webHook server must be set-up to process requests from webHook behavior invocations before creating any webHook behaviors. The webHook server must support HTTPs and its SSL certificate must be trusted in the organization of the user invoking the webHook behavior in order for the connection to be successful ([how to trust a certificate in VMware Cloud Director](https://docs.vmware.com/en/VMware-Cloud-Director/10.4/VMware-Cloud-Director-Service-Provider-Admin-Portal-Guide/GUID-80B4CB1C-9353-4EB9-8557-4F6705949D0F.html)).

For testing purposes you can use [webhooks.site](https://webhook.site/). It provides a random URL which canbe used as a webHook server URL. The response sent back from webhooks.site to each request can be customized.

## Behavior Definition

WebHook behavior example definition:

```json
{
    "name": "webhookBehavior",
    "execution": {
             "type": "WebHook",
             "id": "testWebHook",
             "href": "https://example.com/webhooks" ,
             "_internal_key": "verySecretKey",
              "execution_properties": {
                 "template": {
                    "content": "<#assign header_Authorization = \"${_execution_properties._secure_token}\" />{\"text\": \"Behavior with id ${_metadata.behaviorId} was executed on entity with id ${entityId}\"   }"
                 },
                 "_secure_token": "secureToken"
             }
    }
}
```

The webHook behavior's execution `type` is `WebHook`. It is a required field.

The `id` is a user-defined string. It is a required field.

The `href` holds the URL of the webHook server which will be processing the webHook requests. The value must be a valid URL of `https` protocol. It is a required field.

The `_internal_key` holds a shared secret string which is only known to VMware Cloud Director and the webHook server. This shared secret will be used to generate the signature header of the request which is part of the [HMAC authentication](#authentication-of-webhook-behavior-requests). It is a required field.

The `template` field in the execution can be used to set-up a custom payload for the requests sent to the webHook server. More information can be found [here](#custom-request-payload).

## WebHook Request Payload (VMware Cloud Director -> WebHook Server)

The default payload sent to webHook servers is a JSON containing information about the actual behavior invocation (behavior information, entity information, and some metadata). However, you can also customize this payload by setting a template in the behavior definition. <a href="https://freemarker.apache.org/docs/dgui_quickstart_template.html" target="_blank">FreeMarker template engine</a> is used to render the payload from the provided template and the data model.

### Default Request Payload

The default payload sent to webHook servers is a JSON containing information about the actual behavior invocation - invocation arguments, behavior information, entity information, and some metadata.

Default headers:

```text
content-type=[application/json],
x-vcloud-signature=[ algorithm="hmac-sha512", headers="host date (request-target) digest", signature="WjuxZuVgNXctRBuDLONeQ0NWXt+O36YL8wMdjhCGCeW7Fq8sMHfU6NCS0O6STJx2z/wRkHTjzil4GAfuho9ZUw=="],
x-vcloud-digest=[SHA-512=Yt4eiT2VmUyX8wDt6wneZ10VRk1B1H2jmHP1R7YanI9hykEAjUdtg7JzxfioBQm/iWRRNBM8B0aJnw6Jd29Jqg==],
date=[Thu, 01 Oct 2020 12:57:31 GMT],
accept=[*/*],
user-agent=[Apache-CXF/3.1.17],
cache-control=[no-cache],
pragma=[no-cache],
host=[127.0.0.1:1234],
connection=[keep-alive],
content-length=[579]
```

Default payload:

```json
{
  "_execution_properties": {
    "actAsToken": true
  },
  "entity.masked": {
    "entity": {
      "VcdVm": {
        "name": true
      }
    }
  },
  "entityId": "urn:vcloud:entity:vmware:testType:28b0488f-39f0-49d6-a78b-c37e8eaf40be",
  "typeId": "urn:vcloud:type:vmware:testType:1.0.1",
  "arguments": {
    "x": 7
  },
  "_metadata": {
    "executionId": "testWebHook",
    "execution": {
      "href": "https://webhook.site/f17d3903-5f89-468b-b4b0-40a63795bb8b"
    },
    "invocation": {
      "y": 6
    },
    "apiVersion": "37.3",
    "behaviorId": "urn:vcloud:behavior-interface:webhookBehavor2:vmware:test2:1.0.0",
    "requestId": "4551c4ee-27df-47dc-b065-b67a91d3904c",
    "executionType": "WebHook",
    "actAsToken": "...",
    "invocationId": "b2031c44-c426-4eee-bae1-423bf5bb4e92",
    "taskId": "c928b926-7c1d-40bd-ae0e-2b541e0d5511"
  },
  "entity": {
    "entity": {
      "VcdVm": {
        "name": true
      }
    }
  }
}
```

See the [Java Class representing the InvocationArguments](#java-class-representing-the-invocationarguments) in the `Code Examples` section.

### Custom Request Payload

The payload can be customized by setting a template in the behavior definition. <a href="https://freemarker.apache.org/docs/dgui_quickstart_template.html" target="_blank">FreeMarker template engine</a> is used to render the payload from the provided template and the data model.

#### The Data Model

The data model represents all the data that was prepared for the template. Or in other words, all the data which can be included in the payload. As far as the template author is concerned, the data model is a tree-like structure and can be visualized as:

```text
+ - entityId
|
+ - typeId
|
+ - arguments
|
+ - arguments_string
|
+ - _execution_properties
|
+ - _metadata
|   |
|   + - executionId
|   + - behaviorId
|   + - executionType
|   + - taskId
|   + - execution // can select all the values from execution by key name
|   |   |
|   |   + - href
|   + - invocation // can select all the values from invocation by key name
|   + - invocationId
 |   + - requestId
|   + - apiVersion
|
+ -  entity
|
+ - entity_string

```

- `entityId` - the ID of the defined entity which the behavior was invoked on.
- `typeId` - the ID of the entity type of the defined entity which the behavior was invoked on.
- `arguments` - the user supplied arguments from the body of the behavior invocation.
- `arguments_string` - a JSON-encoded string of arguments, can be used if the user wants to add all the arguments to the payload.
- `_execution_properties` - the `execution_properties` from the behavior definition.
- `behaviorId` - the ID of the invoked behavior.
- `executionType` - the execution type of the invoked behavior.
- `taskId` - the ID of the behavior invocation task.
- `execution` - the execution from the behavior definition.
- `invocation` - the user supplied metadata from the body of the behavior invocation.
- `invocationId` - the ID of the behavior invocation.
- `apiVersion` - the API version the behavior was invoked with.
- `entity` - a map of the entity contents, can select all values in entity by key name.
- `entity_string` - a JSON-encoded string of the entity contents.

#### The Template

More details on how to build a template can be found in the <a href="https://freemarker.apache.org/docs/dgui_quickstart_template.html" target="_blank">FreeMarker documentation</a> . In short, the way to evaluate a key from the data model is wrapping the key in `${…}`. For example `${_metadata.execution.href}` is the way to get the `href` value from the execution. An example template is:

```json
{
    "text": "Behavior with id ${_metadata.behaviorId} was executed on entity with id ${entityId}"
}
```

#### Setting Custom Request Headers

Custom headers can be set in the webHook reques by using the template. Each header can be set as a variable in the template with the prefix `header_`.

Examples:

```text
<#assign header_Content-Type = "application/json" />

<#assign header_Authorization = "${_execution_properties._secure_token}" />
```

Example behavior definition with custom payload and headers:

```json
{
    "name": "test-behavior",
    "execution": {
        "type": "WebHook",
        "id": "testWebHook",
        "href": "https://webhook.site/45b2d281-9de8-4eec-b7cc-a67529ec4be4",
        "_internal_key": "secretKey",
        "execution_properties": {
            "template": {
                "content": "<#assign header_Authorization = \"${_execution_properties._secure_token}\" />{\"text\": \"Behavior with id ${_metadata.behaviorId} was executed on entity with id ${entityId}\"}"
            },
            "_secure_token": "secureToken"
        }
    }
}
```

## WebHook Response Payload (WebHook Server -> VMware Cloud Director)

There are three possible response formats for the webHook server to send back to VMware Cloud Director. Each one is processed differently by VMware Cloud Director.

### Simple Response

Sets the behavior invocation task result only.

- Success response - the behavior invocation task status is set to `success` and the response body is used as the task result

```text
Status code: 200
Content-Type:  text/plain //or none

...some string...
```

- Error response - the behavior invocation task status is set to `ERROR`

```text
response code != 200
```

### Task Update Response (one-time task update)

Allows for updating not only the behavior invocation task `result`, but also task's `status`, `details`, `operation`, `error`, `progress`. The payload must represent a valid JSON representation of a `TaskType` with the task properties that need to be modified.

- Success response

```text
Status code: 200
Content-Type:  application/vnd.vmware.vcloud.task+json
```

```json
{
    "status": "success",
    "details": "example details",
    "operation": "example operation",
    "progress": 100,
    "result": {
        "resultContent": "example result"
    }
}
```

- Error response

```text
Status code: 200
Content-Type: application/vnd.vmware.vcloud.task+json
```

```json
{
    "status": "error",
    "details": "example details",
    "operation": "example operation",
    "progress": 50,
    "error": {
        "majorErrorCode": 404,
        "minorErrorCode": "ERROR",
        "message": "example error message"
    }
}
```

### Continuous Task Update Response

Allows for sending multiple task updates before completing the behavior invocation task. This is done by using HTTP multipart response. Each update is a separate body part of the response body. The last body part of the response body must complete the task. If it does not, the task is completed with an error message indicating that the task should have been completed but was not.

Example response:

```text
Status code: 200
Content-Type: multipart/form-data; boundary=<boundary_string>
```

```text
--<boundary_string>
Content-Type: application/vnd.vmware.vcloud.task+json
{
    "details": "example details",
    "operation": "example operation",
    "progress": 50
}
--<boundary_string>
Content-Type: application/vnd.vmware.vcloud.task+json
{
    "status": "success",
    "progress": 100,
    "result": {
        "resultContent": "example result"
    }
}
--<boundary_string>
```

There is a new line after each `boundary string`, `Content-Type` header and body. The body parts of the response can either represent a simple response or a task update response. The last body part of the webHook server response body must complete the task. If it does not, the task is completed with an error message indicating that the task should have been completed but was not. Once a body part completes the behavior invocation task, any other body parts received after that are ignored.

See the [Java class representing a Task](#java-class-representing-a-task) in the `Code Examples` section.

## Authentication of WebHook Behavior Requests

WebHook behavior requests are secured via HMAC authentication.

### What is HMAC authentication?

HMAC (or hash-based message authentication code) is a mechanism used to ensure the authenticity and integrity of HTTP requests. This is achieved by including two custom headers to each HTTP request – signature header and digest (in our case `x-vcloud-signature` and `x-vcloud-digest`).

```text
x-vcloud-signature=[ algorithm="hmac-sha512", headers="host date (request-target) digest", signature="WjuxZuVgNXctRBuDLONeQ0NWXt+O36YL8wMdjhCGCeW7Fq8sMHfU6NCS0O6STJx2z/wRkHTjzil4GAfuho9ZUw=="]

x-vcloud-digest=[SHA-512=Yt4eiT2VmUyX8wDt6wneZ10VRk1B1H2jmHP1R7YanI9hykEAjUdtg7JzxfioBQm/iWRRNBM8B0aJnw6Jd29Jqg==]
```

### Some terms

- Shared secret - this a string which is only known to VMware Cloud Director and the webHook server (`_internal_key`). This shared secret will be used to generate the signature header
- Signature header (`x-vcloud-signature`) - This is a custom header sent with each webHook request. It consists of three parts:
  - `algorithm` (`hmac-sha512`) - this is the algorithm used to generate the signature
  - `headers` (`host date (request-target) digest`) - this shows what is included in the base string which is signed to create the signature
    - `host` - the webHook server host
    - `date` - date of the request
    - `(reguest-target) = <http-method> + <ASCII space> + <path>`(e.g. `post /webhook`)
    - `digest` - sha-512 digest of the request body
  - `signature` - this is the generated signature
- Digest header (`x-vcloud-digest`) - this is a `base64` encoded sha-512 digest of the request body

### How are requests authenticated by the webHook server?

Each webHook request from VMware Cloud Director can be verified by generating the signature using the shared secret and comparing it to the signature in the signature header from VMware Cloud Director. If they match, the request is verified.

See the [Example Java code for verifying a webHook behavior request's signature header](#example-java-code-for-verifying-a-webhook-behavior-requests-signature-header) in the `Code Examples` section.

## Example Slack integration with webHook behaviors

Slack has a functionality for creating incoming webHooks which can be used for posting messages to Slack channels. WebHook behaviors can be used to integrate Slack incoming webHooks with VMware Cloud Director, allowing VMware Cloud Director to post messages directly to a slack channel.
More information on how to create a Slack incoming webHook for a channel can be found [here]( https://api.slack.com/messaging/webhooks).

Once a Slack webHook is configured, messages to it can be sent via a POST request to the webHook URL - `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`. The request payload has to be of a specific format in order for it to be recognized by the Slack webHook and the `Content-Type` header must be set to `application/json`.

In order to use VMware Cloud Director's webHook behaviors to send messages to slack webHooks, the following steps must be followed:

1. [Set-up incoming webHook URL in Slack](https://api.slack.com/messaging/webhooks).
2. Create an Interface

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

3. Create a template for the payload sent to the webHook server

    ```text
    <#assign header_Content\-Type= "application/json" />

    {

        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*BEHAVIOR_EXECUTION*:vcda:\n Behavior with id \n_${_metadata.behaviorId}_\n was executed on entity with id \n_${entityId}_\n ${arguments.greeting}"
                }
            }
        ]
    }
    ```

4. Create a webHook behavior in the test interface

    For the behavior's `href` use the slack webHook URL.

    ```text
    POST /cloudapi/1.0.0/interfaces/urn:vcloud:interface:vmware:test:1.0.0/behaviors
    ```

    ```json
    {
        "name": "testTemplateWebhookBehaviorSlack",
        "execution": {
                "type": "WebHook",
                "id": "testWebHook",
                "href": "https://hooks.slack.com:443/services/T07UZFN0N/B01EW5NC42D/rfjhHCGIwzuzQFrpPZiuLkIX" ,
                "key": "secretKey",
                "execution_properties": {
                    "template": {
                        "content": "    \n    \"blocks\": [\n        {\n            \"type\": \"section\",\n            \"text\": {\n\"type\": \"mrkdwn\",\n\"text\": \"*BEHAVIOR_EXECUTION*:vcda:\\n Behavior with id \\n_${_metadata.behaviorId}_\\n was executed on entity with id \\n_${entityId}_\\n ${arguments.greeting}\"\n}\n        }\n    ]\n}"
                    }
                }

        }
    }
    ```

    Response:

    ```json
    {
        "name": "testTemplateWebhookBehaviorSlack",
        "id": "urn:vcloud:behavior-interface:testTemplateWebhookBehaviorSlack:vmware:test:1.0.0",
        "ref": "urn:vcloud:behavior-interface:testTemplateWebhookBehaviorSlack:vmware:test:1.0.0",
        "description": null,
        "execution": {
            "id": "testWebHook",
            "href": "https://hooks.slack.com:443/services/T07UZFN0N/B01EW5NC42D/rfjhHCGIwzuzQFrpPZiuLkIX",
            "type": "WebHook",
            "key": "secretKey",
            "execution_properties": {
                "template": {
                    "content": "<#assign header_Content-Type= \"application/json\" /> { \"blocks\": [ { \"type\": \"section\", \"text\": { \"type\": \"mrkdwn\", \"text\": \"*BEHAVIOR_EXECUTION*:vcda:\n Behavior with id \n_${_metadata.behaviorId}_\n was executed on entity with id \n_${entityId}_\n ${arguments.greeting}\" } } ] }"
                }
            }
        }
    }
    ```

    The template configures the payload to be alligned with what the Slack server expects to receive. The request `Content-Type` header is set to `application/json`. The body of the request is formatted using [Slack webHooks formatting](https://api.slack.com/messaging/webhooks#advanced_message_formatting).

    ```text
    <#assign header_Content\-Type= "application/json" />

    {

        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*BEHAVIOR_EXECUTION*:vcda:\n Behavior with id \n_${_metadata.behaviorId}_\n was executed on entity with id \n_${entityId}_\n ${arguments.greeting}"
                }
            }
        ]
    }
    ```

5. Trust Slack server SSL certificate

    In order to be able to send data to Slack, the Slack server SSL certificate must be trusted. More information on managing SSL certificates in VMware Cloud Director can be found [here](https://docs.vmware.com/en/VMware-Cloud-Director/10.4/VMware-Cloud-Director-Service-Provider-Admin-Portal-Guide/GUID-80B4CB1C-9353-4EB9-8557-4F6705949D0F.html).

6. Create a RDE Type implementing the newly created interface

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

7. Create a Behavior Access Control for the webHook behavior

    The webHook behavior invocations will be limited to users who have Full Control access to the defined entity the behavior will be invoked on.

    ```text
    POST /cloudapi/1.0.0/entityTypes/urn:vcloud:type:vmware:testType:1.0.0/behaviorAccessControls
    ```

    ```json
    {
        "behaviorId": "urn:vcloud:behavior-interface:testTemplateWebhookBehaviorSlack:vmware:test:1.0.0",
        "accessLevelId": "urn:vcloud:accessLevel:FullControl"
    }
    ```

    Response:

    ```json
    {
        "behaviorId": "urn:vcloud:behavior-interface:testTemplateWebhookBehaviorSlack:vmware:test:1.0.0",
        "accessLevelId": "urn:vcloud:accessLevel:FullControl"
    }
    ```

8. Create an entity of the `testType` RDE type

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

    To obtain the newly created entity's ID you must retrieve the associated `createDefinedEntity` task from the response headers. The `owner` property holds the entity's ID:

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

9. Resolve newly created entity

    ```text
    POST /cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:testType:14f02e11-d8e1-4c23-8cd9-8fa256ed9b8e/resolve
    ```

    Response:

    ```json
    {
        "id": "urn:vcloud:entity:vmware:testType:14f02e11-d8e1-4c23-8cd9-8fa256ed9b8e",
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

10. Invoke webHook behavior

    ```text
    POST /cloudapi/1.0.0/entities/urn:vcloud:entity:vmware:testType:14f02e11-d8e1-4c23-8cd9-8fa256ed9b8e/behaviors/urn:vcloud:behavior-interface:testTemplateWebhookBehaviorSlack:vmware:test:1.0.0/invocations
    ```

    ```json
    {
        "arguments": {
            "greeting": "Greetings from vCloudDirector"
        }
    }
    ```

    The following message is posted in Slack as a result:

    ![WebHook behavior invocation's Slack message](../../images/webHook-behavior-slack-example.png)

## Code Examples

### Java Class representing the InvocationArguments

```java
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class InvocationArguments {
    private String entityId;
    private String typeId;
    @JsonProperty("_metadata")
    private InvocationArgumentsMetadata metadata;
    private Map<String, Object> entity;
    private Map<String, Object> arguments;
    @JsonProperty("_execution_properties")
    private Map<String, Object> executionProperties;
    private Map<String, Object> additionalArguments;

    /**
     * @return the id of the RDE which the behavior was invoked on
     */
    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    /**
     * @return The id of the RDE Type of the entity which the behavior was invoked in
     */
    public String getTypeId() {
        return typeId;
    }

    public void setTypeId(String typeId) {
        this.typeId = typeId;
    }

    /**
     * @return The invocation {@link InvocationArgumentsMetadata}
     */
    public InvocationArgumentsMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(InvocationArgumentsMetadata metadata) {
        this.metadata = metadata;
    }

    /**
     * @return the entity contents of the RDE which the behavior was invoked on
     */
    public Map<String, Object> getEntity() {
        return entity;
    }

    public void setEntity(Map<String, Object> entity) {
        this.entity = entity;
    }

    /**
     * @return the user-provided arguments upon invocation
     */
    public Map<String, Object> getArguments() {
        return arguments;
    }

    public void setArguments(Map<String, Object> arguments) {
        this.arguments = arguments;
    }

    /**
     * @return the behavior's execution_properties
     */
    public Map<String, Object> getExecutionProperties() {
        return executionProperties;
    }

    public void setExecutionProperties(Map<String, Object> executionProperties) {
        this.executionProperties = executionProperties;
    }

    /**
     * @return additional_arguments from the behavior's execution
     */
    public Map<String, Object> getAdditionalArguments() {
        return additionalArguments;
    }

    public void setAdditionalArguments(Map<String, Object> additionalArguments) {
        this.additionalArguments = additionalArguments;
    }


    /**
     * The behavior invocation metadata
     */
    public static class InvocationArgumentsMetadata {
        private String behaviorId;
        private String taskId;
        private String executionId;
        private String executionType;
        private String actAsToken;
        private Map<String, Object> invocation;


        /**
         * @return the id of the invoked behavior
         */
        public String getBehaviorId() {
            return behaviorId;
        }

        public void setBehaviorId(String behaviorId) {
            this.behaviorId = behaviorId;
        }

        /**
         * @return the id of the behavior invocation task
         */
        public String getTaskId() {
            return taskId;
        }

        public void setTaskId(String taskId) {
            this.taskId = taskId;
        }

        /**
         * @return the behavior's execution id
         */
        public String getExecutionId() {
            return executionId;
        }

        public void setExecutionId(String executionId) {
            this.executionId = executionId;
        }

        /**
         * @return the behavior's execution type
         */
        public String getExecutionType() {
            return executionType;
        }

        public void setExecutionType(String executionType) {
            this.executionType = executionType;
        }

        /**
         * @return a {@link Map} of the user-provided metadata upon invocation
         */
        public Map<String, Object> getInvocation() {
            return invocation;
        }

        public void setInvocation(Map<String, Object> invocation) {
            this.invocation = invocation;
        }

        /**
         * @return an act-as token if additional API calls to VCD need to be made
         * (it os only populated if it is specified in the behavior's definition)
         */
        public String getActAsToken() {
            return actAsToken;
        }

        public void setActAsToken(String actAsToken) {
            this.actAsToken = actAsToken;
        }
    }
}
```

### Java class representing a Task

```java
import com.fasterxml.jackson.annotation.JsonValue;

public class TaskType {

    public static enum TaskStatus {
        PENDING("pending"),
        PRE_RUNNING("pre-running"),
        RUNNING("running"),
        SUCCESS("success"),
        ABORTED("aborted"),
        ERROR("error"),
        CANCELED("canceled"),
        EXPECTING_ACTION("expectingAction");

        private final String value;

        TaskStatus(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }
    }

    public static class ErrorType {
        private String majorErrorCode;
        private String minorErrorCode;
        private String message;

        public String getMajorErrorCode() {
            return majorErrorCode;
        }

        public void setMajorErrorCode(String majorErrorCode) {
            this.majorErrorCode = majorErrorCode;
        }

        public String getMinorErrorCode() {
            return minorErrorCode;
        }

        public void setMinorErrorCode(String minorErrorCode) {
            this.minorErrorCode = minorErrorCode;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    private TaskType status;
    private String operation;
    private String details;
    private ErrorType error;
    private int progress;

    /**
     * @return the task status
     */
    public TaskType getStatus() {
        return status;
    }

    public void setStatus(TaskType status) {
        this.status = status;
    }

    /**
     * @return the task operation
     */
    public String getOperation() {
        return operation;
    }

    public void setOperation(String operation) {
        this.operation = operation;
    }

    /**
     * @return the task details
     */
    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    /**
     * @return the task error as {@link ErrorType}
     */
    public ErrorType getError() {
        return error;
    }

    public void setError(ErrorType error) {
        this.error = error;
    }

    /**
     * @return the task progress. Must be in the range [0,100].
     */
    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }
}
```

### Example Java code for verifying a webHook behavior request's signature header

```java
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
/**
 * Verifies an incoming webHook behavior request from VCD.
 */
public class HMACRequestVerificator {
    private static final String DIGEST_ALGORITHM = "hmac-sha512";
    private static final String HEADER_SIGNATURE = "x-vcloud-signature";
    private static final String HEADER_DATE = "date";
    private static final String SIGNATURE_PARAM_SIGNATURE = "signature";
    private static final String SIGNATURE_PARAM_ALGORITHM = "algorithm";
    private static final String SIGNATURE_PARAM_HEADERS = "headers";
    private static final String HEADERS_DATE = "date";
    private static final String HEADERS_HOST = "host";
    private static final String HEADERS_REQUEST_TARGET = "(request-target)";
    private static final String HEADERS_DIGEST = "digest";
    private static final Pattern HEADER_SIGNATURE_PATTERN = Pattern.compile("^algorithm=\".+\",headers=\".+\",signature=\".+\"$");
    private Map<String, List<String>> headers = null;
    private Map<String, String> signatureParams = null;
    private final String sharedSecret;
    private String host;
    private String path;
    private String payload;
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .setSerializationInclusion(JsonInclude.Include.NON_NULL);
    /**
     * @param sharedSecret the shared secret which will be used to verify the signature from the VCD request headers.
     */
    public HMACRequestVerificator(String sharedSecret) {
        this.sharedSecret = sharedSecret;
    }
    /**
     * Provides the host and path of the webhook server.
     * @param webhookServerUrl URL of the webhook server endpoint
     * @return this {@link HMACRequestVerificator}
     */
    public HMACRequestVerificator withWebhookServerUrl(String webhookServerUrl) {
        Optional<URI> webhookServerUri = buildWebhookServerURI(webhookServerUrl);
        if (webhookServerUri.isPresent()) {
            URI uri = webhookServerUri.get();
            host = uri.getHost();
            path = uri.getPath();
        }
        return this;
    }
    /**
     * Provides the host and path of the webhook server.
     * @param host the host of the webhook server
     * @param path the path of the webhook server
     * @return this {@link HMACRequestVerificator}
     */
    public HMACRequestVerificator withWebhookServerHostAndPath(String host, String path) {
        this.host = host;
        this.path = path;
        return this;
    }
    /**
     * @param headers the headers of the incoming request from VCD
     * @return this {@link HMACRequestVerificator}
     */
    public HMACRequestVerificator withHeaders(Map<String, List<String>> headers) {
        this.headers = headers;
        return this;
    }
    /**
     * @param payload the payload of the incoming request from VCD
     * @return this {@link HMACRequestVerificator}
     */
    public HMACRequestVerificator withPayload(Object payload) {
        this.payload = serializePayload(payload);
        return this;
    }
    /**
     * Executes verification.
     * @return true if verification was successful and false otherwise
     */
    public boolean verify() {
        if (!checkParameters()) {
            return false;
        }
        String signatureFromServer = signatureParams.get(SIGNATURE_PARAM_SIGNATURE);
        Optional<String> signatureToVerify = buildSignatureToVerify(payload);
        return signatureToVerify.isPresent() && signatureFromServer.equals(signatureToVerify.get());
    }
    private boolean checkParameters() {
        return validateParameters() && validateHeaders();
    }
    private boolean validateParameters() {
        return sharedSecret != null && payload != null && host != null && path != null;
    }
    private boolean validateHeaders() {
        if (headers == null
                || !headers.containsKey(HEADERS_DATE)
                || !headers.containsKey(HEADER_SIGNATURE)) {
            return false;
        }
        String signatureHeader = headers.get(HEADER_SIGNATURE).get(0);
        Matcher matcher = HEADER_SIGNATURE_PATTERN.matcher(signatureHeader);
        if (!matcher.matches()) {
            return false;
        }
        signatureParams = extractSignatureParams(headers.get(HEADER_SIGNATURE).get(0));
        return signatureParams.containsKey(SIGNATURE_PARAM_SIGNATURE)
                && signatureParams.containsKey(SIGNATURE_PARAM_HEADERS)
                && signatureParams.containsKey(SIGNATURE_PARAM_ALGORITHM);
    }
    private Map<String, String> extractSignatureParams(String signatureHeader) {
        String [] signatureHeaders = signatureHeader.split(",");
        Map<String, String> result = new HashMap<>();
        for (String h : signatureHeaders) {
            String param = h.split("=")[0];
            String value = h.split("\"")[1];
            result.put(param.toLowerCase(), value);
        }
        return result;
    }
    private byte[] getDigest(String payload) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            digest.update(payload.getBytes());
            return digest.digest();
        } catch (NoSuchAlgorithmException e) {
            //should not happen
            throw new RuntimeException(e);
        }
    }
    private Optional<String> buildSignatureToVerify(String payload) {
        String signatureString = buildSignatureString(payload);
        if (signatureParams.get(SIGNATURE_PARAM_ALGORITHM).equalsIgnoreCase(DIGEST_ALGORITHM)) {
            return Optional.of(signDataSHA512HMAC(signatureString, sharedSecret));
        }
        return Optional.empty();
    }
    private String signDataSHA512HMAC(String data, String sharedSecret) {
        try {
            final byte[] byteKey = sharedSecret.getBytes(StandardCharsets.UTF_8);
            Mac sha512Hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec keySpec = new SecretKeySpec(byteKey, "HmacSHA512");
            sha512Hmac.init(keySpec);
            byte[] macData = sha512Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return getBase64(macData);
        } catch (InvalidKeyException | NoSuchAlgorithmException e) {
            throw new RuntimeException(e.getMessage());
        }
    }
    private String buildSignatureString(String payload) {
        String[] headersInSignature = signatureParams.get(SIGNATURE_PARAM_HEADERS).split(" ");
        return Arrays.stream(headersInSignature)
                .map(headerInSignature -> buildSignatureStringHeaderParam(headerInSignature, payload))
                .filter(Objects::nonNull)
                .collect(Collectors.joining("\n"));
    }
    private String buildSignatureStringHeaderParam(String paramName, String payload) {
        if (paramName.equalsIgnoreCase(HEADERS_HOST)) {
            return "host: " + host;
        } else if (paramName.equalsIgnoreCase(HEADERS_DATE)) {
            return "date: " + getDate();
        } else if (paramName.equalsIgnoreCase(HEADERS_DIGEST)) {
            return "digest: SHA-512=" + getBase64(getDigest(payload));
        } else if (paramName.equalsIgnoreCase(HEADERS_REQUEST_TARGET)) {
            return "(request-target): post " + path;
        }
        return null;
    }
    private String getBase64(byte[] signature) {
        return Base64.getEncoder().encodeToString(signature);
    }
    private Optional<URI> buildWebhookServerURI(String webhookServerUrl) {
        try {
            return Optional.of(new URI(webhookServerUrl));
        } catch (URISyntaxException e) {
            return Optional.empty();
        }
    }
    private String getDate() {
        return headers.get(HEADER_DATE).get(0).split("\"")[0];
    }
    private String serializePayload(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
```
