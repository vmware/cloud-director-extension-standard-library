# Solution Multi-Instance Add-On Skeleton

The Multi-Instance Add-On is designed to be installed multiple times, creating a copy of all its elements for each instance. To ensure uniqueness between instances, vendors must guarantee unique specifications for elements, which can be achieved using template expressions in the manifest.yaml file.

Each add-on instance is identified by a unique name, providing the necessary level of uniqueness, as per the SDK.

Additionally, the Multi-Instance Add-On feature allows vendors to design their solutions for better scalability, availability, partitioning, and performance. By encapsulating the minimal unit of business into a solution add-on instance, providers can gain flexibility while designing their offerings. They can mix and match various add-on instances to fit their scopes of business, offering a more tailored and versatile solution.

Examples of scopes of business include:

- Spanning across multiple tenants
- Being bound to a single tenant
- Being managed by a single tenant
- Being bound to a cluster
- Spanning across multiple clusters
- Being bound to a single storage profile
- Spanning across multiple storage profiles
- Being bound to an LDAP group
- And more.

The Skeleton and most add-ons capture user input through UI Plugin and REST or MQTT APIs, creating Runtime Defined Entities. These entities are later processed by a backend service hosted on a virtual appliance within a Solution Landing Zone. Implementing this flow requires a proper bundle with a set of management rights for the created Runtime Defined Entities, a role that includes these rights, and a Cloud Director local account assigned with the role to interact with the backend virtual appliance.

## Skeleton Add-On Manifest

The add-on defines three input fields which provider could use to tailor the instance creation.
```yaml
inputs:
  - name: provider-business-scope-property
    title: Business Scope
    required: true
    description: Define the business and operational scopes of the add-on instance
    minLength: 2
    maxLength: 24
  - name: password
    # Secure property 
    title: Password
    required: true
    description: The password for the new local Cloud Director account to be created and linked to a business scope.
    secure: true
    minLength: 8
    maxLength: 16
  - name: justification
    # Property visible only on delete operation
    title: Justification
    type: String
    description: Why delete this Solution instance?
    delete: true
    minLength: 5
    maxLength: 256
```

The add-on indicates support for multiple instances.
```yaml
policies:
  supportsMultipleInstances: true
```

**Important:** In the context of the multi-instance add-on, only immutable elements are eligible for sharing across instances, as they are inherently singletons (e.g., UI Plugin, Runtime Defined Entity). When installing the first add-on instance, these elements will be created, and they will be automatically removed with the last instance's removal.

The add-on includes `PreCreate` and `PostDelete` actions that execute just before the first element is created during installation and after the last element is deleted during the add-on delete operation. These actions are implemented using a switch inside the binary `actions/multipurposeaction`, which determines whether it is called for the install or delete operation. Vendors can choose to use either multiple binaries or a single one with a switch, depending on their preference.

```yaml
triggers:
  - event: PreCreate
    action: actions/multipurposeaction
    timeout: 30
  - event: PostDelete
    action: actions/multipurposeaction
    timeout: 30
```

The `multipurposeaction` is written in Go Lang, but actions can be implemented in any language as long as they adhere to the actions specification and their build provides binaries for the three major operating systems.
```shell
actions/multipurposeaction/dist/windows.exe
actions/multipurposeaction/dist/linux
actions/multipurposeaction/dist/darwin
```

The `multipurposeaction` accepts the add-on execution context properties into its `standard input` and outputs properties into its `standard output` following the log line format `output:{"name": "<key>", "value": "value", "secure: true|false}`

