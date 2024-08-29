# VRO Behaviors

VRO behaviors allow the integration of VRO workflows with the RDE framework. Essentially, а VRO behavior represents one VRO workflow and upon invoking the behavior, the workflow gets executed. Once the workflow execution completes, the associated behavior execution task completes accordingly as well.

## Prerequisites

In order to use VRO behaviors in VMware Cloud Director there needs to be a [registered vRealize Orchestrator in VMware Cloud Director](https://docs.vmware.com/en/VMware-Cloud-Director/10.5/VMware-Cloud-Director-Service-Provider-Admin-Guide/GUID-BEE4297F-8353-4DE3-8E86-DB2B511CAC77.html). The VRO workflows which will be exposed as behaviors need to be imported in VMware Cloud Director as well.

## Behavior Definition

```text
{
    "name": "vroBehavior",
    "execution": {
             "type": "VRO8Plus",
             "id": "urn:vcloud:serviceItem:08392368-366a-46f0-93ed-b97464366375",
             "execution_properties": {
                "workflow_execution_timeout": 10
            }
    }
}
```

The VRO behavior's `executionType` is `VRO8Plus`.  It is a required field.

The `id` field is the ID of the service item representing the workflow in VMware Cloud Director. Only imported workflows can be used as VRO behaviors. It is a required field.

The `workflow_execution_timeout` field states how long the Behaviors Framework will wait for a VRO workflow started by a VRO behavior invocation. If the workflow execution exceeds the stated timeout the behavior execution will fail with a timeout exception. The `workflow_execution_timeout` is an optional field. More on VRO behavior execution timeout can be found [here](#execution-timeout-and-polling-rate).

## Behavior Invocation

A VRO behavior is invoked as any other defined entity behavior:

```text
POST /cloudapi/1.0.0/entities/<entity_id>/behaviors/<behavior_id>/invocations
```

```json
{
    "arguments": {
        "executionId": null,
        "parameters": [
            {
                "description": null,
                "encryptValue": null,
                "name": "stringParameter",
                "scope": null,
                "type": "string",
                "updated": null,
                "value": {
                    "string": {
                        "value": "string"
                    }
                }
            },
            {
                "description": null,
                "encryptValue": null,
                "name": "numberParameter",
                "scope": null,
                "type": "number",
                "updated": null,
                "value": {
                    "number": {
                        "value": 789.0
                    }
                }
            },
            {
                "description": null,
                "encryptValue": null,
                "name": "arrayParameter",
                "scope": null,
                "type": "Array/number",
                "updated": null,
                "value": {
                    "array": {
                        "elements": [
                            {
                                "number": {
                                    "value": 1.0
                                }
                            },
                            {
                                "number": {
                                    "value": 2.0
                                }
                            },
                            {
                                "number": {
                                    "value": 3.0
                                }
                            },
                            {
                                "number": {
                                    "value": 4.0
                                }
                            },
                            {
                                "number": {
                                    "value": 5.0
                                }
                            },
                            {
                                "number": {
                                    "value": 6.0
                                }
                            },
                            {
                                "number": {
                                    "value": 7.0
                                }
                            }
                        ]
                    }
                }
            },
            {
                "description": null,
                "encryptValue": null,
                "name": "propertiesParameter",
                "scope": null,
                "type": "properties",
                "updated": null,
                "value": {
                    "properties": {
                        "property": [
                            {
                                "key": "key",
                                "value": {
                                    "string": {
                                        "value": "value"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        ],
        "profilerOptions": {
            "debuggerEnabled": false,
            "enabled": true,
            "tokenReplayEnabled": true
        }
    },
    "metadata": {
    }

}
```

Response:

```text
202 Accepted

Headers:
Location: https://127.0.0.1:8443/api/task/5f852482-d412-43df-90da-d47c4bf265ab
```

The result of the execution is in the `result` field of the behavior execution task.

```text
GET /api/task/5f852482-d412-43df-90da-d47c4bf265ab
```

```json
{
    ...
    "href": "https://127.0.0.1:8443/api/task/5f852482-d412-43df-90da-d47c4bf265ab",
    "type": "application/vnd.vmware.vcloud.task+json",
    "id": "urn:vcloud:task:5f852482-d412-43df-90da-d47c4bf265ab",
    "operationKey": null,
    "description": null,
    "tasks": null,
    "name": "task",
    "owner": {
        "otherAttributes": {},
        "href": "",
        "id": "urn:vcloud:entity:VMware:TestEntityType:1b64c041-c3b0-4c18-ab57-511f73d1d752",
        "type": "application/json",
        "name": "entity",
        "vCloudExtension": []
    },
    "error": null,
    "user": {
        "otherAttributes": {},
        "href": "https://127.0.0.1:8443/api/admin/user/f5eee232-85dd-4d69-9b38-fccfc7a0baec",
        "id": "urn:vcloud:user:f5eee232-85dd-4d69-9b38-fccfc7a0baec",
        "type": "application/vnd.vmware.admin.user+xml",
        "name": "administrator",
        "vCloudExtension": []
    },
    "organization": {
        "otherAttributes": {},
        "href": "https://127.0.0.1:8443/api/org/a93c9db9-7471-3192-8d09-a8f7eeda85f9",
        "id": "urn:vcloud:org:a93c9db9-7471-3192-8d09-a8f7eeda85f9",
        "type": "application/vnd.vmware.vcloud.org+xml",
        "name": "System",
        "vCloudExtension": []
    },
    "progress": null,
    "params": null,
    "details": "",
    "vcTaskList": {
        "otherAttributes": {},
        "vcTask": [],
        "vCloudExtension": []
    },
    "result": {
        "resultContent": "{\"executionId\":\"43fd06ae-257c-4c9b-8059-a92f7a3b3488\",\"startedBy\":\"Administrator@VSPHERE.LOCAL\",\"endDate\":\"2024-04-03T14:19:21.537+00:00\",\"name\":\"Base test workflow\",\"startDate\":\"2024-04-03T14:19:20.488+00:00\",\"status\":\"completed\",\"outputParameters\":[{\"value\":{\"string\":{\"value\":\"string\"}},\"type\":\"string\",\"name\":\"stringParameterOut\",\"scope\":\"local\"},{\"value\":{\"number\":{\"value\":789.0}},\"type\":\"number\",\"name\":\"numberParameterOut\",\"scope\":\"local\"},{\"value\":{\"array\":{\"elements\":[{\"number\":{\"value\":1.0}},{\"number\":{\"value\":2.0}},{\"number\":{\"value\":3.0}},{\"number\":{\"value\":4.0}},{\"number\":{\"value\":5.0}},{\"number\":{\"value\":6.0}},{\"number\":{\"value\":7.0}}]}},\"type\":\"Array/number\",\"name\":\"arrayParameterOut\",\"scope\":\"local\"},{\"value\":{\"properties\":{\"property\":[{\"key\":\"key\",\"value\":{\"string\":{\"value\":\"value\"}}}]}},\"type\":\"Properties\",\"name\":\"propertiesParameterOut\",\"scope\":\"local\"},{\"value\":{\"string\":{\"value\":\"true\"}},\"type\":\"string\",\"name\":\"_vdc_isAdmin\",\"scope\":\"token\"},{\"value\":{\"string\":{\"value\":\"administrator\"}},\"type\":\"string\",\"name\":\"_vdc_userName\",\"scope\":\"token\"},{\"value\":{\"string\":{\"value\":\"a93c9db9-7471-3192-8d09-a8f7eeda85f9\"}},\"type\":\"string\",\"name\":\"_vcd_orgId\",\"scope\":\"token\"},{\"value\":{\"string\":{\"value\":\"...\"}},\"type\":\"string\",\"name\":\"_vcd_sessionToken\",\"scope\":\"token\"},{\"value\":{\"string\":{\"value\":\"https://127.0.0.1:8443/api\"}},\"type\":\"string\",\"name\":\"_vcd_apiEndpoint\",\"scope\":\"token\"},{\"value\":{\"string\":{\"value\":\"true\"}},\"type\":\"string\",\"name\":\"_vcd_isAdmin\",\"scope\":\"token\"},{\"value\":{\"string\":{\"value\":\"System\"}},\"type\":\"string\",\"name\":\"_vcd_orgName\",\"scope\":\"token\"},{\"value\":{\"string\":{\"value\":\"administrator\"}},\"type\":\"string\",\"name\":\"_vcd_userName\",\"scope\":\"token\"}]}",
        "resultReference": null
    },
    "status": "success",
    "operation": "Invoked Behavior_0 testEntity(urn:vcloud:entity:VMware:TestEntityType:1b64c041-c3b0-4c18-ab57-511f73d1d752)",
    "operationName": "executeBehavior",
    "serviceNamespace": "com.vmware.vcloud",
    "startTime": "2024-04-03T17:19:14.894+0300",
    "endTime": "2024-04-03T17:19:25.687+0300",
    "expiryTime": "2024-07-02T17:19:14.894+0300",
    "cancelRequested": false,
    "vCloudExtension": []
}
```

The invocation's `arguments` must contain the payload which the VRO execute workflow API expects. More details on VRO's API can be found [here](https://developer.vmware.com/apis/1174/).

See the [Java Class to deserialize execution result from the behavior execution task to](#java-class-to-deserialize-execution-result-from-the-behavior-execution-task-to) in the `Code Examples` section.

### VRO Behavior Payload

When a VRO behavior is executed, the payload which the corresponding VRO workflow receives is constructed from the behavior invovation call `arguments`.

In order to receive the entity contents of the RDE instance which the behavior was invoked on, a `String` input parameter of name `entity` must be defined in the workflow. Upon the VRO behavior invocation that parameter is populated by VMware Cloud Director with a JSON-encoded string of the entity contents before sending the payload to VRO.

### Execution Timeout and Polling Rate

When a VRO workflow is triggered by a VRO behavior, VMware Cloud Director will wait for the workflow completion for a set amount of time before failing the behavior execution with a `Timeout` exception.

The amount of seconds to wait for completion before timeout can be set globally for all VRO behavior executions with the `workflow_execution_timeout` configuration property. The default is 300 seconds.

The `workflow_execution_timeout` can also be set to a different value for each VRO behavior in the definition of the behavior.

```json
{
    "name": "test",
    "execution": {
             "type": "VRO8Plus",
             "id": "urn:vcloud:serviceItem:08392368-366a-46f0-93ed-b97464366375",
             "execution_properties": {
                "workflow_execution_timeout": 10 // this sets the timeout value to 10s
            }
    }
}
```

The polling interval (in seconds) at which the Behaviors Framework will check for a VRO workflow completion is controlled by a configuration property as well - `workflow_execution_polling_rate`. The default value is 10 seconds.

## Code Examples

### Java Class to deserialize execution result from the behavior execution task to

```java
import java.util.ArrayList;
import java.util.Date;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonValue;

public class InvocationResult {
    public static enum ExecutionStatus {
        RUNNING("running"),
        WAITING("waiting"),
        WAITING_SIGNAL("waiting Signal"),
        FAILED("failed"),
        CANCELED ("canceled"),
        COMPLETED("completed"),
        DEBUGGING("debugging"),
        SUSPENDED("suspended")
        ;

        private final String value;

        ExecutionStatus(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }
    }

    private String executionId;
    private String startedBy;
    private String name;
    private ExecutionStatus status;
    private Date startDate;
    private Date endDate;
    private ArrayList<Map<String, Object>> outputParameters;

    public String getExecutionId() {
        return executionId;
    }

    public void setExecutionId(String executionId) {
        this.executionId = executionId;
    }

    public String getStartedBy() {
        return startedBy;
    }

    public void setStartedBy(String startedBy) {
        this.startedBy = startedBy;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ExecutionStatus getStatus() {
        return status;
    }

    public void setStatus(ExecutionStatus status) {
        this.status = status;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public ArrayList<Map<String, Object>> getOutputParameters() {
        return outputParameters;
    }

    public void setOutputParameters(ArrayList<Map<String, Object>> outputParameters) {
        this.outputParameters = outputParameters;
    }
}
```
