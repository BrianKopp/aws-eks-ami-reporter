---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Getting started with `aws-eks-ami-reporter` is easy! Simply subscribe to
the publicly accessible SNS topic with a Lambda function or SQS queue.

ARN: `arn:aws:sns:us-east-1:874165549535:aws-eks-ami`.

Swap out `us-east-1` with your region of choice.
[See supported regions.](/docs/supported-regions)
Messages are published to SNS when the latest AMI for EKS changes.
See [SNS payload details](/docs/sns-details)
and [how it works](/docs/how-it-works).

## Sample Lambda Function

It's easy to set up a Lambda function to fire when the a message
is published to SNS. Navigate to the Lambda dashboard and create
a new function.

![new-function](/img/lambda-setup-create-function.png)

Use a lambda blueprint and search for SNS.

![use-sns-blueprint](/img/lambda-setup-use-sns-blueprint.png)

Configure your lambda function. Here, I'm subscribing to the
**dev** version of the `aws-eks-ami-reporter`.

![configure-function](/img/lambda-setup-configure-trigger.png)

You'll see the lambda function is created with some starter code.
Launch your workflows from here.

```js
console.log('Loading function');

exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    const message = event.Records[0].Sns.Message;
    console.log('From SNS:', message);
    return message;
};
```

Voila! Your lambda function is set up and ready to go!

## Testing

`aws-eks-ami-reporter` has deployments for each of the branches `dev`,
`test`, and `master`. `test` and `master` are identical in behavior -
they run hourly and messages are only published to SNS when
there is a change in the latest AMI. `test` is used for promoting
changes.

However on `dev`, it runs daily, and publishes messages to SNS
**all the time**. This is useful for verifying that you have your
SNS subscription set up correctly and are parsing the event payload
correctly.
