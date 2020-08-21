---
id: sns-details
title: SNS Details
---

SNS messages are published using the standard structure. Here's an example
Lambda event payload for a Lambda subscribed to SNS.

```json
{
    "Records": [
        {
            "EventSource": "aws:sns",
            "EventVersion": "1.0",
            "EventSubscriptionArn": "your-subscription-arn",
            "Sns": {
                "Type": "Notification",
                "MessageId": "some-uuid",
                "TopicArn": "arn:aws:sns:us-east-1:874165549535:dev-aws-eks-ami",
                "Subject": "New EKS AMI",
                "Message": "SEE MESSAGE PAYLOAD BELOW",
                "Timestamp": "2020-08-20T17:00:52.873Z",
                "SignatureVersion": "1",
                "Signature": "some-signature",
                "SigningCertUrl": "some-url",
                "UnsubscribeUrl": "some-url",
                "MessageAttributes": {}
            }
        }
    ]
}
```

The SNS message payload is a JSON-ified string, which after parsing,
has an object like so:

```json
{
    "Region": "us-east-1",
    "Type": "amazon-eks-node",
    "Version": "1.15",
    "Ami": {
        "Architecture": "x86_64",
        "CreationDate": "2020-07-24T02:26:17.000Z",
        "ImageId": "ami-055e79c5dcb596625",
        "ImageLocation": "amazon/amazon-eks-node-1.15-v20200723",
        "ImageType": "machine",
        "Public": true,
        "OwnerId": "602401143452",
        "PlatformDetails": "Linux/UNIX",
        "UsageOperation": "RunInstances",
        "ProductCodes": [],
        "State": "available",
        "BlockDeviceMappings": [
            {
                "DeviceName": "/dev/xvda",
                "Ebs": {
                    "DeleteOnTermination": true,
                    "SnapshotId": "snap-064c5aaebfdef0b47",
                    "VolumeSize": 20,
                    "VolumeType": "gp2",
                    "Encrypted": false
                }
            }
        ],
        "Description": "EKS Kubernetes Worker AMI with AmazonLinux2 image, (k8s: 1.15.11, docker:19.03.6ce-4.amzn2)",
        "EnaSupport": true,
        "Hypervisor": "xen",
        "ImageOwnerAlias": "amazon",
        "Name": "amazon-eks-node-1.15-v20200723",
        "RootDeviceName": "/dev/xvda",
        "RootDeviceType": "ebs",
        "SriovNetSupport": "simple",
        "Tags": [],
        "VirtualizationType": "hvm"
    }
}
```
