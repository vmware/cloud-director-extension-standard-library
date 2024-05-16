# Cloud Director Extension SDK
Cloud Director Extension SDK provides utilities empowering the Solution Add-On Development Lifecycle. It contains tools for writing, building, testing and packaging Cloud Director UI plugins, Runtime Defined Entities, users, rights, right-bundles, roles, backend vApps, network services and policies, and their lifecycle operations into self-contained all-in-one bundle distributed under the name Cloud Director Solution Add-On.

![Solution Add-On Overview](images/overview.png)

## Why You Need Solution Add-On
Could Director exposes different extensibility mechanisms where each of those has its own lifecycle and management APIs, but in the real world they play together to implement more complex use cases and be used as part of a bigger solution often delivered with number of documents for manual steps. This makes building, distributing and deploying such solution a challenge. Solutions add-ons have been introduced to tackle this problem.

## Solution Add-On
Starting with VMware Cloud Director 10.4.1, you can use VMware Cloud Director Solution Add-Ons UI to extend your VMware Cloud Director offering with value-added functionalities. Through the UI, you can manage the resources and life cycle of solutions that are custom-built to extend the functionality of VMware Cloud Director.

A solution add-on is the representation of a solution that is custom-built for VMware Cloud Director in the VMware Cloud Director extensibility ecosystem. A solution add-on can encapsulate UI and API VMware Cloud Director extensions together with their backend services and lifecycle management. Solution аdd-оns are distributed as .iso files with an embedded installer for 64-bit Linux, Windows and Mac operating systems for local installation or can be directly managed via Cloud Director UI. 

Once a solution add-on is uploaded in Cloud Director the provider can enable it by creating an instance of it. Depending on it vendor the add-on can support single or multiple instances. The multi-instance add-ons tend to create copies of themselves to address multi-tenancy or other type of isolation or distribute themselves across the datacenter resources to achieve better performance or gain certain level of network access.

## Solution Landing Zone
Most of the solutions add-ons go beyond the standard extensibility in Cloud Director and bring their own backend that requires specific infrastructure resources. Automating the installation and upgrade flows of such add-on might be very challenging if there is no standard interface between the provider resources and the vendor expectations. Starting with VMware Cloud Director 10.4.1 vendors can utilize the Solution Add-On Landing Zone and implement their add-on lifecycle management run books throughout automation.

The Solution Add-On Landing Zone is a part of the provider management plane that represents a pool of compute, storage and networking resources dedicated to hosting, managing, and running solution add-ons on behalf of the cloud provider. It is implemented as Cloud Director Runtime Defined Entity referencing existing Cloud Director resources. It further defines a standard interface for vendors that could be consumed via Cloud Director Extension SDK and flexible resource allocation scheme for providers to choose from linking resources already in use or dedicate new infrastructure pool, or make a combination of both.

## Key Roles in the Solution Add-On Ecosystem
### Vendor
Vendors are the creators of solution add-ons who use the Solution Add-On SDK to create services that complement VMware Cloud Director, such as Container Service Extension, third-party software vendors, Kubernetes service, and others.

### Provider
Providers are the operators of solution add-ons in the VMware Cloud Director on-premises or VMware Cloud Director service environment.

### Tenant
Tenants are the consumers of the business outcomes brought about by a solution add-on, for example, self-service provisioning of Kubernetes clusters, Kubernetes operators, databases, UI extensions with back-office properties, and more.

# What is Next?
* [Setting up the Development Environment](setup.md)
* [Building a Simple Solution Add-On](playground.md)
* [Understanding the Solution Add-On Lifecycle](lifecycle.md)
* [Understanding the Solution Add-On Behavior](behavior.md)
* [Exploring Solution Add-On Elements](elements.md)
* [Troubleshooting Solution Add-On Operations](troubleshoot.md)
* [Read the Service Provider Admin Guide for Solution Add-Ons](https://docs.vmware.com/en/VMware-Cloud-Director/10.4/VMware-Cloud-Director-Service-Provider-Admin-Portal-Guide/GUID-4F12C8F7-7CD3-44E8-9711-A5F43F8DCEB5.html)