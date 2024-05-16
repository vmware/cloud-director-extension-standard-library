# Exploring Solution Add-On Elements

Elements are the smallest deployable units of a solution add-on. They are entities managed by Cloud Director or third-party systems, uniquely identified across their solution add-on and its instances. Once an element is deployed in the target system, it defines a set of properties whose values can be used by other add-on elements for their deployment activities. However, there is a strict rule - element properties can only be consumed by elements that appear after the definition of the element in its manifest.

Elements can have associated actions to perform pre- and post-deployment activities, allowing the add-on vendor to have certain control during the element deployment. Such actions can also be defined at the add-on level, enabling generic pre-setup or clean-up activities.

An element could be associated with one or many instances of an add-on, depending on its type and the associated manifest policy.

## Immutable Elements
The immutable elements are `always shared` among add-on instances. They cannot be modified during add-on upgrades but rather preserved or substituted.
- UI Plugin
- Defined Entity

## Mutable Elements
The mutable elements `cannot be shared` among add-on instances. Each instance of these elements is linked to a specific add-on instance. Because of this characteristic, they enable the occurrence of configuration drift during add-on upgrades.
- User
- Service Account
- Role
- Right Bundle
- Defined Entity Instance
- Virtual Appliance
- Network Policy
- Network Service

Elements and their associated configuration are defined in a solution add-on `manifest.yaml` file with the following sections.

## Vendor
Vendor section holds details about the add-on origin and its current version. This section is visible in the Solution Add-On Management UI.

It is recommended to use simple names, lower-case with hyphens for vendor and name properties as they will be used as part of the add-on identifier and the packaged ISO name.

```yaml
vendor: <add-on vendor name>
name: <add-on name>
version: <add-on version (N.N.N[-W])>
vcdVersion: <minimal supported Cloud Director version of this add-on>
friendlyName: <name under which this add-on will appear in the management UI>
description: <short description of the add-on business function visible in add-on management UI>
```

**IMPORTANT**: Each solution add-on must have a unique `vendor` and `name`. Changing either of these at any point will result in a completely new add-on.

## Inputs
Inputs section is defined by the add-on vendor to request user input during the add-on installation and its associated day-2 operations. Inputs are referenced by add-on elements and their associated actions in the `manifest.yaml` and their values are substituted at the time of add-on operation execution.
```yaml
inputs:
  - name: <the input field identifier used by elements for referencing the field concrete value>
    title: <the display name of this input field, visible in add-on management UI>
    description: <the description of this input field, visible in add-on management UI>
    required: <optional, if set to 'true' will force the field to be set>
    secure: <optional, if set to 'true' will encrypt the field value. Note, the value cannot be seen even by the user who specified it.>
    type: <optional, defaults to 'String', denotes the type of this input filed>
    view: <optional, denotes additional view properties of the field>
    default: <optional, if set the value will be used when consumer does not specify a value>
    validation: <optional, regular expression validating the value for the field>
    delete: <optional, if set to 'true' will make this input field available only to the add-on instance delete operation>    
    isArray: <optional, if set to 'true' the filed can accept a list of values>
    values: <optional, the finite set of values that can be set to this variable>
```

## Elements

The Elements section contains a list of elements that compose the add-on. An element is defined using properties in the `manifest.yaml` descriptor. Every element, regardless of its type, has properties such as `name`, `description`, and `triggers`. The `type` property further determines whether the element will have a `spec` property and specifies the schema for its properties.

Some elements require a filesystem artifacts for their realizations. These artifacts by convention are located under folder with name matching the `name` property of its associated element. An element artifact could be an already bundled artifact or the source code and build script that will turn into bundle artifact via `vcd-ext-shell` `build` command.

```yaml
elements:
    - type: ui-plugin | user | service-account | role | rights-bundle | defined-entity | defined-entity-instance | vapp | network-policy | service
      name:

      # If missing description defaults to "name"
      description: <User friendly name>
      triggers: []
```

During each operation on an element, a transaction log is kept to track the changes made. The transaction log begins when the operation on the element starts and ends when the add-on reaches its final states of READY or removal. Additionally, triggers can define their own transaction logs or analyze the element's transaction log to perform the necessary actions during retry, upgrade, and rollback operations.

