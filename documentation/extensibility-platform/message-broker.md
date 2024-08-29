VMware Cloud Director uses a traditional message broker to support many of the extensibility platform capabilities. Starting from version 10.2, a message broker comes pre-bundled with the product. The protocol used for communication is [mqtt3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html).
> This page is still under development
# Establishing a connection
* web socket at `{vcd.host}/messaging/mqtt`

## Characteristics of the broker capabilities
* embedded brokers in each cell of a cell group are clustered
  * brokers "forward" messages between themselves if necessary; for ex. when one client is connected on cell A and publishes to a topic, and there is another client connected on Cell B which is subscribed to the same topic, it will receive the message
* `QoS=0,1,2` are supported, and
  * `QoS=1,2` - message loss may occur in case the broker stops
  * `QoS=0` - message loss may occur even in case of network hiccups
* `clean start/session=true`
  * `clean start=false` is not supported, because the broker does not keep any persisted state, meaning on crash or restart any durable session will be forgotten
  * default message expiration is 5 minutes(unless the broker holding the message is stopped before then)
* cannot be used as a generic broker
  * messages flow from VMware Cloud Director outward(notifications), or
  * request/response on strictly defined topics(extension services)
* authentication
  * extension services -> user=extension service triplet, pass=extension token(get from RESTapi `/cloudapi/1.0.0/tokens`, `type=EXTENSION`)
  * notifications -> user=user@organisation, pass=session jwt(perform a regular login at RESTapi to obtain jwt)
  
## Message Schema
  * meta information describing how the payload is encoded(`payload` is a json/xml encoded string, etc); the `type` sometimes dictates the payload type(`BEHAVIOR_INVOCATION`=>`InvocationArguments`), but other times it is additionally specified by `headers.contentType`
    * the reason for this structure is that payloads with varying schemas may float over the same topic; this means that your application may need to cope with messages which it is not interested in(and ignore them, rather than fail)
  ```json
    {
      "type": "EVENT|EXTERNAL_EVENT|TASK|EXTENSION_TASK|API_REQUEST|API_RESPONSE|BEHAVIOR_INVOCATION|BEHAVIOR_RESPONSE",
      "headers": {},
      "payload": ""
    }
  ```
> **Note:**
> 
> This pattern is used throughout the extensibility platform and various features may themselves encode their payloads in terms of meta info+encoded payload in the main `payload`; for ex. `BEHAVIOR_INVOCATION` wraps `HalfDuplexEnvelope` in its `payload`(`InvocationArguments.arguments`) as a json encoded string and the `HalfDuplexEnvelope` itself also encodes an [object extension request/response](object-extensibility.md#implementing-an-object-extension-backend) in its `payload`(where `payloadType` contains the name of the encoded payload schema)

## Configuring a client
* handling connection hiccups(subscriptions must be re-established "manually")
* handling password expiration(token, jwt, etc)
* working around known bugs of popular clients(paho)

## Best practices
* mission critical applications integrating _notifications_ should have a mechanism to periodically check for missed events and should not solely rely on `QoS`(or `clean start`)
  * extension developers must find balance between the frequency of the check and the `QoS` level that is used; the higher the `QoS` the less frequent the check may need to be; for most situations `QoS=1` should be good enough, unless the check is very expensive to make; `QoS=2` may be used as last resort, as that is very taxing on the broker and may lower the overall performance of VMware Cloud Director itself
* `QoS` should be viewed as levels of guarantee that a message transfer between broker and client will succeed, but it does not directly guarantee a message transfer between a `publisher` and a `subscriber`
* applications may need to implement additional logic to cope with duplicated messages for `QoS=1` (at least once)