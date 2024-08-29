# Understanding Solution Add-On Behavior

This section is dedicated to the role of solution add-on vendors and aims to provide key insights into the add-on behavior. It will assist vendors in understanding how to design, maintain, and upgrade their add-ons effectively in the future.

## Foundation

A solution add-on is generated using the VMware Cloud Director Extension SDK and packaged as a UDF (Universal Data Format) ISO. It can be installed in VMware Cloud Director through the Solutions Landing Zone user interface or via the embedded CLI installer within the ISO. The installation process is considered complete once the add-on card and ISO become available in VMware Cloud Director.

## Operations

Once a solution add-on and its ISO are available in VMware Cloud Director, a provider can begin managing instances by utilizing add-on operations, which include both the SDK built-in and custom vendor operations. These operations are available at the add-on level and are handled by the SDK for both the add-on and add-on element.

When a user executes an add-on operation, it initiates the following sequence of events:

- On the add-on level, the SDK triggers a pre-operation event, then dispatches the operation to the individual elements in a sequential manner. After processing all elements, the SDK fires a post-operation event before concluding the operation.

- On each add-on element, the SDK triggers a pre-operation event specific to that element, then proceeds to execute the operation. Finally, the SDK calls the post-operation event on the element to complete the process.

In the standard execution flow, the SDK is responsible for carrying out the operation. However, add-on vendors have the flexibility to define custom actions and associate them with the operation's pre and post events, giving them control over the execution flow. When an action on an event completes with exit code `0`, the operation flow proceeds to the next step. However, if the exit code is different from `0`, the operation will terminate for the entire add-on. In the event of an error leading to the operation's termination, the user is presented with the option to retry the operation on the failed element, where the pre-operation, element realization, and post-operation actions are executed again.

Additionally, there are vendor-defined user operations that function as day-2 operations on the instance. These operations can accept user input and are implemented through vendor-defined actions, similar to triggers.

**Note** that day-2 operations cannot alter the status of the add-on instance. They serve as user requests for modifying specific aspects of the vendor configuration logic.

## Events

Each operation in the add-on exposes a distinct set of events, granting the vendor precise control over validation, execution, extension, clean up, retry, and rollback custom activities.

A typical execution flow for an operation involves:

1. The user initiates the operation on the add-on instance.
2. The add-on pre-operation event is fired.
3. For each element:
   a. Element pre-operation event is fired.
   b. Element realization is executed.
   c. Element post-operation event is fired.
4. The add-on post-operation event is fired, signifying the completion of the operation.

However, during an upgrade rollback, the flow is slightly different:

1. The user executes an upgrade rollback on the add-on instance.
2. The add-on post-upgrade event is fired.
3. For each element in reverse order:
   a. Element post-upgrade event is fired.
   b. Element rollback is performed.
   c. Element pre-upgrade event is fired.
4. The add-on pre-upgrade event is fired.

This well-structured execution flow and event handling mechanism offer flexibility and reliability for managing effectively add-on operations.


The list of events per operation in execution priority order is as follows:
- Create Instance and Retry Create Instance
    - Add-On
        - PreCreate
        - PostCreate
        - OnError
    - Element
        - PreCreate
        - PostCreate
        - OnError
- Delete Instance and Retry Delete Instance
    - Add-On
        - PreDelete
        - PostDelete
        - OnError
    - Element
        - PreDelete
        - PostDelete
        - OnError
- Upgrade Instance and Retry Upgrade Instance
    - Add-On
        - PreUpgrade
        - PostUpgrade
        - OnError
    - Element
        - PreUpgrade
        - PostUpgrade
        - OnError
- Rollback Instance and Retry Rollback Instance
    - Add-On
        - PostUpgrade
        - PreUpgrade
        - OnError
    - Element
        - PostUpgrade
        - PreUpgrade
        - OnError
- Scope Instance and Retry Scope Instance
    - Add-On
        - PreScope
        - PostScope
        - OnError
    - Element
        - PreScope
        - PostScope
        - OnError

**Important!** The events of Rollback Instance and Retry Rollback Instance are fired in reverse order for both the add-on and its elements. The elements will be processed also in reverse order.

## Actions

