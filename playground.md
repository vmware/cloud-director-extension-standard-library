# Building a Simple Solution Add-On
This section demonstrates how to build a multi-instance solution add-on including some of the most frequently used elements and actions associated with them.

## Upstream Prerequisites
Please verify the following prerequisites are met.
- [Setting up the Development Environment](setup.md)
- GitHub public repositories are accessible

## Cloud Director Extension Standard Library
The `vcd-ext-shell` allow vendors to use starter templates for creating solution add-ons and add-on elements. The source of the available templates is located into [Cloud Director Extension Standard Library](https://github.com/vmware/cloud-director-extension-standard-library) Git repository.

### Cloud Director Extension Standard Library Layout
Every branch of the repository contains two folders at the root level - `add-on` containing a solution add-on template per folder named after a use case, and `element` following the same pattern but for the add-on building blocks, the `element types`.

Both `add-on` and `element/<element type>` might contain folders starting with `.`, these folders contain helper tools for building, testing and documenting an add-on or its elements.

Filesystem Layout
```shell
<branch>
- add-on/<use case>
- add-on/.<add-on centric toolchain>
- element/<element type>/<use case>
- element/<element type>/.<element centric toolchain>
```

The templates and tools are further organized by branches. The names of the branches follow `cloud-director-X.X.X` pattern and claim that all add-ons and elements templates in that branch has been validated against an environment running Cloud Director version `X.X.X`. The `main` branch contains alpha versions of the add-ons and elements for the next upcoming release.

**IMPORTANT**: When a vendor used starter template from `cloud-director-X.X.X` to bootstrap his add-on with minimal version of Cloud Director `X.X.X` and receive complain from a provider running later version of Cloud Director `X.Y.Z`, the one can review directly the fix made by VMware or its partner applied on the started template by comparing the branches `cloud-director-X.X.X` with `cloud-director-X.Y.Z`, and find out what was the exact line causing the issue.

```shell
main
cloud-director-10.4.1
...
cloud-director-10.5
```

## Create and Test Solution Add-On from Template in 1 minute
Let's create a new solution add-on based on the `Skeleton` template.
```shell
$ vcd-ext-shell
no solution |> solution new --vendor <vendor name> --name skeleton --version 1.0.0 --vcd-version 10.4.1 --from-template cloud-director-10.4.1/multi-instance-skeleton --folder <project directory>
```

**NOTE**: The `--folder` is optional and defaults to the current working directory.

And build its elements and actions sources into installable artifacts.
```shell
skeleton |> solution build
```

Then create a solution add-on instance of `Skeleton` into your `active` cloud director environment (set via `vcd-ext-shell` / `setup`).
```shell
skeleton |> solution run create-instance --name prjpoc01 --input-provider-business-scope-property prjpoc01 --input-password We1$0me --debug
```

Explore the installation process and review the elements created in Cloud Director.
```shell
skeleton |> solution run get-instances --debug
```

```shell
DEBUG Authenticating with Cloud Director using username and password
DEBUG Looking for Solutions Add-On Instance type
DEBUG Found existing Solutions Add-On Instance type  version=1.0.0
 NAME      READY  STATUS  SCOPE   RESOURCES
--------------------------------------------
 prjpoc01  6/6    Ready   tenant          7
```

Finally, delete the instance.
```shell
skeleton |> solution run delete-instance --name prjpoc01 --input-justification "cleanup by developer" --debug
```

## Solution Add-On Skeleton Explained

Multi-instance add-on feature allow vendors to design their solutions for better scalability, availability, partitioning and performance by encapsulating their minimal unit of business into a solution add-on instance. With such level of granularity providers could gain certain flexibility while designing their offerings by mixing and matching various add-ons instances to fit their scopes of business.

Examples of scopes of business:
- span across multiple tenants
- bound to a single tenant
- managed by single tenant
- bound to a cluster
- span across multiple clusters
- bound to a single storage profile
- span across multiple storage profiles
- bond to LDAP group
- etc.

The Skeleton and most of the add-ons capture user input via UI Plugin and REST or MQTT APIs into a Runtime Defined Entities which later are processed by a backend service hosted on a virtual appliance under a Solution Landing Zone. The implementation of such flow further requires a right bundle with set of management rights for the created Runtime Defined Entities, a role including these rights and a Cloud Director local account assigned with the role, used back the backend virtual appliance.

### Skeleton Add-On Manifest

The add-on defines three input fields which provider could use to tailor the instance creation.
```yaml
inputs:
  - name: provider-business-scope-property
    title: Some Business Scope Property
    required: true
    description: This is some Business Scope Property required for every add-on instance

    # Secure property 
  - name: password
    title: Password
    required: true
    description: The password of the new local Cloud Director account about to be created and associated with a business scope
    secure: true

    # Property visible only on delete operation
  - name: justification
    title: Justification
    type: String
    description: Why do you delete this Solution instance
    delete: true
```

The add-on defines that it supports multiple instances.
```yaml
policies:
  supportsMultipleInstances: true
```

**NOTE**: When `supportsMultipleInstances` is set to `true` every element part of the add-on will be provisioned only once and its resource will be shared between all add-on instances. This behavior could be changed via  elements.<element>.policies.

Add-on defines `PreCreate`, `PostDelete` and `PreScope` triggers which will be executed just before the first element is created during installation, after the last element is deleted on add-on delete operation and whenever a scope is changed. This implementation of triggers uses a switch inside the binary `actions/multipurposeaction` to decide whether it is called for install or for delete operation. It is up to the vendor to decide whether to use multiple binaries or single one with switch.

```yaml
triggers:
  - event: PreCreate
    action: actions/multipurposeaction
    timeout: 30
  - event: PostDelete
    action: actions/multipurposeaction
    timeout: 30
  - event: PreScope
    action: actions/multipurposeaction
    timeout: 30
```

The `multipurposeaction` is written in GoLang but triggers can be implemented on any language as long as their build provides binaries for the three major operating systems used for development.
```shell
actions/multipurposeaction/dist/windows.exe
actions/multipurposeaction/dist/linux
actions/multipurposeaction/dist/darwin
```

The `multipurposeaction` accepts the add-on execution context properties into its `standard input` and outputs properties into its `standard output` following the log line format `output:{"name": "<key>", "value": "value", "secure: true|false}`

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

UI Plugins are always deployed with the first add-on instance installation and removed with the last removed instance. They are shared between all instances. This `ui-plugin` holds its sources under `ui` add-on project folder and when installed will be published by default only to the provider under the default tenant but will allow later to be published to other tenants.

```yaml
elements:
  - name: ui
    description: User interface
    type: ui-plugin
    spec:
      publish:
        provider: true
        tenants: true
```

Similar to UI Plugins the Runtime Defined Entities are shared between all add-on instances and follow the same installation and deletion rules.
This `defined-entity` holds its sources under `db-schema` add-on project folder and when installed will create a Runtime Defined Interface, Runtime Defined Entity and Behavior of type built-in Function as a Service.

```yaml
elements:
  - name: db-schemas
    description: Business Objects Schemas
    type: defined-entity
```

When a Runtime Defined Entity is created the Cloud Director implicitly creates set of management rights for that entity type with the following naming convection.
```shell
- urn:vcloud:type:<entity vendor>:<entity nss>:full_access
- urn:vcloud:type:<entity vendor>:<entity nss>:view
- urn:vcloud:type:<entity vendor>:<entity nss>:modify
- urn:vcloud:type:<entity vendor>:<entity nss>:admin
```

These rights frequently are bundled in to a right bundle and can be included into multiple roles or published into one or many tenants as global rights. This right bundle will be published only in the organization linked with the Solution Landing Zone. By convention the key of this organization is constant `solution`.
```yaml
elements:
  - name: rights
    description: Business objects rights
    type: rights-bundle
    spec:
      name: Skeleton Rights
      description: This rights bundle is created by Skeleton Add-On
      publish:
        solutionLandingZone: true
        tenants: true
      rights:
        - urn:vcloud:type:vmware:skeleton_database_element:full_access
        - urn:vcloud:type:vmware:skeleton_database_element:view
        - urn:vcloud:type:vmware:skeleton_database_element:modify
        - urn:vcloud:type:vmware:skeleton_database_element:admin
```

The rights can also be assigned directly to a role. This role will not be available neither to the global nor default(system) tenant scopes.
```yaml
elements:
  - name: role
    description: Business objects role
    type: role
    spec:
      name: Skeleton Role
      description: This role is created by Skeleton Add-On
      global: false
      systemScope: false
      publish: 
        solutionLandingZone: true
      rights:
        - urn:vcloud:type:vmware:skeleton_database_element:full_access
        - urn:vcloud:type:vmware:skeleton_database_element:view
        - urn:vcloud:type:vmware:skeleton_database_element:modify
        - urn:vcloud:type:vmware:skeleton_database_element:admin
```

The role will be available only in the tenant referenced by the Solution Landing Zone. Each Skeleton add-on instance creates a local Cloud Director user with the newly defined role and uses a `PostCreate` trigger to generate an API Token.
```yaml
elements:
  - name: cloud-director-user
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

The API Token will be passed as OVF property alongside with the Cloud Director host and its endpoint certificates to an instance of the backend virtual appliance. The appliance will use the configuration to read and process the objects stored into the Runtime Defined Entities.

```yaml
elements:
  - name: backend-appliance
    description: Backend processor of business objects
    type: vapp
    spec:
      name: '{{ instance `name` }}'
      ovfProperties:
        - key: provider-business-scope-property
          value: '{{ property `provider-business-scope-property` }}'
        - key: cloud-director-host
          value: '{{ property `cloudDirector.host` }}'
        - key: cloud-director-host-certificates
          value: '{{ property `cloudDirector.certificates` }}'
        - key: api-token
          value: '{{ property `api-token` }}'
      hardwareCustomization:
        numberOfCpus: 1
        memorySize: 512
      networks:
        - assignment: auto
          primary: true
          capabilities: []
      readyCondition:
      # Wait for IP to be allocated.
      # Note the example vApp does not contain real operating systems.
      # It will be able to allocate IP only from static pool not DHCP.
      #
      # "ip":
      timeoutMinutes: 10
```

**NOTE**: The appliance is just OVF descriptor without actual operating system. It aims to showcase the end-to-end flow.

Operations are a means of carrying out day-2 actions on the add-on at a later point in time. Since operations always invoke actions, the actions will receive the latest context for the add-on. An example is changing the domain name or certificate of Cloud Director, which can be addressed by a refresh action that calls the 'actions/multipurposeaction' skeleton to update the appliance with the new Cloud Director endpoint details.

```yaml
operations:
  - name: refresh
    description: Refresh Cloud Director endpoint and certificate
    inputs:
      - name: justification
        title: Justification
        required: true
        description: Justification to refresh the add-on instance
        minLength: 1
        maxLength: 24
    action: actions/multipurposeaction
    timeout: 60
```


## Skeleton ISO
An instance of Skeleton add-on can be installed and removed with the following commands.

**IMPORTANT**: The `--encryption-key` argument is used mainly for development purposes. If set it will instruct the add-on operation to be executed on the machine where the ISO binary was executed. If skipped that operation will be sent to an agent in the Solution Landing Zone and all activities will be performed in the Cloud Director.

```shell
# Inject Skeleton add-on vendor certificate in Cloud Director certificate store
./darwin.run trust \
  --accept \
  --host <CLOUD_DIRECTOR_HOST> \
  --username administrator \
  --password 'secret' \
  --certificate "$(./darwin.run get certificate --host <CLOUD_DIRECTOR_HOST>)"

# Create an instance of Skeleton add-on
./darwin.run create instance \
  --accept \
  --certificate "$(./darwin.run get certificate --host <CLOUD_DIRECTOR_HOST>)" \
  --host <CLOUD_DIRECTOR_HOST> \
  --username administrator \
  --password 'secret' \
  --trace \
  --name prjpoc01 \
  --input-provider-business-scope-property prjpoc01 \
  --input-password 'We1$0me'

# Invoke an Skeleton add-on instance operation
./darwin.run invoke refresh instance \
  --accept \
  --certificate "$(./darwin.run get certificate --host <CLOUD_DIRECTOR_HOST>)" \
  --host <CLOUD_DIRECTOR_HOST> \
  --username administrator \
  --password 'secret' \
  --trace \
  --name prjpoc01 \
  --input-justification "Certificate renew"

# Delete the created instance of Skeleton add-on
./darwin.run delete instance \
  --accept \
  --certificate "$(./darwin.run get certificate --host <CLOUD_DIRECTOR_HOST>)" \
  --host <CLOUD_DIRECTOR_HOST> \
  --username administrator \
  --password 'secret' \
  --trace \
  --name prjpoc01 \
  --input-justification "cleanup by developer"

# Delete the completely the Skeleton add-on and its cache
./darwin.run delete solution \
  --accept \
  --certificate "$(./darwin.run get certificate --host <CLOUD_DIRECTOR_HOST>)" \
  --host <CLOUD_DIRECTOR_HOST> \
  --username administrator \
  --password 'secret' \
  --trace
```

# What is Next?
* [Understanding the Solution Add-On Lifecycle](lifecycle.md)
* [Understanding the Solution Add-On Behavior](behavior.md)
* [Exploring Solution Add-On Elements](elements.md)
* [Read the Service Provider Admin Guide for Solution Add-Ons](https://docs.vmware.com/en/VMware-Cloud-Director/10.4/VMware-Cloud-Director-Service-Provider-Admin-Portal-Guide/GUID-4F12C8F7-7CD3-44E8-9711-A5F43F8DCEB5.html)