Example of [Standard Input Stream of Multi-Purpose Action](index.md#standard-input-stream-of-multi-purpose-action)

```go
// This is the body of the multipurpose action. 
// It will be called multiple times for various places where it is referenced in the manifest.yaml#triggers and manifest.yaml#element#triggers.
// The multipurpose action pattern is used for convenience, source code size reduction, and improved usability.
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

UI Plugins immutable elements are automatically deployed with the installation of the first add-on instance and removed when the last instance is deleted. They are shared across all instances.

The `ui-plugin` is stored under the `ui` add-on project folder and, upon installation, is published by default only to the provider under the default tenant.

```yaml
elements:
  - name: ui
    description: User interface
    type: ui-plugin
    spec:
      publish:
        provider: true
```

Similar to UI Plugins, Runtime Defined Entities are shared across all add-on instances and follow the same installation and deletion rules.

The `defined-entity` is stored under the `db-schema` add-on project folder and, upon installation, it will create a Runtime Defined Interface, Runtime Defined Entity, and Behavior of type built-in Function as a Service.

```yaml
elements:
  - name: db-schemas
    description: Business Objects Schemas
    type: defined-entity
```

When a Runtime Defined Entity is created, the Cloud Director implicitly creates a set of management rights for that entity type following the following naming convention.
```yaml
- urn:vcloud:type:vmware:skeleton_database_entity
- urn:vcloud:type:vmware:skeleton_database_entity:admin
```

These rights are often bundled into a right bundle and can be included in multiple roles or published as global rights to one or many tenants.

This right bundle will be published only in the organization linked with the Solution Landing Zone.
```yaml
elements:
  - name: rights
    # Mutable element, it needs to define a unique specification for each add-on instance
    description: Business objects rights
    type: rights-bundle
    spec:
      name: 'Skeleton-{{ instance `name` }}'
      description: This rights bundle is created by Skeleton Add-On
      publish:
        solutionLandingZone: true
      rights:
        - urn:vcloud:type:vmware:skeleton_database_entity
        - urn:vcloud:type:vmware:skeleton_database_entity:admin
```

The rights can also be directly assigned to a role. This role will be available within the organization associated with the Solution Landing Zone.
```yaml
elements:
  - name: role
    # Mutable element, it needs to define a unique specification for each add-on instance
    description: Business objects role
    type: role
    spec:
      name: 'Skeleton-{{ instance `name` }}'
      description: This role is created by Skeleton Add-On
      global: false
      systemScope: false
      publish: 
        solutionLandingZone: true
      rights:
        - urn:vcloud:type:vmware:skeleton_database_entity
        - urn:vcloud:type:vmware:skeleton_database_entity:admin
```

Each Skeleton add-on instance creates a local Cloud Director user with the newly created role. It utilizes a `PostCreate` action to generate an API Token for the newly created user.
```yaml
elements:
  - name: cloud-director-user
    # Mutable element, it needs to define a unique specification for each add-on instance
    description: User interacting with Cloud Director from backend
    type: user
    spec:
      username: 'sva.{{ property `provider-business-scope-property` }}'
      password: '{{ property `password` }}'
      fullName: Skeleton backend system account
      description: 'User sva.{{ property `provider-business-scope-property` }} with role {{ property `role.name` }}'
      roleName: '{{ property `role.name` }}'
      systemScope: false
    triggers:
      - event: PostCreate
        # This action will output property "api-token" under the element
        action: actions/multipurposeaction
        timeout: 30
```

The API Token, along with the Cloud Director host and its endpoint certificates, will be passed as OVF properties to an instance of the backend virtual appliance. 
The appliance will then utilize this configuration to read and process the objects stored in the Runtime Defined Entities.

```yaml
elements:
  - name: 'backend-appliance'
    # Mutable element, it needs to define a unique specification for each add-on instance
    description: Backend processor of business objects
    type: vapp
    spec:
      # When the 'name' property is skipped for vApps, the SDK will generate a unique name
      ovfProperties:
        - key: provider-business-scope-property
          value: '{{ property `provider-business-scope-property` }}'
        - key: cloud-director-host
          value: '{{ vcd `host` }}'
        - key: cloud-director-host-certificates
          value: '{{ vcd `certificates` }}'
        - key: api-token
          value: '{{ property `api-token` }}'
      hardwareCustomization:
        numberOfCpus: 1
        memorySize: 512
      networks:
        - primary: true
          capabilities: []
      readyCondition:
        # The "Ready" condition waits for listed properties to have any value, or a specific value if defined.
        # A property can be the "ip" of the virtual machine or any of the available ExtraConfig properties.
        #
        # Example: Waiting for the virtual machine to be assigned an IP address
        # "ip":
        #
        # Note: This is a dummy vApp and will not allocate any IP.
      timeoutMinutes: 10
```

> **Note**
The appliance is essentially an OVF descriptor without an actual operating system. Its purpose is to demonstrate the end-to-end flow.


## Skeleton ISO
The preferred method for installing and removing an instance of the Skeleton add-on is through the Cloud Director UI. However, it can also be accomplished using the following commands via the CLI.

**Important!** The `--encryption-key` argument is primarily intended for development purposes. When set, it instructs the add-on operation to be executed on the machine where the ISO is mounted. If skipped, the operation will be sent to an agent in the Solution Landing Zone, and all activities will be performed within Cloud Director.

```shell
# Inject Skeleton add-on vendor certificate into the Cloud Director certificate store.
./darwin.run trust \
  --host <CLOUD_DIRECTOR_HOST> \
  --username administrator \
  --password 'secret' \
  --certificate "$(./darwin.run get certificate --host <CLOUD_DIRECTOR_HOST>)"

# Create an instance of the Skeleton add-on.
./darwin.run create instance \
  --certificate "$(./darwin.run get certificate --host <CLOUD_DIRECTOR_HOST>)" \
  --host <CLOUD_DIRECTOR_HOST> \
  --username administrator \
  --password 'secret' \
  --trace \
  --name prjpoc01 \
  --input-provider-business-scope-property prjpoc01 \
  --input-password 'We1$0me'

# Delete the created instance of the Skeleton add-on
./darwin.run delete instance \
  --certificate "$(./darwin.run get certificate --host <CLOUD_DIRECTOR_HOST>)" \
  --host <CLOUD_DIRECTOR_HOST> \
  --username administrator \
  --password 'secret' \
  --trace \
  --name prjpoc01 \
  --input-justification "cleanup by developer"

# Completely delete the Skeleton add-on and its cache
./darwin.run delete solution \
  --certificate "$(./darwin.run get certificate --host <CLOUD_DIRECTOR_HOST>)" \
  --host <CLOUD_DIRECTOR_HOST> \
  --username administrator \
  --password 'secret' \
  --accept \
  --trace
```


## Appendix
### Standard Input Stream of Multi-Purpose Action
```json
{
    "cloudDirector": {
        "accessToken": "eyJh...",
        "apiVersion": "38.0",
        "certificates": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
        "host": "cloud.director.local",
        "port": 443,
        "productVersion": "10.5.0.XXX",
        "session": {
            "org": {
                "id": "urn:vcloud:org:XXX",
                "name": "System"
            },
            "role": {
                "id": "urn:vcloud:role:XXX",
                "name": "System Administrator"
            },
            "user": {
                "id": "urn:vcloud:user:XXX",
                "name": "administrator"
            }
        },
        "thumbprint": "F9:28:...:77"
    },
    "dataCenter": {
        "capabilities": [],
        "computePolicies": [],
        "id": "urn:vcloud:vdc:xxx",
        "isDefault": true,
        "name": "OrgVdc...",
        "networkManagerId": "",
        "networks": [
            {
                "capabilities": [],
                "id": "urn:vcloud:network:XXX",
                "isDefault": true,
                "name": "OrgVdcNetwork..."
            }
        ],
        "storagePolicies": [
            {
                "capabilities": [],
                "id": "urn:vcloud:vdcstorageProfile:XXX",
                "isDefault": true,
                "name": "*"
            }
        ]
    },
    "element": "cloud-director-user",
    "event": "PostCreate",
    "execution": {
        "invocationId": "",
        "owner": "",
        "taskId": ""
    },
    "logging": {
        "debug": true,
        "format": "text",
        "trace": true
    },
    "manifest": {
        "capabilities": [],
        "description": "This solution add-on skeleton represents a typical multi-instance solution.",
        "elements": [
            {
                "description": "User interface",
                "name": "ui",
                "spec": {
                    "publish": {
                        "provider": true
                    }
                },
                "triggers": null,
                "type": "ui-plugin"
            },
            {
                "description": "Business Objects Schemas",
                "name": "db-schemas",
                "spec": null,
                "triggers": null,
                "type": "defined-entity"
            },
            {
                "description": "Business objects rights",
                "name": "rights",
                "spec": {
                    "description": "This rights bundle is created by Skeleton Add-On",
                    "name": "Skeleton-{{ instance `name` }}",
                    "publish": {
                        "solutionLandingZone": true
                    },
                    "rights": [
                        "urn:vcloud:type:vmware:skeleton_database_entity",
                        "urn:vcloud:type:vmware:skeleton_database_entity:admin"
                    ]
                },
                "triggers": null,
                "type": "rights-bundle"
            },
            {
                "description": "Business objects role",
                "name": "role",
                "spec": {
                    "description": "This role is created by Skeleton Add-On",
                    "global": false,
                    "name": "Skeleton-{{ instance `name` }}",
                    "publish": {
                        "solutionLandingZone": true
                    },
                    "rights": [
                        "urn:vcloud:type:vmware:skeleton_database_entity",
                        "urn:vcloud:type:vmware:skeleton_database_entity:admin"
                    ],
                    "systemScope": false
                },
                "triggers": null,
                "type": "role"
            },
            {
                "description": "User interacting with Cloud Director from backend",
                "name": "cloud-director-user",
                "spec": {
                    "description": "User sva.{{ property `provider-business-scope-property` }} with role {{ property `role.name` }}",
                    "fullName": "Skeleton backend system account",
                    "password": "{{ property `password` }}",
                    "roleName": "{{ property `role.name` }}",
                    "systemScope": false,
                    "username": "sva.{{ property `provider-business-scope-property` }}"
                },
                "triggers": [
                    {
                        "action": "actions/multipurposeaction",
                        "event": "PostCreate",
                        "timeout": 30
                    }
                ],
                "type": "user"
            },
            {
                "description": "Backend processor of business objects",
                "name": "backend-appliance",
                "spec": {
                    "hardwareCustomization": {
                        "memorySize": 512,
                        "numberOfCpus": 1
                    },
                    "networks": [
                        {
                            "capabilities": [],
                            "primary": true
                        }
                    ],
                    "ovfProperties": [
                        {
                            "key": "provider-business-scope-property",
                            "value": "{{ property `provider-business-scope-property` }}"
                        },
                        {
                            "key": "cloud-director-host",
                            "value": "{{ vcd `host` }}"
                        },
                        {
                            "key": "cloud-director-host-certificates",
                            "value": "{{ vcd `certificates` }}"
                        },
                        {
                            "key": "api-token",
                            "value": "{{ property `api-token` }}"
                        }
                    ],
                    "readyCondition": null,
                    "timeoutMinutes": 10
                },
                "triggers": null,
                "type": "vapp"
            }
        ],
        "friendlyName": "Skeleton Started",
        "inputs": [
            {
                "default": null,
                "delete": false,
                "description": "This is some Business Scope Property required for every add-on instance",
                "isArray": false,
                "maxLength": 24,
                "maxValue": null,
                "minLength": 2,
                "minValue": null,
                "name": "provider-business-scope-property",
                "required": true,
                "secure": false,
                "shared": false,
                "title": "Some Business Scope Property",
                "type": "String",
                "validation": "",
                "values": null,
                "view": ""
            },
            {
                "default": null,
                "delete": false,
                "description": "The password of the new local Cloud Director account about to be created and associated with a business scope",
                "isArray": false,
                "maxLength": 16,
                "maxValue": null,
                "minLength": 8,
                "minValue": null,
                "name": "password",
                "required": true,
                "secure": true,
                "shared": false,
                "title": "Password",
                "type": "String",
                "validation": "",
                "values": null,
                "view": ""
            },
            {
                "default": null,
                "delete": true,
                "description": "Why do you delete this Solution instance",
                "isArray": false,
                "maxLength": 256,
                "maxValue": null,
                "minLength": 5,
                "minValue": null,
                "name": "justification",
                "required": false,
                "secure": false,
                "shared": false,
                "title": "Justification",
                "type": "String",
                "validation": "",
                "values": null,
                "view": ""
            }
        ],
        "metadata": {},
        "name": "skeleton",
        "operations": [],
        "policies": {
            "supportsMultipleInstances": true,
            "tenantScoped": false,
            "upgradesFrom": ""
        },
        "resources": [],
        "runtime": {
            "sdkVersion": ""
        },
        "tags": [],
        "triggers": [
            {
                "action": "actions/multipurposeaction",
                "event": "PreCreate",
                "timeout": 30
            },
            {
                "action": "actions/multipurposeaction",
                "event": "PostDelete",
                "timeout": 30
            }
        ],
        "vcdVersion": "10.4.1",
        "vendor": "vmware",
        "version": "1.0.0"
    },
    "operation": "CREATE",
    "organization": {
        "href": "",
        "id": "urn:vcloud:org:XXX",
        "name": "Organization...",
        "type": ""
    },
    "properties": {
        "cloud-director-user.password": "secret...",
        "cloud-director-user.username": "sva.skeleton01",
        "exampleKeyArrayAny": [
            1,
            "v",
            true,
            {
                "k": true
            }
        ],
        "exampleKeyMap": {
            "k1": "v1",
            "k2": "v2"
        },
        "password": "secret...",
        "provider-business-scope-property": "skeleton01",
        "rights.name": "Skeleton-skeleton01",
        "role.name": "Skeleton-skeleton01"
    },
    "runtime": {
        "sdkVersion": "1.1.0.7077883",
        "goVersion": "go1.20.5",
        "vcdVersion": "10.5.0.22007244",
        "environment": "Development"
    },
    "transaction": {}
}
```