**NOTE**: During the add-on instance creation operation, elements are processed in ascending order one at a time.
During the add-on instance deletion operation, elements are processed in reverse order.

### UI Plugin

UI Plugin `type` represents a Cloud Director UI plugin. This element definition requires the `name` property to point to a project root folder `<element reference name>` where the source code of the plugin will be located, or its resulted artifact `<element reference name>/dist/plugin.zip` in case of an external build tooling is used.

The `type` further requires the `spec` property describing the UI Plugin visibility rules.

```yaml
elements:
  - type: ui-plugin
    name: <element reference name>
    spec:
      # Optional arguments below
      publish:
        solutionLandingZone: true | false
        provider: true | false
        # tenantsAll and tenants are exclusive
        tenants: true | false
```
[UI Plugins Development](ui-plugins.md)

### User

User `type` represents a Cloud Director User entity. The element `type` requires the `spec` property, it outlines the details required for the user realization.

```yaml
elements:
  - type: user
    spec:
      username: text
      roleName: text

      # Optional arguments below
      password: text
      description: text
      fullName: text
      email: text

      # Default: LOCAL
      providerType: LOCAL | SAML | OAUTH
      
      # True: user will be created in the Provider Portal
      # False: user will be created in the organization specified in the Solution Landing zone
      systemScope: true | false
```

### Service Account

Service Account `type` represents a Cloud Director Service Account entity. The element `type` requires the `spec` property, it outlines the details required for the user realization.

```yaml
elements:
  - type: service-account
    spec:
      name: text
      roleName: text

      # Optional arguments below
      uri: text
      softwareId: text 
      softwareVersion: text
```

### Role

Role `type` represents a Cloud Director Role entity. The element `type` requires the `spec` property, it outlines the details required for the role realization.

```yaml
elements:
  - type: role
    spec:
      name: 

      # List of rights keys or ids
      # Example id: urn:vcloud:type:vmware:demo_person
      # Examples: 
      #  - "API Tokens: Manage"
      #  - "Access All Organization VDCs"
      #  - "urn:vcloud:type:vmware:<DEFINED ENTITY TYPE>:full_access"
      #  - "urn:vcloud:type:vmware:<DEFINED ENTITY TYPE>:view"
      #  - "urn:vcloud:type:vmware:<DEFINED ENTITY TYPE>:modify"
      rights:
        - <RIGHT>
        - ...

      # Optional arguments below
      description:

      # Define right as system or global
      global: true | false

      # Define global right visibility
      publish: 
        solutionLandingZone: true | false
        # if the element is sharable with tenants ( tenant selection is done during create and publish operations)
        tenants: true | false
```

### Right bundle

Right Bundle `type` represents a Cloud Director Right Bundle entity. The element `type` requires the `spec` property, it outlines the details required for the right bundle realization.

```yaml
elements:
  - type: rights-bundle
    spec:
      name: 

      # List of rights keys or ids
      # Example id: urn:vcloud:type:vmware:demo_person
      # Examples: 
      #  - "API Tokens: Manage"
      #  - "Access All Organization VDCs"
      #  - "urn:vcloud:type:vmware:<DEFINED ENTITY TYPE>:full_access"
      #  - "urn:vcloud:type:vmware:<DEFINED ENTITY TYPE>:view"
      #  - "urn:vcloud:type:vmware:<DEFINED ENTITY TYPE>:modify"
      rights:
        - <RIGHT>
        - ...
      
      # Define right bundle visibility
      description:
      publish: 
        solutionLandingZone: true | false
        # if the element is sharable with tenants ( tenant selection is done during create and publish operations)
        tenants: true | false
```

### Defined Entity

Defined Entity `type` represents a Cloud Director Runtime Defined Entity interfaces, types and behaviors. This element definition requires the `name` property to point to a project root folder `<element reference name>` where the source code of the Defined Entity definitions will be located, or their resulted artifacts `<element reference name>/dist/types/*.json` and `<element reference name>/dist/interfaces/*.json` in case of an external build tooling is used.

```yaml
elements:
  - type: defined-entity
  - name: <element reference name>
```

### Defined Entity Instance

Defined Entity Instance `type` represents a Cloud Director instance of a Defined Entity Type. The element `type` requires the `spec` property, it outlines the details required for the instance realization.


