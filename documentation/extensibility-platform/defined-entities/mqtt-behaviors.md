# MQTT Behaviors

MQTT behaviors in VMware Cloud Director are based on MQTT API extensions (in the context of [API extensibility](../api-extensibility.md)). Invocation of a MQTT behavior is another way to trigger a MQTT extension (send a message to the extension for processing). When invoked MQTT behaviors essentially post a message to an extension topic and listen for a response to that message.

## Prerequisites

In order to create a MQTT behavior an MQTT API extension must be registered in VMware Cloud Director first.

Please familiarize yourself with [MQTT API extensibility](../api-extensibility.md) and how to register such an extension.

## Behavior Definition

MQTT behavior example definition:

```json
{
    "name": "mqtt_behavior_test",
    "execution": {
        "type": "MQTT",
        "id": "mqtt_behavior_test",
        "execution_properties": {
            "serviceId": "urn:vcloud:extension-api:VMWare_TEST:MqttExtension_TEST:1.2.3",
            "invocation_timeout": 15
        }

     }
}
```

The MQTT behavior's execution `type` is `MQTT`.  It is a required field.

The `id` is a user-defined string. It is a required field.

The `serviceId` from the `execution_properties` section holds the ID of the MQTT API extension which will be consuming the messages of this behavior. It is a required field.

The `invocation_timeout` field is used to specify a timeout in seconds for the response received from the MQTT extension. If not set, there is a system parameter `extensibility.timeout` which will be used as timeout (default is 10 seconds).

## MQTT Behavior Message Format

### VMware Cloud Director to Extension

Messages from VMware Cloud Director to Extension are sent on the extension's monitor topic:

```text
topic/extension/<vendor>/<name>/<version>/ext
```

The messages have the following format:

```json
{
    "type":"BEHAVIOR_INVOCATION",
    "headers":{
        "taskId":"9cb74c5d-2a72-45de-b729-2495f680c7f4",
        "entityId":"urn:vcloud:entity:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "behaviorId":"urn:vcloud:behavior-interface:mqtt_behavior_test:vmware:mqttInterface:1.0.0",
        "context":{
            "userId": "urn:vcloud:user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "orgId": "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "rights":[
                "urn:vcloud:org:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                ...
            ]
        },
        "payload": " <a JSON string of the invocation arguments> "

    }
}
```

The `rights` field from the `context` header is populated only if the `extensibility.enableRightInfo` configuration property is set to true. By default it is set to false.

