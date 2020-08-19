/**
 * @param {import('aws-sdk').DynamoDB.DocumentClient} client
 * @param {string} tableName
 * @param {string} region
 * @param {string} type like aws-eks-node
 * @param {string} version like 1.15
 * @param {import('aws-sdk').EC2.Image} ami
 */
const updateAmiType = async (client, tableName, region, type, version, ami) => {
    await client.put({
        TableName: tableName,
        Item: {
            name: `${type}-${version}`,
            region,
            type,
            version,
            id: ami.ImageId,
            details: ami
        },
    }).promise();
};

/**
 * @param {import('aws-sdk').DynamoDB.DocumentClient} client
 * @param {string} tableName
 * @param {string} region the region where the AMIs are located
 * @returns {Array<{type: string, id: string, region: string, name: string, version: string}>}
 */
const getLastAmiTypes = async (client, tableName, region) => {
    const results = await client.query({
        TableName: tableName,
        IndexName: 'region-index',
        KeyConditionExpression: '#r = :r',
        ExpressionAttributeNames: {
            '#r': 'region'
        },
        ExpressionAttributeValues: {
            ':r': region
        }
    }).promise();
    return results.Items;
};

module.exports = {
    getLastAmiTypes,
    updateAmiType,
};