```yaml
elements:
  - type: defined-entity-instance
    spec:
      vendor: <vendor defined by defined entity type>
      nss: <namespace defined by defined entity type>
      version: <version defined by defined entity type>
      entity: <entity body defined by defined entity type>
      
      # Optional arguments below
      name: <element reference name>

      # Defines what role should be able to manage this entity instance
      accessControlRole: <cloud director role name>

      owner:
        username: <username>
        password: <password>
        
        # Optional arguments below
        # The system scope has to be set to the one the user belongs to
        systemScope: true | false
```

### Vapp

Vapp `type` represents a Cloud Director virtual appliance. The element `type` requires the `spec` property, it outlines the details required for the vApp realization.

```yaml
elements:
  - type: vapp
    spec:
      # Configures how the vApp will be upgraded.
      # Mutate: vApp will be upgraded by mutating its state from an action attached to a specific event. This is the default value if property is not set.
      # Replace: vApp will be re-created from the new add-on ISO. Vendors must ensure existing vApp data (if any) is migrated to the new vApp.
      upgradeStrategy: Mutate | Replace
      
      # Applicable when the vApp descriptor contains OVF properties
      ovfProperties:
        - key:
          value: number | string | boolean
        - ...

      # Further, customizes the vApp virtual machine before its power on operation invocation
      guestCustomization:
        disabled: boolean
        changeSid: boolean
        joinDomainEnabled: boolean
        useOrgSettings: boolean
        domainName: string
        domainUserName: string
        domainUserPassword: string
        machineObjectOU: string
        adminPasswordEnabled: boolean
        adminPasswordAuto: boolean
        adminPassword: string
        adminAutoLogonEnabled: boolean
        adminAutoLogonCount: number
        resetPasswordRequired: boolean
        customizationScript: string
        computerName: string
      
      # Connects the vApp virtual machine to a network defined by the Solution Landing Zone matching the defined assignment and capabilities.
      networks:
        - assignment: auto | static | dynamic
          primary: true | false
          disconnected: true | false
          capabilities:
            - string
            - ...

      # Use storage policy defined by the Solution Landing Zone matching the defined capabilities.
      storage:
        capabilities:
          - string
          - ...
      
      # Further, customize the vApp virtual machine hardware before its power on operation invocation
      hardware:
        numberOfCpus: number
        coresPerSocket: number
        # Memory size in MB
        memorySize: number

      # Terminate the vApp element installation when the timeout has reached.
      timeoutMinutes: number

      # Element installation is considered as successful when all conditions are met in the specified by the timeout duration.
      readyCondition:
        # The vApp virtual machine received an IP
        "ip": 
        
        # The vApp virtual machine ExtraConfig contains a key
        "<key>":

        # The vApp virtual machine ExtraConfig contains a key with value
        "<key>": "<value>"
```

**NOTE**:
- Guest customization is enabled by default, with property values sourced from the virtual machine template.
- Network assignment of the 'auto' and 'static' types requires guest customization to be enabled.


### Network Policy

Network Policy `type` represents a Network Manager policy that defines a firewall rule. The element `type` requires the `spec` property, it outlines the details required for the policy realization.

```yaml
elements:
  - type: network-policy
    spec:
      type: vcenter | esxi | nsx | compute
      # Optional arguments below
      name: <element reference name>
      sources:
        - <IP>
        - ...
      destinations:
        - <IP>
        - ...
      
      # Option: Named service
      services:
        type: HTTP| HTTPS | SSO | SSH | ICMP-ALL
      
      # Option: Custom service
      services:
        protocol: TCP | UDP
        # Optional
        # Port must be in range 1-65535
        sourcePort: number
        targetPort: number
```

#### Examples

Create an outbound firewall rule from VM1 to VM2 on port 443
```yaml
- name: my-policy
  type: network-policy
  spec:
    type: compute
    vdc: my-ovdc
    sources: 
      - 192.168.1.1
    destinations: 
      - 192.168.1.2
    services:
      - targetPort: 443
        protocol: TCP
```

Create an inbound firewall rule to VM on port 8443
```yaml
- name: my-policy
  type: network-policy
  spec:
    type: compute
    vdc: my-ovdc
    destinations: 
      - 192.168.1.1
    services:
      - targetPort: 8443
        protocol: TCP
```


### Network Service

