/*
Gets a list of all AMIs from the EKS folks. Sorts them by release date.
Checks DynamoDB to see if we haven't seen them yet.
If new, publish a message to an SNS topic
*/

const tableName = process.env.TABLE_NAME;
const snsTopicName = process.env.TOPIC_NAME;
const accountId = process.env.ACCOUNT_ID;
const region = process.env.AWS_REGION;
const alwaysReport = Number(process.env.ALWAYS_REPORT) ? true : false;

const aws = require('aws-sdk');
const amiUtils = require('./ami');
const dynamo = require('./dynamo');
const sns = require('./sns');

const run = async (amiRegion) => {
    console.log('running', region, amiRegion);
    
    const ec2Client = new aws.EC2({
        region: amiRegion,
    });
    
    const dynamoDocumentClient = new aws.DynamoDB.DocumentClient({
        region,
    });
    
    const snsClient = new aws.SNS({
        region
    });

    const { Images } = await amiUtils.fetchAllAmis(ec2Client);
    console.log(`found ${Images.length} images`);

    const latestAmisByType = amiUtils.latestAmisOfType(Images);
    console.log(`found latest images for types ${Object.keys(latestAmisByType)}`);

    const lastAmis = await dynamo.getLastAmiTypes(dynamoDocumentClient, tableName, amiRegion);
    console.log(`fetched ${lastAmis.length} previous AMIs from Dynamo`);

    for (const amiType in latestAmisByType) {
        const ami = latestAmisByType[amiType].ami;
        let found = false;
        for (const lastAmi of lastAmis) {
            if (lastAmi.name === amiType && lastAmi.id === ami.ImageId) {
                console.log('the last ami is the same as the current ami', amiRegion, amiType, lastAmi.id);
                found = true;
                break;
            }
        }

        if (!found || alwaysReport) {
            console.log('AMI is either new or updated', amiRegion, amiType, ami.ImageId);
            const { name, type, version } = amiUtils.getPartsFromAmiName(ami.Name);
            // publish new ami
            await sns.publishChange(snsClient, amiRegion, snsTopicName, accountId, type, version, ami);
            console.log('published change to SNS', amiRegion, snsTopicName, type, version, ami.ImageId);

            // update dynamo
            if (!found) {
                await dynamo.updateAmiType(dynamoDocumentClient, tableName, amiRegion, type, version, ami);
                console.log('updated item in dynamodb', amiRegion, name, type, version, ami.ImageId);
            }
        }
    }
};

exports.handler = async (event, context) => {
    console.log('lambda handler', event);
    await run(event.region || 'us-east-1');
}
