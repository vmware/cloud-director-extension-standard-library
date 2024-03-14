# Cloud Director Extensibility Platform Overview
Cloud Director Extensibility Platform provides a set of capabilities that enable developers and Cloud Service Providers (CSPs) to build and offer additional cloud services in their portfolio. As stated in the [previous section](../extension-sdk/extension-sdk.md), Solution Add-ons provide the necessary capabilities for simple lifecycle management and they are built on top of the multiple capabilities of the Extensibility Platform. For more details on each capability, refer to the sections below and review the technical information in the detailed guides.

## UI Extensibility
Through the UI Extensibility framework, developers can create custom plugins that integrate seamlessly into the Cloud Director user interface. The UI plugins serve the role of the frontend for Cloud Director Extensions, allowing Cloud Providers and Tenants to manage and consume value added services. UI Plugins are developed using the Angular and Clarity frameworks, but in some cases, other technology stacks might be required. This is why UI Plugins also support iFrames.

More details for all UI Extensibility capabilities and tooling can be found [here](ui-plugins.md).

## [Message broker](message-broker.md)
The backbone of many of the extensibility framework technologies is a message bus. Extension backends communicate with-, or monitor various system processes and events. Currently, there are two message busses - one for the AMQP protocol, which is backed by a provider's own RabbitMQ server, and one for the MQTT protocol which is embedded in Cloud Director. AMQP is being slowly phased out in favour of MQTT and will eventually be completely removed.

## Notifications and Events
Notifications and Events are mechanisms that provide real-time information about activities, changes, and status updates within the VCD environment. These features allow Cloud Director Extensions to monitor and respond to events that occur in the cloud infrastructure and enable various monitoring, alerting, automation and external system integration usecases.

Cloud Director Notifications and Events are consumed using the MQTT protocol, and more details will be provided in a detailed guide soon.

## [API Extensibility](api-extensibility.md)
Cloud Director allows defining custom API endpoints that integrate seamlessly into Cloud Director REST API layer. Extensions can leverage this capability to enable new services that can be consumed by either UI Plugins or API users and scripts. The additional APIs require a backend to process the request information and respond in the proper fashion. Currently there are two flavours for this:

- MQTT - API extension services can integrate with Cloud Director backend via websocket connection, using MQTT protocol. Such services use 2 distinct MQTT topics for receiving incoming http requests and providing the response. These responses are then propagated back to the API caller in their original http form.
- API Transparent Proxy - This approach allows Cloud Director to act as a transparent proxy to any REST API that the VCD appliance has network connectivity to but the API caller does not. This approach, combined with the iFrame support of UI Plugins, enables quick and low-effort integrations with other Cloud Services and Systems.

## Runtime Defined Entities and Behaviors
Runtime Defined Entities (RDE) allow Extensions to create custom objects through the Cloud Director API and persist them into the Cloud Director's database. The RDEs enable use cases like managing the desired state of external resources and storing the state of an extension. In addition to extending the database, the RDE framework intoduces different types of behaviors such as Webhook, MQTT, vRO, AWS Lamba and Built-in FaaS that can be used to interact with the data stored in the Runtime Defined Entities.

RDEs additionally provide advanced RBAC and Access Control for each type of object and their instances. These capabilities, combined with behaviors, are a great alternative to a traditional appliance backend that Extensions usually implement. More details for Runtime Defined Entities' management and all Behavior types will be provided in a detailed guide soon.

## Blocking Tasks(Callouts)
Most built-in long-running operations in Cloud Director can be configured to block and wait to be resumed/cancelled/aborted via an external entity - either manually by a user, or by an application.

## [Object Extensibility](object-extensibility.md)
Cloud Director allows Extensions to participate in, influence, or override the logic that VMware Cloud Director applies
to core workflows like vApp/VM instantiation and placement. While [Blocking Tasks](https://docs.vmware.com/en/VMware-Cloud-Director/10.5/VMware-Cloud-Director-Service-Provider-Admin-Guide/GUID-B61D23C2-CCCF-4B33-8692-642C80A24193.html)
allow Providers to control the progress of certain tasks in the system, Object Extensions can directly influence the
outcome of certain core platform workflows. Extensions have to leverage MQTT behaviors to interact and plug into the
core workflows currently exposed by Cloud Director.

More details will be provided in a detailed guide soon.

## Object Metadata
Many core entity types support a notion of a soft schema extension to their main properties. Object metadata gives cloud operators and tenants a flexible way to associate user-defined properties (name=value pairs) with objects.

There are two separate pools of metadata, which have different management and capabilities:
1. Metadata of objects managed by the legacy Cloud Director api
2. [Metadata](object-metadata-2.md) of objects managed by the Cloud Director `cloudapi`

Objects which can be managed by both kinds of apis(legacy and cloudapi) will have the two separate pools. Metadata of the legacy api is considered deprecated and will receive only bug-fixes. Metadata of the cloudapi provides new features, with the primary goal being - improved _performance_, including a more powerful _search-by-metadata_ mechanism.