Network Service `type` represents a Network Manager service that defines a way to expose internal IP addresses to the outside world using public IPs. The element `type` requires the `spec` property, it outlines the details required for the service realization.

```yaml
elements:
  - type: service
    spec:
      # Option: Named binding
      bindings:
        type: HTTP| HTTPS | SSO | SSH | ICMP-ALL

      # Option: Custom binding
      bindings:
        protocol: TCP | UDP
        port: number
        # Optional
        targetPort: number

      # Optional arguments below
      name: text
      privateIp: text
      firewallStrategy: MATCH_INTERNAL_ADDRESS | MATCH_EXTERNAL_ADDRESS
```

### Resources
In order to include additional resources in the final package, you can specify them in the manifest file using the following format:
yaml
```yaml
resources: 
  - x:sourcePath:optionalTargetPath
```

A resource can be specified only by its source folder relative to the solution folders. 
The full format of a resource specification is as follows:
- “x”: (optional) Execution flag will give instructions for the file/files to be packaged as executables in the ISO file system.
- sourcePath: The path of the file relative to the solution folder.
- targetPath: (optional) The path in the ISO file where the resource will be added.
Here is an example of how to specify resources in the manifest file:
```yaml
resources: 
  - source/path 
  - source/path:target/path 
  - x:source/path/executableFile 
  - x:source/path/executableFile:target/path/executableFile
```

In the above example, the first resource will be included in the ISO file without any modification to the target path. 
The second resource will be included in the ISO file at the specified target path. 
The third resource will be included in the ISO file as an executable file. 
Finally, the fourth resource will be included in the ISO file as an executable file at the specified target path.
When specifying resources in the manifest file, it is important to note that the sourcePath must be relative to the solution folder. 
Additionally, the optional targetPath should only be used if you want to include the resource in a specific location in the ISO file. 
Finally, the execution flag is useful if you want to include executable files in the ISO file system.
By following the above guidelines, you can ensure that your resources are properly included in the final package.



## Policy
The Policy section defines a set of rules established by the add-on vendor that an add-on instance must comply with.

### Supports-Multiple-Instances Policy
This policy determines whether an add-on can have only one instance or multiple instances. By default, this policy is optional and set to false.
If the policy section is missing from the manifest or the `supportsMultipleInstances` property is set to `false`, the add-on management will consider the add-on as a single instance.

```yaml
policies:
  supportsMultipleInstances: true
```

### Upgrade-From Policy
This policy specifies the previous add-on versions from which the current version can be upgraded. The policy property accepts a list of version patterns separated by commas. Each version pattern follows a format where each token can be a specific version value or a wildcard represented by `*`. By default, this policy is optional and set to none.

```yaml

# <version pattern> = <major>.<minor>.<incremental>-<build number or qualifier>
# Examples:
#  upgradesFrom: 1.0.0
#  upgradesFrom: 1.0.*, 1.*.1
#  upgradesFrom: 1.*.2-PRERELEASE
policies:
  upgradesFrom: <version_pattern 1>, <version_pattern 2>, ...  
```

## Operations
Operations section defines the actions that are available to the provider as day-2 instance operations.

```yaml
operations:
  - name: <operation name>
    description: <operation description>
    inputs:
      - name: <the input field identifier used by elements for referencing the field concrete value>
        title: <the display name of this input field, visible in add-on management UI>
        description: <the description of this input field, visible in add-on management UI>
        required: <optional, if set to 'true' will force the field to be set>
        secure: <optional, if set to 'true' will encrypt the field value. Note, the value cannot be seen even by the user who specified it.>
        type: <optional, defaults to 'String', denotes the type of this input filed>
        view: <optional, denotes additional view properties of the field>
        default: <optional, if set the value will be used when consumer does not specify a value>
        validation: <optional, regular expression validating the value for the field>
        isArray: <optional, if set to 'true' the filed can accept a list of values>
        values: <optional, the finite set of values that can be set to this variable>
      - ...  
    action: <path under ISO>/<action handler executable>
    timeout: <timeout in minutes>
  - ...
```

## Trigger
Trigger section defines actions to be run as part of the add-on management lifecycle.
```yaml
triggers:
  - event: <event type>
    action: <path under ISO>/<action handler executable>
    timeout: <timeout in minutes>
  - ...
```

