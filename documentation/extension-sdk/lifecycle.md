# Understanding the Solution Add-On Lifecycle
This section is aimed at solution add-on vendor role and assumes the vendor is about to onboard an existing solution as an add-on, or create new with already identified requirements.

## Foundation
A solution add-on is composed of one or more elements, which are supported by the VMware Cloud Director Extension SDK.
Add-ons can be either single-instance or multi-instance, depending on the vendor implementation.

### Single-Instance Add-Ons
An add-on is considered single-instance when its specification does not allow the creation of more than one instance for all of its compound elements.
This is the default behavior for every add-on, unless the add-on manifest explicitly defines a policy that allows multiple instances.
Single-instance add-ons are restricted to remain single instances across all versions, unless the vendor decides to modify the policy.
Single-instance add-ons are frequently used to automate the management of UI plugins, Runtime Defined Entities, roles, users, or configurations.

### Multi-Instance Add-Ons
An add-on is considered multi-instance if its manifest defines a policy that allows the creation of multiple instances of its compound elements.
Depending on the element type, a multi-instance add-on element can be either mutable or immutable.

**Immutable** elements are created with the first add-on instance and destroyed with the last add-on instance. Intermediate instances will simply reference the existing element resource(s).
If the element resources are already available in the system before the creation of the first instance, they will be referenced as external resources, and removing the last instance will not delete them.

**Mutable** elements are created with every add-on instance, and their lifecycle is tightly bound to the add-on itself.
If the element resources are already available in the environment before creating an add-on instance, created by other means, the operation will fail.

**Important**: The multi-instance strategy needs to be carefully planned due to the following implicit limitations:
- Every mutable element must be unique to its instance, so its name has to be computed for each add-on instance.
- Some elements inherit constraints from their resource type defined by the VMware Cloud Director entity. This requires computing at least one of the element configuration properties.
- A good strategy is to split complex add-ons into two parts, where one is a single-instance add-on that contains all shared elements, and the other is a multi-instance add-on responsible for scaling or load balancing elements.

### Add-On Element Identity
In the add-on manifest, an element is identified by its type and name. The element name plays a significant role in the multi-instance scenario.
When an element name is set as a constant in the add-on manifest, it defines the element as a shared component between instances, regardless of its mutations.
Binding an element instance to an add-on instance requires the element name to be unique for every instance of the add-on.
This behavior can be easily achieved using the manifest template engine in combination with a unique instance name and one of the random generators.

### Add-On Instance Create
Creation is permitted for Multi-Instance Add-Ons and Single-Instance Add-Ons when no instances exist. 
If there is an instance from a Single-Instance Add-On, the creation of a new instance is prohibited until the existing instance is deleted. 
If there is an instance from a Multi-Instance Add-On, the creation of new instances is allowed from Multi-Instance Add-Ons.

### Add-On Upgrade Strategy
The upgrade strategy is applied to add-on elements rather than the add-on itself. The SDK defines several upgrade strategies as follows:

**In-place Upgrade**: This strategy is triggered when a new version of the add-on contains a **mutable** element with the same type and name but different configuration.
The SDK detects configuration drift and triggers a sequence of steps to apply the new configuration to the resources associated with the element from its current version.
During the in-place upgrade of an element, the SDK fires `pre-upgrade` and `post-upgrade` events, which trigger associated custom actions to refine the upgrade process.

**Recreate Upgrade**: This strategy is triggered when a new version of the add-on contains an **immutable** element with the same type and name but different configuration.
This upgrade strategy creates a new instance of the element with the first upgrade or the first installation of the version.
During the recreation of an element, the SDK fires `pre-create` and `post-create` events, triggering associated custom actions to refine the upgrade process.
The old version of the element remains until the last add-on instance from the old version is upgraded or removed. Then, the SDK fires `pre-remove

` and `post-remove` events, triggering associated custom actions.

**Create Upgrade**: This strategy is triggered when a new version of the add-on introduces a new element.
During the creation of an element, the SDK fires `pre-create` and `post-create` events, triggering associated custom actions.
The element is created based on its type mutation rules.

