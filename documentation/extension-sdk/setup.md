
# Setting up the Development Environment
The VMware Cloud Director Extension SDK is distributed as binary under the name `vcd-ext-shell`. This shell introduces set of commands to manage the various stages of a solution add-on development and its future upgrades.

The latest version of `vcd-ext-shell` for Linux, Windows and Mac operating systems is available on our website [[Download]](https://packages.vmware.com/vcd-ext/).

## Prerequisites
- Docker version 18.09 or higher. [[Setup]](https://docs.docker.com/get-docker/)
- Docker buildx plugin. [[Setup]](https://docs.docker.com/build/install-buildx/)
- Internet access required to access Docker images.
- Your favorite IDE.

## Install
The SDK can be installed by appending its path to the operating system `PATH` variable.
```shell
echo 'export PATH=$PATH:<path to vcd-ext-shell>' >> ~/.bash_profile
```

## Setup
Executing the `vcd-ext-shell` for the first time will print its basic use message.

```shell
$ vcd-ext-shell
```

```shell
Welcome to VMware Cloud Director Solution Add-On CLI Version '<release>-<build number>'.

CEIP is 'on'. If needed it can be turned off via 'setup ceip off' command.

Use <Tab> or <Ctl+Esc> for help, navigation and autocompletion, try now!

It looks like '<current working directory>' does not contain a valid solution add-on.
You can use 'solution open' command to open an existing solution add-on project or 'solution new' command to create a new project.
```

The release details can be reviewed via `about` command.
```shell
* no solution |> about  <SPACE>
                        release-notes   Print release notes
                        license         Print license
                        version         Print version
```

The `vcd-ext-shell` supports automatic upgrade via `upgrade` command. The `vcd-ext-shell` will check for upgrades on a regular basis, once a new version is available it is going to prompt the user and suggest the upgrade. This the best way to keep up to date with the latest improvements and fixes.
```shell
* no solution |> upgrade <SPACE>
                         vcd-ext-shell Upgrade to latest version
```

Also, the first execution of the `vcd-ext-shell` will create initial configuration under `~/.vcd-ext-shell` with the following contents.
```shell
privateKeyPemPath: ""
certificatePemPath: ""
encryptionKey: ""
bootstrapRepoUrl: ""
latestVersion: <version>
cloudDirectors:
    activeHost: ""
    hosts: []
extensionLibraries:
    activeRepository: ""
    repositories: []
ceip: true
```

It is recommended to modify the contents of `~/.vcd-ext-shell` via the `setup` command.

```shell
* no solution |> setup <SPACE>

vendor-certificate           Set vendor or generate self-signed certificate and private key (used to create ISO signatures)
encryption-key               A key used to encrypt runtime deployment configuration in development mode          
extension-library            Set extension library URI (filesystem path or URL)                                                                   
cloud-directors              Manage VMware Cloud Director connections
ceip                         Set participation in VMware's Customer Experience Improvement Program ("CEIP")
print                        Print current configuration
```

### Vendor
Solution add-on vendor represents the add-on developer identity. The `vcd-ext-shell` is going to use the vendor certificate to sign all files part of the resulted ISO. This way the provider receives a guarantee for the origin of the add-on.

The vendor can set up their identity by providing the paths to their private key and certificate PEM encoded files. Alternatively a developer can utilize the built-in self-signed pair generation functionality. 

**NOTE**: Self-signed certificates should be used only for pure development activities when the add-on is ready to be released it is recommended to use publicly trusted certificate.

Use existing or generate new private key and certificate.
```shell
*no solution* |>setup vendor-certificate  <SPACE>
                                          set       Set path to vendor certificate and private key  
                                          generate  Generate new self-signed certificate   
```

**NOTE**: Prior an add-on installation the provider has to trust the vendor certificate otherwise the installation request will be denied.

### Encryption
A solution add-on might use credentials or other type of secrets provided as user input. This data will be encrypted with a key defined explicitly by the provider or implicitly generated by VMware Cloud Director.

In development mode (`vcd-ext-shell` ) all add-on operations are executed explicitly and require manual configuration of an encryption-key.

```shell
* no solution |> setup encryption-key --key <user provided key>
```

### Environment
A developer or a continuous integration system can use multiple VMware Cloud Director instances to implement and test the various aspects of an add-on.

Add a new VMware Cloud Director environment.
```shell
* no solution |> setup cloud-director add <SPACE>
                                            --host           Public URL or IP (required)  
                                            --port           Port (default: 443)          
                                            --username       Username (required)          
                                            --password       Password (exclusive with --password-file)            
                                            --password-file  Password file (exclusive with --password)                                                   
```

List the available VMware Cloud Director environments
```shell
* no solution |> setup cloud-directors print
VMware Cloud Director Hosts:
  Active Host: cloud-a.director.local
  Hosts: 
    - cloud-a.director.local
    - cloud-b.director.local
```

Change the default VMware Cloud Director environment.
```shell
* no solution  |> setup cloud-directors activate --host cloud-b.director.local
VMware Cloud Director Hosts:
  Active Host: cloud-b.director.local
  Hosts: 
    - cloud-a.director.local
    - cloud-b.director.local
```

### CEIP
The `vcd-ext-shell` command line interface participates in VMware's Customer Experience Improvement Program (CEIP). 
The CEIP provides VMware with information that enables VMware to improve its products and services, to fix problems, and to advise you on how best to use our products.

Details regarding the data collected through CEIP and the purposes for which it is used by VMware are set forth at the Trust & Assurance Center at http://www.vmware.com/trustvmware/ceip.html.

CEIP can be enabled or disabled via `vcd-ext-shell`.
```shell
* no solution  |> setup ceip <SPACE>
                             on     Turn on CEIP
                             off    Turn off CEIP
                             print  Display current setting
```

### Extension Library
The `vcd-ext-shell` can bootstrap a new project or add an element to an existing project using a prescribed library.
In order to do so one or more repositories can be configured
Default preconfigured public repository is https://github.com/vmware/cloud-director-extension-standard-library

```shell
* no solution  |> setup extension-library <SPACE>
                                          add       Configure new extension library
                                          remove    Remove existing extension library from configuration
                                          activate  Set extension library as active target
                                          default   Set default extension library as active target
                                          print     Print available extension libraries
```

### Environment variables
For ease of CI/CD management `vcd-ext-shell` can replace specific place-holders inside manifest file.
Placeholder format is as follows `{{ env 'VAR_NAME' 'OPTIONAL_DEFAULT' }}`.
Replacement values will be taken from (in order of priority): OS environment variables, configured properties, default values
Setting the configuration variables can be done with command `setup environment set --name VAR1 --value Value1`.
When `vcd-ext-shell` is in a context of a project `set` command will present place-holders form manifest flags.
```shell
*no solution* |>setup environment 
                                   set    Set                             
                                   clean  Clean configuration properties  
                                   print  Print variables                 
```

# What is Next?
* [Building a Simple Solution Add-On](playground.md)
* [Understanding the Solution Add-On Lifecycle](lifecycle.md)
* [Understanding the Solution Add-On Behavior](behavior.md)
* [Exploring Solution Add-On Elements](elements.md)