The triggers can be implemented on any language as long as their build provides binaries for the three major operating systems for development.
```shell
<add-on project>/dist/windows.exe
<add-on project>/dist/linux
<add-on project>/dist/darwin
```

Triggers can be defined globally on the add-on object or locally specified for a specific element. The following is a comprehensive list of supported events to which a trigger can be attached:

Event Types:
- PreCreate (add-on)
- PostCreate (add-on)
- PreUpgrade (add-on)
- PostUpgrade (add-on)
- PreDelete (add-on)
- PostDelete (add-on)
- PreScope (add-on change scope day-1 and day-2 operations)
- PostScope (add-on change scope day-1 and day-2 operations)
- PreOperation (add-on day-2 operation)
- PostOperation (add-on day-2 operation)
- OnError (add-on on any failure regardless if the operation is day-1 or day-2)

Solution add-on operation executor invokes a trigger as a separate OS process and provides its execution context properties as JSON string into the `standard output`.
If the trigger wants to output a property which can be referenced by other triggers or elements it has to be printed into the `standard output` following the log line format `{"output":{"name": "<key>", "value": "value", "secure: true|false}`.

The vendor have the option to create a separate binary for every trigger definition in the `manifest.yaml` or use one trigger with internal switch based on the execution context, or mixture of both.

**IMPORTANT**: The add-on operation execution will terminate immediately if a trigger returns a `non-zero` exit code.
This is the recommended mechanism to terminate forcefully an add-on operation.

This is an example of a `multipurpose` trigger with internal switch implemented on GoLang.

```go
// Copyright 2023 VMware, Inc.
// SPDX-License-Identifier: Apache-2.0
package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
)

type InputProperties struct {
    Event         string          `json:"event"`
    Element       string          `json:"element"`
    Error         string          `json:"error"`
    CloudDirector CloudDirector   `json:"cloudDirector"`
    Runtime       Runtime         `json:"runtime"`
    Execution     ExecutionInfo   `json:"execution"`
    Logging       Logging         `json:"logging"`
    Organization  EntityReference `json:"organization"`
    Properties    Properties      `json:"properties"`
    Transaction   map[string]any  `json:"transaction"`
}

type ExecutionInfo struct {
    Owner        string `json:"owner"`
    InvocationId string `json:"invocationId"`
    TaskId       string `json:"taskId"`
}

type EntityReference struct {
    Id   string `json:"id"`
    Name string `json:"name"`
}

type OutputProperty struct {
	Name   string `json:"name"`
	Value  any    `json:"value"`
	Secure bool   `json:"secure"`
}

type OutputProperties []OutputProperty

func readPropertiesFromStandardInput() InputProperties {
	scanner := bufio.NewScanner(os.Stdin)
	if !scanner.Scan() {
		exitIfErrorExists(errors.New("no standard input"), "error reading from standard input")
	}
	inputJson := scanner.Text()

	// DEVELOPMENT ONLY! Print standard input for examination.
	// Note all secrets will be visible in the standard output log.
	fmt.Println(inputJson)

	input := InputProperties{}
	err := json.Unmarshal([]byte(inputJson), &input)
	exitIfErrorExists(err, "error reading JSON from standard input")
	return input
}

func (o OutputProperty) writePropertyIntoStandardOutput() error {
	if variableJson, err := json.Marshal(o); err != nil {
		return err
	} else {
		_, err = fmt.Println(fmt.Sprintf("output:%s", string(variableJson)))
		return err
	}
}

func (properties OutputProperties) writePropertiesIntoStandardOutput() {
	for _, property := range properties {
		if err := property.writePropertyIntoStandardOutput(); err != nil {
			fmt.Errorf("failed serializing the output for variable %s:%v", property.Name, err)
			os.Exit(1)
		}
	}
}

func exitIfErrorExists(err error, message string) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s: %v", message, err)
		os.Exit(1)
	}
}

const eventPreCreate = "PreCreate"
const eventPostCreate = "PostCreate"
const eventPostDelete = "PostDelete"
const elementNone = ""
const elementCloudDirectorUser = "cloud-director-user"

// This is the body of the multipurpose action handler. It is going to be called multiple times with for various
// places where it is referenced by the manifest.yaml#triggers and manifest.yaml#element#triggers.
//
// Use multipurpose action pattern for convenience or source code size reduction and usability.
func main() {
	fmt.Println("Solution add-on trigger has been called")

	inputProperties := readPropertiesFromStandardInput()

	// Example: Handle solution add-on global triggers
	if inputProperties.Element == elementNone && inputProperties.Event == eventPreCreate {
		fmt.Println("solution pre-create event")

		// Example: set or update multiple solution add-on global properties at once
		OutputProperties{
			{Name: "exampleKeyMap", Value: map[string]any{"k1": "v1", "k2": "v2"}, Secure: false},
			{Name: "exampleKeyArrayAny", Value: []any{1, "v", true, map[string]bool{"k": true}}, Secure: false},
		}.writePropertiesIntoStandardOutput()

	}

	if inputProperties.Element == elementNone && inputProperties.Event == eventPostDelete {
		fmt.Println("solution post-delete event")
	}

	// Example: Handle solution add-on trigger for specific element
	if inputProperties.Element == elementCloudDirectorUser && inputProperties.Event == eventPostCreate {
		fmt.Println("solution pre-create event")

		// Example: Set or update a solution add-on global property
		OutputProperty{
			Name: "api-token", Value: "XXX API Token XXX", Secure: true,
		}.writePropertyIntoStandardOutput()
	}

	fmt.Println("Solution add-on trigger terminated")
}
```



