# Architecture

This app uses serverless technologies to keep things simple.

## CloudWatch Trigger

CloudWatch scheduled events makes it easy to schedule these
events to occur on a regular basis, and for as many regions
as are requested.

## Lambda

The Lambda function consists of a few simple javascript files.
Only the `aws-sdk` is used, so no npm building or zipping is
required.

## Dynamo

The dynamo table will be very simple, keeping only the latest
AMI versions for a given region. AMIs are named like so
`foo-bar-Major.Minor-vYYYYMMdd`. The persistence model is as follows:

```ts
type DataModel = {
    name: string; // like foo-bar-Major.Minor
    region: string; // like us-east-1
    id: string; // AMI ID
    type: string; // like foo-bar
    version: string; // like Major.Minor
    details: any; // the AMI details from the API
};
```

Some examples of AMI names are:

* amazon-eks-node-1.14
* amazon-eks-arm64-node-1.14
* amazon-eks-gpu-node-1.17

The table has hash key `name` and a sort key `region`.
There is a Global Secondary Index called `region-index`
which has hash key `region`, with no sort key. The `region-index`
GSI will have attribute projections `id`, `type`, and `version`,
as well as carry along by default the `name` attribute since it's
the hash key for the table.

## SNS

There will be an SNS in every region that is implemented
with topic name `aws-eks-ami`. The topic is marked as publicly
accessible. Consumers can subscribe using SQS or Lambda protocols.
