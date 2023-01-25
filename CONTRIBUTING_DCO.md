# Contributing to cloud-director-extension-standard-library

We welcome contributions from the community and first want to thank you for taking the time to contribute!

Please familiarize yourself with the [Code of Conduct](https://github.com/vmware/.github/blob/main/CODE_OF_CONDUCT.md) before contributing.

Before you start working with cloud-director-extension-standard-library, please read our [Developer Certificate of Origin](https://cla.vmware.com/dco). All contributions to this repository must be signed as described on that page. Your signature certifies that you wrote the patch or have the right to pass it on as an open-source patch.

## Ways to contribute

We welcome many types of contributions and not all of them need a Pull request. Contributions may include:

* New features and proposals
* Documentation
* Bug fixes
* Issue Triage
* Answering questions and giving feedback
* Helping to onboard new contributors
* Other related activities

## Getting started

Before you begin, download [Cloud Director Extension SDK](https://developer.vmware.com/web/sdk/1.0.0/cloud-director-extension) and follow the [Setup Development Environment](https://developer.vmware.com/web/sdk/1.0.0/cloud-director-extension) guide. This step will give you all the tools you need to build, test, run and package solutions add-ons or their component elements.

### Enhance or fix issue for existing solution add-on
1. Open your terminal and navigate to add-on folder.
2. Execute `vcd-ext-shell`
3. Follow [Understanding Solution Add-On Lifecycle and Understanding Solution Add-On Elements](https://developer.vmware.com/web/sdk/1.0.0/cloud-director-extension) documentation.

### Create new solution add-on
1. Open your terminal and navigate to repository add-on folder.
2. Execute `vcd-ext-shell`
3. Follow [Building Simple Solution Add-On](https://developer.vmware.com/web/sdk/1.0.4/cloud-director-extension) documentation.


### Enhance or fix issue for existing standalone element
1. Open your terminal and navigate to your working directory of choice.
2. Execute `vcd-ext-shell`
3. Create new solution add-on by follow [Building Simple Solution Add-On](https://developer.vmware.com/web/sdk/1.0.4/cloud-director-extension) documentation.
   > Note the folder name should follow the *Kebab case* naming convention (ex. word-word-work).
4. Include element into your add-on via `vcd-ext-shell # element add` command
5. Work on the enhancement or issue.
6. Extract the element segment from your add-on `manifest.yaml` and replace it in the `manifest.yaml` into repository element subject of change.
7. Replace the repository element source folder with the one from the add-on.


### Create new standalone element
1. Open your terminal and navigate to your working directory of choice.
2. Execute `vcd-ext-shell`
3. Create new solution add-on by follow [Building Simple Solution Add-On](https://developer.vmware.com/web/sdk/1.0.4/cloud-director-extension) documentation
4. Work on the element.
5. Create folder under repository `element` named after the element use case.
   > Note the folder name should follow the *Kebab case* naming convention (ex. word-word-work).
6. Extract the element segment from your add-on `manifest.yaml` and save it in the `manifest.yaml` into the new element in the repository.
7. Copy the repository element source folder into the new element in the repository.

## Contribution Flow

This is a rough outline of what a contributor's workflow looks like:

* Make a fork of the repository within your GitHub account
* Create a topic branch in your fork from where you want to base your work
* Make commits of logical units
* Make sure your commit messages are with the proper format, quality and descriptiveness (see below)
* Push your changes to the topic branch in your fork
* Create a pull request containing that commit

We follow the GitHub workflow, and you can find more details on the [GitHub flow documentation](https://docs.github.com/en/get-started/quickstart/github-flow).

### Pull Request Checklist

Before submitting your pull request, we advise you to use the following:

1. Check if your code changes will pass both code linting checks and unit tests.
2. Ensure your commit messages are descriptive. We follow the conventions on [How to Write a Git Commit Message](http://chris.beams.io/posts/git-commit/). Be sure to include any related GitHub issue references in the commit message. See [GFM syntax](https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown) for referencing issues and commits.
3. Check the commits and commits messages and ensure they are free from typos.

## Reporting Bugs and Creating Issues

Open GitHub issue.

## Ask for Help

The best way to reach us with a question when contributing is to open an original GitHub issue.

## Additional Resources

* [Cloud Director Extension SDK](https://developer.vmware.com/web/sdk/1.0.4/cloud-director-extension)
* [Service Provider Admin Guide for Solution Add-Ons](https://gitlab.eng.vmware.com/cloud-director-solutions/care-package-go-poc/-/tree/topic/tsimchev/STAR-6754/docs2#:~:text=Read%20the%20Service%20Provider%20Admin%20Guide%20for%20Solution%20Add%2DOns)