## Task

Tasks serve as traceable entities ensuring visibility and accountability for the work carried out by the SDK internals or custom actions associated with triggers. These long-lived objects, implemented as Runtime Defined Entities, can be examined for troubleshooting purposes. The SDK allows actions to define their own tasks, particularly useful for reporting long-running activities.

A task tracing object is represented by an operation identifier and a property bag. Tasks are not parallel and cannot be updated. They possess a property bag that vendors can use to store indicative information.

When a task is created, it enters a "In Progress" state, visually displayed in the Cloud Director UI as an "Indeterminate Spinner." It's essential to note that this is not a progress bar and should not be used for updating progress.

A task is automatically completed when a new task is created or when the element or action has terminated.

Actions associated with triggers can create custom tasks by printing the following JSON in the Standard Output.
```JSON
{"task":{"operation":"This is task <One>", "<propertyName>": "<propertyValue>", ...}}
// Task One created
...
{"task":{"operation":"This is task <Two>", "<propertyName>": "<propertyValue>", ...}}
// Task One completed
// Task Two created
```

## Transaction Log

The transaction log serves as a collection of information about the changes made by the most recent operation on the add-on. These logs are short-lived objects implemented as Runtime Defined Entities. Each record in the log represents a single change made to a resource by a specific owner, such as elements or custom actions. Once a change is made, it cannot be modified, as the allowed operations on the transaction log entries are limited to creation and deletion.

A transaction log record is committed automatically once a new record is created or when the operation terminates successfully. It functions as a stack of changes, maintaining a record of the sequence of alterations.

For actions, a transaction log will be provided as part of the JSON input to the Standard Input Stream. Initially empty, the vendor can start adding records for every atomic change they perform.

In the event of an error during retry or rollback operations, the transaction log value will be fed as part of the JSON input to the Standard Input Stream. Based on the input context and the records from the log, the vendor can then retry or rollback their custom-made atomic changes. The transaction log plays a critical role in acting as a cursor for multiple atomic operations, enabling compensation transaction operations, also known as two-phase commit.

Whenever a component modifies a resource, it must store sufficient information in the transaction log property bag. This ensures that in the event of a rollback or retry, it can effectively restore the resource to its original state.

Actions can create custom transaction log records by printing the following JSON in the Standard Output.

```JSON
{"transaction":"Atomic operation A", "<propertyName>": "<propertyValue>", ...}
...
{"transaction":"Atomic operation Z", "<propertyName>": "<propertyValue>", ...}
```

## Logging

By default, the Standard Output and Standard Error Streams from an action execution are processed by the SDK and are not forwarded into the operation logs visible from the Cloud Director user interface or CLI.

However, actions have the capability to expose user logs by printing the following JSON in the Standard Output or Error Streams. This enables users to receive and view specific information or logs generated during the action's execution, providing valuable insights into the operation's progress and any potential issues encountered.

```JSON
{"log": {"level": "info", "msg": "message"}}
```

Supported logging levels are `info`, `warn`, `debug`, `trace`, `error`.

## Variables

