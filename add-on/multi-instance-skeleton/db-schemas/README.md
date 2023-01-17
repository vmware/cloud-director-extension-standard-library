# Network Manager for VMware Cloud on AWS

## Network Manager

Network manager type has the following properties:

| Name | Type | Description | Mandatory |
|---|---|---|---|
| host | string | Hostname of IP address of the NSX manager. | Yes |
| port | number | HTTPS port of the NSX manager. Default is 443. | No |
| username | string | NSX manager user with sufficient privileges to perform CRUD operations on solutions Tier1 gateway. | Yes |
| password | string | Password for the NSX manager user. | Yes |
| proxyHost | string | Hostname or IP address of a proxy used to connect to the NSX manager. | No |
| proxyPort | number | Port of the NSX manager proxy. | No |
| proxyUsername | string | Username of the NSX manager proxy. | No |
| proxyPassword | string | Password of the NSX manager proxy. | No |
