# AWS EKS AMI Reporter

Publishes SNS messages when a new AWS EKS AMI hits the EC2 console.

Runs hourly.

AWS EKS AMIs are named like `amazon-eks-node-1.15-v20200723`. Any AMIs
not matching the regular expression `/^(.*)-\d\.\d+-v\d{8}$/g`
are excluded. They are grouped by name, like `amazon-eks-node-1.15`, and
sorted by the date part `v20200723`. The latest AMI ID for each group is
compared to the last AMI ID for that same group. If different, a message
is published to an SNS topic with the following contents:

```js
sns.publish({
    Subject: 'New EKS AMI',
    Message: JSON.stringify({
        Region: region, // e.g. us-east-1
        Type: type, // e.g. amazon-eks-node (no kubernetes version)
        Version: k8sVersion, // e.g. 1.15 (as string)
        Ami: ami, // the full AMI details as returned by the AWS EC2 API
    })
})
```