The solution add-on operation context is loaded with implicit variables could be the runtime. These variables can be referenced by the `manifest.yaml` or read via `triggers'` standard input.

### Specification of Add-On Operation Runtime Variables
```json
{
  "cloudDirector": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
    "apiVersion": "37.1",
    "certificates": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
    "host": "<cloud director FQDN>",
    "port": 443,
    "productVersion": "<Cloud Director version ex. 10.4.1.XXX>",
    "session": {
      "org": {
        "id": "urn:vcloud:org:<UUID>",
        "name": "<name>"
      },
      "role": {
        "id": "urn:vcloud:role:<UUID>",
        "name": "<name>"
      },
      "user": {
        "id": "urn:vcloud:user:<UUID>",
        "name": "<name>"
      }
    },
    "thumbprint": "<ex. AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA>"
  },
  "instanceName": "<the name of the add-on instance>",
  "dataCenter": {
    "id": "urn:vcloud:vdc:<UUID>",
    "name": "<the name of the organization datacenter>",
    "isDefault": true,
    "capabilities": [],
    "networks": [
      {
        "id": "urn:vcloud:<UUID>",
        "name": "<name>",
        "capabilities": [],
        "isDefault": true
      }
    ],
    "storagePolicies": [
      {
        "id": "urn:vcloud:vdcstorageProfile:<UUID>",
        "name": "<name>",
        "capabilities": [],
        "isDefault": true
      }
    ],
    "computePolicies": []
  },
  "element": "<the name of the element in the execution context as stated in manifest.yaml>",
  "event": "PreCreate|PostCreate|PreDelete|PostDelete",
  "logging": {
    "debug": true,
    "format": "text|json",
    "trace": true
  },
  "manifest": "<manifest.yaml as JSON>",
  "organization": {
    "id": "urn:vcloud:org:<UUID>",
    "name": "<name>"
  },
  "properties": {
    "<input property name>": "<user provided value>",
    "...": "..."
  },
  "runtime": {
    "sdkVersion": "1.0.4.5710459",
    "goVersion": "go1.19.2",
    "vcdVersion": "10.4.1.20912624",
    "environment": "Production"
  },
  "scope": {
      "providerScoped": true,
      "tenantScoped": true,
      "allTenants": false
  }
}
```

Solution add-on `manifest.yaml` can benefit from the data-driven templates for generating textual output. It is fully compliant with [GoLang Data-Driven Templates](https://pkg.go.dev/text/template).

Inputs and elements properties can be referenced by other elements via the data-driven templates syntax. This way a user input or a property from an already realized element can be used by an element realization handler.

### Examples

Use user input property into element
```yaml
inputs:
  - name: vapp-config-url
    title: vApp Configuration Url
    required: true
    description: A service inside the vApp will pull its configuration from this URL

elements:
  - name: my-backend
    type: vapp
    spec:
      ovfProperties:
        - key: configUrl
          value: {{ property `vapp-config-url` }}
        - key: luckyNumber
          value: {{ random `type:number` `min:10000` `max:99999` }}
      networks:
        - assignment: auto
          primary: true
          capabilities: []
      readyCondition:
          "ip":
          "guestinfo.solution.key.public":
      timeoutMinutes: 50
```

Use realized element property into another element
```yaml
  - name: "my-role"
    type: "role"
    spec:
      name: "My Role"
      description: "Used for administrative purposes"
      global: false
      systemScope: true
      rights:
        - "urn:vcloud:type:vmware:<RDE Type>:full_access"
        - "urn:vcloud:type:vmware:<RDE Type>:view"
        - "urn:vcloud:type:vmware:<RDE Type>:modify"

  - name: "my-account"
    type: "user"
    spec: 
      username: "myaccount"
      fullName: "My Service Account"
      email: "my@account.local"
      description: "My account to perform operations in vCD."
      roleName: "{{ property `my-role.name` }}"
      systemScope: true
```


# What is Next?
Continue exploring the Cloud Director Extension SDK

* [Setting up the Development Environment](setup.md)
* [Building a Simple Solution Add-On](playground.md)
* [Understanding the Solution Add-On Lifecycle](lifecycle.md)
* [Understanding the Solution Add-On Behavior](behavior.md)

Explore the Cloud Director Extensibility Platform

* [Extensibility Platfrom](extensibility-platform.md)
