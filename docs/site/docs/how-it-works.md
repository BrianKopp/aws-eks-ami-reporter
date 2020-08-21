---
id: how-it-works
title: How it Works
---

`aws-eks-ami-reporter` is a pretty basic app that runs a lambda function
looking for the latest AMIs for EKS. It runs every hour, grabs the AMIs
from the EC2 API, categorizes them by type and kubernetes version, compares
them against the previously found AMIs, and publishes a message to SNS
if they change.
oaeuoeuaoeuoa

## The Details

`aws-eks-ami-reporter` looks for all AWS AMIs that follow the format
`some-name-Major.Minor-vYYYYMMdd`. There are some earlier naming conventions
that were used that are discarded.

`some-name` is typically something like `amazon-eks-node` or `aws-eks-gpu-node`. In the SNS payload, this is the `Type`.

`Major.Minor` is a kubernetes version like `1.15`. In the SNS
payload, this is the `Version`.

`vYYYYMMdd` is a date string like `v20200814` indicating
August 14, 2020.

`aws-eks-ami-reporter` keeps the latest (sorted by the date string)
AMI in DynamoDB for every `Version`, `Type`, and region. When it runs,
it compares the latest AMI ID from the EC2 API to the last seen value
in DynamoDB. If a change has occurred, it emits an SNS message.

Each region has its own AMIs. Thus, `Region` is reported in the SNS message
payload. `aws-eks-ami-reporter` can run for any region, but isn't set up
out of the box. [See supported regions.](/docs/supported-regions)