See the [Java Class representing an invocation MQTT message](#java-class-representing-an-invocation-mqtt-message) in the `Code Examples` section.

The payload holds the invocation arguments from the MQTT behavior invocation:

```json
{
    "_execution_properties":{
        "serviceId":"urn:vcloud:extension-api:VMWare_TEST:MqttExtension_TEST:1.2.3"
    },
    "entityId":"urn:vcloud:entity:vmware:mqttType_test:1.0.0:3542f778-37e3-4ce9-b244-41ccc36e27c3",
    "typeId":"urn:vcloud:type:vmware:mqttType_test:1.0.0",
    "arguments":{
        "argument1":"argument1"
    },
    "additionalArguments":null,
    "_metadata": {
        "executionId":"mqtt_behavior_test",
        "invocation":{},
        "behaviorId":"urn:vcloud:behavior-interface:mqtt_behavior_test:vmware:mqttInterface:1.0.0",
        "taskId":"c359ea34-2db6-419f-bad6-468a9704d49e",
        "executionType":"MQTT"
        },
    "entity": {
        "property1":"property1",
    }
}
```

See the [Java Class to deserialize a payload to InvocationArguments](#java-class-to-deserialize-a-payload-to-invocationarguments) in the `Code Examples` section.

### Extension to VMware Cloud Director

Response messages from VMware Cloud Director to extension must be sent on the extension's respond topic:

```text
topic/extension/<vendor>/<name>/<version>/vcd
```

The messages must have the following format:

```json
{
    "type": "BEHAVIOR_RESPONSE",
    "headers": {
        "taskId": "9cb74c5d-2a72-45de-b729-2495f680c7f4",
        "entityId": "urn:vcloud:entity:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    },
    "payload": "<a string>"

}
```

See the [Java Class representing a response MQTT message](#java-class-representing-a-response-mqtt-message) in the `Code Examples` section.

There are two types of responses an extension can send back to VMware Cloud Director - a simple response and a task update response.

The simple response (`ResponseContentType.PLAIN_TEXT`) completes the behavior invocation task successfully and uses the payload string as the task result.

The task update response (`ResponseContentType.TASK`) allows for updating not only the behavior invocation task's `result`, but also the task's `status`, `details`, `operation`, `error`, `progress`. The payload must represent a valid JSON representation of `TaskType` with the task properties that need to be modified. The headers must contain a `Content-Type` header with the value of `application/vnd.vmware.vcloud.task+json`.

Multiple task update responses can be sent back to VMware Cloud Director. This allows the task progress to be updated continuously, for example. The last task update must complete the task. Once the task is completed, later task updates regarding this task are ignored.

Example success task update payload:

```json
{
    "status": "success",
    "operation": "test-operation",
    "details": "test details",
    "result": {
        "resultContent": "test result"
    },
    "progress": 100
}
```

Example error task update payload:

```json
{
    "status": "error",
    "operation": "test-operation",
    "details": "test details",
    "error": {
        "majorErrorCode": 409,
        "minorErrorCode": "TEST_ERROR",
        "message": "Test error message"
    }
}
```

Example aborted task update payload

```json
{
    "status": "aborted",
    "operation": "test-operation",
    "details": "test details",
    "progress": 50
}
```

See the [Java class representing a Task](#java-class-representing-a-task) in the `Code Examples` section.

## Example `IMqttMessageListener` implementation for processing MQTT messages

```java
public class MqttListener implements IMqttMessageListener {

    private final String topicToRespond;
    private final MqttClient mqttClient;
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public MqttListener(final String topicToRespond, final MqttClient mqttClient) {
        this.topicToRespond = topicToRespond;
        this.mqttClient = mqttClient;
    }

    public void closeListener() throws MqttException {
        this.mqttClient.disconnectForcibly();
    }


    @Override
    public void messageArrived(final String s, final MqttMessage mqttMessage) throws Exception {
        // Message from VCD received

        MqttRemoteServerMessage request = objectMapper.readValue(mqttMessage.getPayload(), MqttRemoteServerMessage.class);

        if (NotificationType.BEHAVIOR_INVOCATION != request.getType()) {
            // ignore not behavior invocation messages
            return;
        }
        //parse the request payload to a Map
        InvocationArguments invocationArguments = objectMapper.readValue(request.getPayload(), InvocationArguments.class);

        //now the information can be accessed
        Map<String, Object> executionProperties = invocationArguments.getExecutionProperties();
        InvocationArguments.InvocationArgumentsMetadata metadata = invocationArguments.getMetadata();
        Map<String, Object> arguments = invocationArguments.getArguments();
        String typeId = invocationArguments.getTypeId();

        final MqttRemoteServerResponseMessage response = createResponse(request);

        String responseAsJson = objectMapper.writeValueAsString(response);

        mqttClient.publish(topicToRespond, new MqttMessage(responseAsJson.getBytes()));
    }

    private MqttRemoteServerResponseMessage createResponse(MqttRemoteServerMessage request) {
        // your business logic goes here
    }

}

```

## Code Examples

### Java Class representing an invocation MQTT message

```java
public enum NotificationType {
    EVENT,
    EXTERNAL_EVENT,
    TASK,
    EXTENSION_TASK,
    API_REQUEST,
    API_RESPONSE,
    BEHAVIOR_INVOCATION,
    BEHAVIOR_RESPONSE,
}
```

```java
import java.util.List;

public class MqttRemoteServerMessage {
    private NotificationType type;
    private Headers headers;
    private String payload;

    public void setType(NotificationType type) {
        this.type = type;
    }

    public void setHeaders(Headers headers) {
        this.headers = headers;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    /**
     * @return the notification type of the messageIn the case of a MQTT message coming from VCD this
     * is BEHAVIOR_INVOCATION.
     */
    public NotificationType getType() {
        return type;
    }

    public Headers getHeaders() {
        return headers;
    }

    public String getPayload() {
        return payload;
    }

    /**
     * MQTT message headers
     */
    public static class Headers {
        private String taskId;
        private String entityId;
        private String behaviorId;
        private Context context;


        /**
         * @return The id of the behavior invocation task
         */
        public String getTaskId() {
            return taskId;
        }

        public void setTaskId(String taskId) {
            this.taskId = taskId;
        }

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
         * @return the id of the invoked behavior
         */
        public String getBehaviorId() {
            return behaviorId;
        }

        public void setBehaviorId(String behaviorId) {
            this.behaviorId = behaviorId;
        }

        /**
         * @return the MQTT message context
         */
        public Context getContext() {
            return context;
        }

        public void setContext(Context context) {
            this.context = context;
        }
    }

    /**
     * @return the MQTT message context
     */
    public static class Context {
        private String orgId;
        private String userId;
        private List<String> rights;

        /**
         * @return the id of the org which the behavior was invoked in
         */
        public String getOrgId() {
            return orgId;
        }

        public void setOrgId(String orgId) {
            this.orgId = orgId;
        }

        /**
         * @return the id of the user who invoked the behavior
         */
        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        /**
         * @return rights of the user who invoked the behavior.
         * This field is populated only if the <code>extensibility.enableRightInfo</code> configuration
         * property is set to true (by default it is set to false)
         */
        public List<String> getRights() {
            return rights;
        }

        public void setRights(List<String> rights) {
            this.rights = rights;
        }
    }

}
```

### Java Class to deserialize a payload to InvocationArguments

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

### Java Class representing a response MQTT message

```java
import java.util.Arrays;

public class MqttRemoteServerResponseMessage {
    private NotificationType type;
    private Headers headers;
    private String payload;

    public void setType(NotificationType type) {
        this.type = type;
    }

    public void setHeaders(Headers headers) {
        this.headers = headers;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    /**
     * @return the notification type of the MQTT message. In the case of a MQTT message sent as a
     * response from extension to VCD this is BEHAVIOR_RESPONSE.
     */
    public NotificationType getType() {
        return type;
    }

    /**
     * @return the {@link Headers} of the MQTT message
     */
    public Headers getHeaders() {
        return headers;
    }

    /**
     * @return the payload of the MQTT message. Must be a JSON encoded string.
     */
    public String getPayload() {
        return payload;
    }

    /**
     * The headers of the MQTT message
     */
    public static class Headers {
        private String taskId;
        private String entityId;
        private String contentType;

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
         * @return The id of the behavior invocation task
         */
        public String getTaskId() {
            return taskId;
        }

        public void setTaskId(String taskId) {
            this.taskId = taskId;
        }

        /**
         * @return the content-type of the payload of the MQTT message response
         */
        public String getContentType() {
            return contentType;
        }

        public void setContentType(ResponseContentType contentType) {
            this.contentType = contentType.getValue();
        }
    }

    /**
     * Content-type of the payload of the MQTT message response
     */
    public static enum ResponseContentType {
        PLAIN_TEXT("plain/text"),
        TASK("application/vnd.vmware.vcloud.task+json"),
        ;

        private final String value;
        ResponseContentType(String value){
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static ResponseContentType fromValue(String string) {
            return Arrays.stream(ResponseContentType.values()).filter(
                    t -> t.getValue().equals(string)
            ).findFirst().orElse(null);
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