An action as a CLI executable run as a child process associated with an add-on or add-on element event and bound to a blocking task. Actions receive their input from Standard Input Stream and return the control back via Standard Output and Error streams, and the OS process exit code.

In order to ensure the portability of the add-on, the vendor must supply statically compiled executables of Linux, Windows, and Mac for every action. Note that, the typical cloud provider may use the VMware Cloud Director user interface for installation that uses Linux-based runtime environment for VMware Cloud Director.

A common practice is to create a single executable and configure it as a trigger in multiple places within the add-on manifest. By leveraging the input context, which includes elements, operations, and events, the action can switch and handle the specific execution flow accordingly. This approach streamlines the management of actions and facilitates a more efficient and versatile add-on design.

**Note:** In case of operation retry the pre and post operation actions will receive the same context just the event will be different as the operation will be of type retry.

**Note:** In the event of an operation upgrade rollback, the elements will be processed in reverse order, and the events to actions will be triggered in the reverse order as well. This ensures a smooth and accurate rollback, where each element and action is correctly managed to restore the add-on to its previous state effectively.

Read more about the use of actions and events in [Triggers](elements.md#trigger).

## Single-Instance Add-On

A Single-Instance Add-On is intended to be installed as a singleton, ensuring that each element it contains exists as a single copy. This straightforward version of an add-on is designed to hold elements that are either immutable or do not require multiple instances. Examples of such elements include UI Plugins, Runtime Defined Entities, Roles, Rights, Right Bundles, Users, and even vApps. The primary goal of this flavor of an add-on is to provide simplicity and efficiency for scenarios where only one instance of each element is sufficient for the add-on's functionality within the VMware Cloud Director environment.

## Multi-Instance Add-On

A Multi-Instance Add-On is intended to be installed multiple times, and for each instance, a copy of its elements is created. To ensure uniqueness between instances, vendors must guarantee unique specification for elements, which can be achieved using template expressions in the `manifest.yaml` file.

The add-on instance name serves as a unique identifier, and using its value in an element provides the necessary level of uniqueness, as per the SDK.

Example of user with a unique name per instance 
```yaml
elements:
  - name: unique-user
    type: user
    spec:
      username: svc.{{ instance `name` }}
```

Bad example of a user in multi-instance add-on
```yaml
elements:
  - name: unique-user
    type: user
    spec:
      username: svc.admin01
```

For instance A, the element `unique-user` is created with the user `svc.admin01`.
For instance B, the element `unique-user` is created, but it also attempts to create a user `svc.admin01`, resulting in a collision.

To avoid such collisions, it is crucial for vendors to manage element specifications diligently when dealing with Multi-Instance Add-Ons.

**Important:** In the context of the multi-instance add-on, only immutable elements are eligible for sharing across instances, as they are inherently singletons (e.g., UI Plugin, Runtime Defined Entity). When installing the first add-on instance, these elements will be created, and they will be automatically removed with the last instance's removal.

## Multi-Instance Add-On with Shared Elements

**Important:** In a multi-instance add-on, immutable elements can be shared between instances, but mutable elements cannot. This section focuses on scenarios where there is a need to share mutable elements among multiple instances.

**Note:** This type of add-on should only be used when the vendor expects a significant number of backend instances, and all of them need to share mutable elements like role or rights. For other use cases, Single-Instance or Multi-Instance add-ons can serve the purpose.

A Multi-Instance Add-On with Shared Elements is designed for solutions that require a combination of singleton elements and multi-instance elements to achieve specific goals. While the VMware Cloud Director Extension SDK does not directly support this type of add-on, it outlines a strategy for achieving the desired outcome by splitting responsibilities between the two add-on types. The shared elements are placed in the Single-Instance Add-On, while all other elements are incorporated into the Multi-Instance Add-On.

Benefits:
- Facilitates atomic upgrades by maintaining a single instance of the UI plugin, Runtime Defined Entities, Global Roles, and Rights.
- Utilizes multi-instance elements for horizontal scalability and high availability, creating a backend virtual appliance and service account for each instance.
- Allows for upgrading scaled high-available instances in a blue-green fashion.

Limitations:
- Shared elements from the single-instance add-on cannot share any secrets with elements from the multi-instance add-on.
- The single-instance add-on and the multiple instances from the multi-instance add-on must be upgraded individually, necessitating the vendor to define an upgrade maintenance window.
- Shared elements from a single-instance add-on should not depend on elements from the multi-instance add-on, but the reverse is allowed.

## Upgrade Flow

The upgrade flow maintains execution track with the help of a transaction log, which plays a critical role in acting as a cursor for multiple atomic operations. This mechanism enables compensation transaction operations, also known as two-phase commit, facilitating a seamless upgrade process. The add-on upgrade flow consists of a series of atomic operations placed in a specific order, ensuring full traceability of the upgrade drift and enabling retry and rollback operations when needed.

The upgrade process of a solution add-on is consistently associated with a specific instance of the add-on, regardless of its type, whether single-instance or multi-instance.

The SDK initiates the upgrade flow by conducting a shallow check on the add-on instance's readiness and ensuring the integrity of its elements. Defined pre-upgrade actions are then executed, performing a comprehensive assessment of the instance's expected configuration state and the availability and activation of custom managed resources.

Following this, the upgrade of individual elements takes place in sequence, adhering to the order specified in the `manifest.yaml`.

To perform an upgrade from an older to a newer version, the SDK creates pairs of element type and element name and compares them between versions. The upgrade process follows these steps:

1. If a pair from the newer version is not available in the old version, the element behind the pair will be created following the element creation flow.
2. If a pair from the older version is not available in the new version, the element behind the pair will be removed during the final clean-up stage of the upgrade, after all other elements have been successfully created or upgraded.
3. If a pair from the older version is available in the new version, the specifications of the elements will be compared for drift. If no drift is detected, the element will be skipped, and pre and post events will not be fired.
   - If drift is present and the element is immutable, then the new element will be created, and the old element will be removed following the appropriate flows.
   - If drift is present and the element is mutable, then the pre-upgrade actions on the element will be executed, followed by the SDK updating the element and performing the post-upgrade action.

Once all elements are processed, the upgrade flow will fire the post-upgrade event on the add-on level, and on success, it will enter the clean-up phase, removing all elements available in the old version but not in the new version. This streamlined upgrade flow ensures a robust and successful upgrade process for solution add-ons, maintaining data integrity and element consistency throughout the transition to the newer version.

### Upgrade Retry Flow

If a failure occurs during the upgrade process and a retry operation is executed, the SDK follows specific steps to address the failure and continue with the upgrade:

1. **Element Creation Failure**: If the failure occurs during element creation, the element removal flow will be executed, followed by the element creation flow, resulting in the re-creation of the element.
2. **Element Removal Failure**: If the failure occurs during element removal, the element removal flow will be re-applied, ensuring the proper removal of the element.
3. **Element Upgrade Failure**: If the failure occurs during the element upgrade flow, the SDK triggers the element's pre-upgrade event with the transaction log from the last execution. On success, the SDK proceeds to bring the element into the desired state, followed by the firing of the post-upgrade event with the transaction log. On successful completion of these steps, the upgrade flow continues its course.

The upgrade retry flow ensures that any encountered failures are effectively addressed and resolved, allowing the upgrade process to proceed smoothly and achieve the desired outcome.

### Upgrade Rollback Flow

If a failure occurs during the upgrade process, and a rollback operation is executed, the SDK initiates the rollback by reverting to the previous version, starting from the current state and undoing the upgrade step by step.

It's important to note that in this rollback flow, all elements are processed in reverse order, and all events are also performed in reverse order, with post-events preceding pre-events.

**Important:** If the add-on defines custom actions that perform any type of create, alter, or update operations in VMware Cloud Director or third-party systems, it is crucial for these actions to implement a proper rollback flow when called as part of the overall rollback operation. The SDK provides tools to help vendors handle these situations through actions context and [Transaction Log](elements.md#transaction-log).

The upgrade rollback flow ensures a reliable and efficient process for reverting to the previous version, mitigating any encountered issues and restoring the add-on to its previous state with precision and accuracy.

# What is Next?
* [Exploring Solution Add-On Elements](elements.md)
* [Read the Service Provider Admin Guide for Solution Add-Ons](https://docs.vmware.com/en/VMware-Cloud-Director/10.4/VMware-Cloud-Director-Service-Provider-Admin-Portal-Guide/GUID-4F12C8F7-7CD3-44E8-9711-A5F43F8DCEB5.html)