**Remove Upgrade**: This strategy is triggered when a new version of the add-on does not contain an element available in the previous version.
The old version of the element remains until the last add-on instance is upgraded or removed. Then, the SDK fires `pre-remove` and `post-remove` events, triggering associated custom actions.

**Note**:
- Regardless of the upgrade strategy, the new version of the add-on may also add or remove input elements.
- The SDK does not support definition drift between versions for add-on input fields.
- The add-on upgrade operation cannot change or set values for add-on inputs defined by the previous version.
- Only the additional inputs defined in the new add-on version can have their values set as part of the upgrade operation.

**Upgrading between Single-Instance and Multi-Instance Add-Ons**:
Upgrading between Single-Instance and Multi-Instance Add-Ons is possible only when there's just one instance across all versions. 
Otherwise, you must reduce instances to one before proceeding with the upgrade.

## Design
Building a high-quality solution add-on involves addressing the following questionnaire:
- What is the instance type of the add-on (multi-instance or single-instance)?
  - What unique elements are specific to each instance?
  - What elements are shared between instances?
- What is the upgrade strategy for add-on instances?
  - In-place upgrade of elements
  - Element recreation
  - Creation of new elements
  - Removal of existing elements
- What is the onboarding strategy for brownfield environments?
  - Replacement
  - Linking
- What is the deletion strategy for an add-on instance?
  - Remove add-on elements only, or remove all objects created by the solution's business logic?
- What kind of infrastructure resources are required to host the add-on instance backend?
- What kind of network access will the add-on instance require?
- What elements are part of the add-on (UI, API, Database, Users, Roles, Rights, Appliances, etc.)?
- What are the brownfield elements?

Providing answers to these questions will assist in selecting the appropriate SDK building blocks to effectively develop your add-on.

## Implement

