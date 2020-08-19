

/**
 * @param {import('aws-sdk').SNS} client
 * @param {string} topicName
 * @param {string} accountId
 * @param {string} type
 * @param {string} k8sVersion
 * @param {import('aws-sdk').EC2} ami
 */
const publishChange = async (client, region, topicName, accountId, type, k8sVersion, ami) => {
    await client.publish({
        TopicArn: `arn:aws:sns:${region}:${accountId}:${topicName}`,
        Subject: 'New EKS AMI',
        Message: JSON.stringify({
            Region: region,
            Type: type,
            Version: k8sVersion,
            Ami: ami
        })
    }).promise();
};

module.exports = {
    publishChange,
};
