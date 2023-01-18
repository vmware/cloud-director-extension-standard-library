# Cloud Director Extension Standard Library
The VMware `vcd-ext-shell` command line interface allows vendors to use starter templates for creating solution add-ons and add-on elements. The source of the available templates is located in this Git repository.

All components of this repository are validated by VMware or its partners against particular Cloud Director version.

## Documentation

Get familiar with Cloud Director Solution Add-Ons.
* [Cloud Director Extension SDK](https://developer.vmware.com/web/sdk/1.0.0/cloud-director-extension)
* [Service Provider Admin Guide for Solution Add-Ons](https://gitlab.eng.vmware.com/cloud-director-solutions/care-package-go-poc/-/tree/topic/tsimchev/STAR-6754/docs2#:~:text=Read%20the%20Service%20Provider%20Admin%20Guide%20for%20Solution%20Add%2DOns)

## Repository Filesystem Layout
Every branch of the repository contains two folders at the root level.
- `add-on` containing a solution add-on template per sub-folder.
- `element/<element type>` containing a solution add-on element template per sub-folder.

> **Important**
> The folder name for every template must be named after the major use case it delivers following the Kebab case naming convention (ex. work-word-word).

Both `add-on` and `element/<element type>` folders might contain folders starting with `.`. These folders contain helper tools for building, testing and documenting an add-on or its elements.

Filesystem Layout:
```shell
<branch>
- add-on/<use case>
- add-on/.<add-on centric toolchain>
- element/<element type>/<use case>
- element/<element type>/.<element centric toolchain>
```

The templates and tools are further organized by branches. The names of the branches follow `cloud-director-X.X.X` pattern and claim that all add-ons and elements templates in that branch has been validated against an environment running Cloud Director version `X.X.X`. The `main` branch contains alpha versions of the add-ons and elements for the next upcoming release.

> **Important**
When a vendor used a starter template from `cloud-director-X.X.X` to bootstrap his add-on with minimal version of Cloud Director `X.X.X` and receive complain from a provider running later version of Cloud Director `X.Y.Z`, the one can review directly the fix made by VMware or its partner applied on the started template by comparing the branches `cloud-director-X.X.X` with `cloud-director-X.Y.Z`, and find out what was the exact line causing the issue.

Branching organization:
```shell
main
cloud-director-10.4.1
...
cloud-director-10.5
```

## Contributing

The cloud-director-extension-standard-library project team welcomes contributions from the community. Before you start working with cloud-director-extension-standard-library, please
read our [Developer Certificate of Origin](https://cla.vmware.com/dco). All contributions to this repository must be
signed as described on that page. Your signature certifies that you wrote the patch or have the right to pass it on
as an open-source patch. For more detailed information, refer to [CONTRIBUTING_DCO.md](CONTRIBUTING_DCO.md).

## License
BSD-2-Clause