**NOTE**: All sections bellow assume your are using Linux OS for development environment. [[Alternatives]](https://packages.vmware.com/vcd-ext/)

Once the design decisions are made they can be incorporated by the construction.

A solution add-on consists of a *Manifest* (`manifest.yaml`) describing the vendor, minimal VMware Cloud Director version to run this add-on, the elements implementing its business logic.
Each element further contains details about the location of its source code and configuration.

Solutions add-ons are created, built, tested and packaged with `vcd-ext-shell`. Creating a new add-on can be achieved with the following command:
```shell
$ vcd-ext-shell
*no soluiton* |> solution new <TAB>
                              --name          Solution name                               
                              --vendor        Solution vendor                             
                              --version       Solution version                            
                              --vcd-version   VCD minimum compatible version              
                              --folder        Project folder (default is working folder) 
                              --from-template <template name>

*no soluiton* |> solution new --vendor corp --name skeleton --version 1.0.0 --vcd-version 10.4.1
```

The command is going to produce a bare minimal add-on configuration under `skeleton/manifest.yaml` required to build and package an add-on ISO.
```shell
# manifest.yaml
name: skeleton
vendor: corp
version: 1.0.0
vcdVersion: 10.4.1
friendlyName: ""
description: ""
policies:
    supportsMultipleInstances: false
tags: []
elements: []
```

Refer to [Exploring Solution Add-On Elements](elements.md) section for details about grooming the *Manifest*.

## Build
Building a solution add-on is the process of converting its elements source code files into standalone software artifact(s) that can be process by the add-on ISO installer.
The `vcd-ext-shell` requires these artifacts to be located under `<element>/dist` folder with a file extension recognized by the element type.

The `vcd-ext-shell` contains built-in logic for building elements' artifacts that define their build process as `<element>/Dockerfile` or `build.yaml` definition file compatible with the `docker buildx build` client.
Alternatively, the add-on vendor can create their own build process as long as the produced artifacts are stored in `<element>/dist` with the respected extension for their type.

In case a build of an add-on element depends on other elements' artifacts or an element build process involves multiple Dockerfiles you can leverage `build.yaml` to customize the build process.
The file consists of an array of Dockerfile definitions and their execution context. The definitions will be executed in a sequence.
`<element of type UI>/build.yaml` (this file is optional)
```yaml
# root context is set to the root of the add-on
- root: ../
  dockerfile: <element of type RDE>/Dockerfile
  output: <element of type RDE>/dist
# Once the RDE is built its schemas can be consumed by the UI plugin
# root context is set to the root of the add-on so the <element of type UI>/Dockerfile can access <element of type RDE>/dist
- root: ../
  dockerfile: <element of type UI>/Dockerfile
  output: <element of type UI>/dist
  ...
```

`<element of type UI>/Dockerfile`

```Dockerfile
# syntax=docker/dockerfile:1

FROM <repository>/node:12.16.3-slim as NODE
# Note the current folder of the NODE container points to <element>/
COPY ..<element of type UI> /usr/app
COPY ..<element of type RDE>/dist /usr/app/schemas
WORKDIR /usr/app
RUN npm ci
RUN npm run build

FROM scratch AS export
# Note the current folder of the export container points to <element>/dist 
COPY --from=NODE /usr/app/dist ./
```

```shell
# Building all add-on elements
skeleton |> solution build

# Building a specific add-on element
skeleton |> solution build target <element name>
```

## Package
The Solution Add-On bundle form factor is ISO in Universal Data Format. Creating this type of ISO can be achieved only via `vcd-ext-shell` by executing the `package` command.

By default, the `solution package` command will use the vendor `certificate` and `private key` previously configured by the `setup` command to sign the ISO. The `package` command requires a valid vendor PKI configuration.
Refer to the [Setup / Vendor](setup.md#vendor) section for details about configuring PKI with existing or self-signed generated issuer.

There is also an option for remote signing. With no-sign option `solution package --no-sign` the shell will output an `*.iso` without signature and `manifest.mf`. It is up to the vendor to sign this file and distribute it alongside with the ISO.

You can package for specific platform using `--platform` parameter. During packaging vcdext and  all executables defined as triggers will be filtered to the desired platform. Supported platforms are `linux,windows,darwin,darwin-arm64`.

**Important** VMware Cloud Director does not allow installation of ISOs without signature.

Before executing the package command make sure you have the required EULA.txt (for development it can be empty) in your solution folder. 

```shell
$ vcd-ext-shell
Welcome to VMware Cloud Director Solution Add-On CLI Version '1.0.0-<build number>'.

Use `<Tab>` or `<Ctl+Esc>` for help, navigation and autocompletion, try now!

It looks like the `<folder>` is not a valid Solution Add-On.
You can use 'solution open' command to set the context or 'solution new' command to create a new project.

*no solution* |> solution open --path ./skeleton
INFO[0005] Successfully set the context for 'skeleton'  
skeleton |> solution package
About to create `<folder>/skeleton/dist/corp-skeleton-1.0.0.iso`
including 'ceip.txt' ... 
including 'certificate.pem' ... 
including 'darwin-arm64.run' ... 
including 'darwin-arm64.run.vsig' ... 
including 'darwin.run' ... 
including 'darwin.run.vsig' ... 
including 'eula.txt' ... 
[OK] skeleton |> exit
```

When creating the add-on ISO the `vcd-ext-shell` will implicitly include the following files.
- Installation and operation binaries for Linux, Windows and Mac issued by VMware
- `manifest.yaml` the orchestration descriptor
- `manifest.mf` list of SHA256 hash sums for all files in the ISO except `manifest.mf` and `certificate.pem`
- Elements Artifacts issued by the vendor
- VMware certificate in PEM format (`vmware-certificate.pem`)
- VMware signatures `.vsig` of the operation binaries signed with the VMware certificate
- Vendor signatures and certificate in PEM format (`certificate.pem`)
- End-user license agreement
- VMware Customer Experience Improvement Program note

In case of remote signing the accepted `certificate.pem` by VMware Cloud Director follows the format:
```shell
SHA256(manifest.mf)= <Base64 encoded signature of the SHA256 of manifest.mf>
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
```


## Create Solution Instance
A solution add-on instance can be created by executing the following command.

```shell
my-solution |> solution run create-instance --name <solution instance name> [<arguments> ...]
```

**NOTE**: Prior execution of an instance commands `vcd-ext-shell` has to be setup with a VMware Cloud Director instance in active state. [[Setup]](setup.md#environment)

## Upgrade Solution Instance
A solution add-on instance can be upgraded by executing the following command using the ISO containing a higher version of the add-on:

```shell
my-solution |> solution run upgrade-instance --name <solution instance name> [<upgrade-additional-arguments> ...]
```

**NOTE**: The arguments used in the `create instance` command cannot be overwritten by the `upgrade instance` command. However, the `upgrade instance` command may have additional arguments that can be specified.

## Rollback Solution Instance
A solution  add-on  instance failed upgrade can be rollbacked by executing the following command using the ISO containing a higher version of the add-on:

```shell
my-solution |> solution run rollback-instance --name <solution instance name> [<rollback-additional-arguments> ...]
```

## Retry Solution Instance
A solution add-on instance failed operation can be retried by executing the following command using the ISO containing a higher version of the add-on:

```shell
my-solution |> solution run rollback-instance --name <solution instance name> [<retry-additional-arguments> ...]
```

## Publish Solution Instance
By defining the ability to change their tenant scope in their manifest, solution add-ons will enable the publishing operation on an instance. This will allow the provider to modify the scope of an add-on instance as a second day operation.
```
my-solution |> solution run publish-instance --name <solution instance name> [<arguments> ...]
```

## Invoke Solution Instance Operation
Once a solution add-on instance is operational, there might be events that require reconfiguring certain aspects of the instance. In such situations, there are day-2 operations supported by actions that can take user input and apply it within the latest VMware Cloud Director execution context.
```
my-solution |> solution run invoke <operation> instance --name <solution instance name> [<arguments> ...]
```

## Delete Solution Instance
A solution add-on instance can be deleted by executing the following command.

```shell
my-solution |> solution run delete-instance --name <solution instance name> [<arguments> ...]
```

## Purge Solution
A solution add-on instance can be purged in case of failure to delete in a regular fashion 
Purge command can be executed in or outside the context of a solution projects.
Purging deletes managed solution elements and does not execute triggers.
Purging will stop in case of an error during deletion of a resource. 
In such case the purge command can be rerun after manually fixing the blockage or "--force" flag can be used to ignore the error and continue with the purge. 
```shell
my-solution |> solution purge instance --instance-name myInst --force
my-solution |> solution purge addon --force
```

Without opened solution project
```shell
*no solution* |> solution purge instance --vendor vmware --soluiton-name my-solution  --instance-name myInst --force
*no solution* |> solution purge addon --vendor vmware --soluiton-name my-solution --force
```


## Continuous Integration & Deployment

The shebang is used as an executable in a Unix-like operating system. The program loader mechanism parses the rest of the file's initial line as an interpreter directive. The loader executes `/usr/bin/env vcd-ext-shell`, passing the path that was initially used when attempting to run the script as an argument, so that `vcd-ext-shell` can use the file as input data.

The shebang is a mechanism to enable continuous integration and delivery pipelines. It allows for executing `vcd-ext-shell` commands in sequence as long as the list of commands is processed or until a command has failed.

```shell
#!/usr/bin/env vcd-ext-shell

# Add-on solution package command requires vendor certificate it can be set or generated
setup vendor-certificate generate

# Add-on solution run command requires encryption-key, note this is used only for development purposes
setup encryption-key --key devkey

# Create new add-on from a template validated against VMware Cloud Director 10.4.1 in the current folder
solution new --name human --vendor demo --version 1.0.0 --from-template cloud-director-10.4.1/multi-instance-skeleton --folder .

# Produce artifacts about to be packaged
solution build

# Generate the add-on form factor, the ISO
solution package

# Add-on run command requires a VMware Cloud Director target to perform an operation
setup cloud-director add --host host --port 443 --username administrator --password password

# Execute an add-on create instance operation, note this is used only for development purposes for production the ISO is uploaded in VMware Cloud Director UI
solution run create-instance --name human01 --input-provider-business-scope-property human01 --input-password human01Password
```

# What is Next?
* [Understanding the Solution Add-On Behavior](behavior.md)
* [Exploring Solution Add-On Elements](elements.md)
* [Read the Service Provider Admin Guide for Solution Add-Ons](https://docs.vmware.com/en/VMware-Cloud-Director/10.4/VMware-Cloud-Director-Service-Provider-Admin-Portal-Guide/GUID-4F12C8F7-7CD3-44E8-9711-A5F43F8DCEB5.html)
