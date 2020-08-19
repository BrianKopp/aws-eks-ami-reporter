
const requiredNameRegex = /^(.*)-\d\.\d+-v\d{8}$/g;

/**
 * @param {import('aws-sdk').EC2} ec2Client
 * @returns {Promise<import('aws-sdk').EC2.DescribeImagesResult>}
 */
const fetchAllAmis = async (ec2Client) => {
    return await ec2Client.describeImages({
        Owners: ['602401143452'],  
    }).promise();
};

/**
 * @param {import('aws-sdk').EC2.ImageList} amis 
 */
const latestAmisOfType = (amis) => {
    if (!amis || !amis.length) {
        console.error('unexpected AMI result', amis);
        throw new Error('unexpected ami result');
    }

    /** @type {{[key: string]: { date: string, ami: import('aws-sdk').EC2.Image}}} */
    const mostRecentAmiByType = {};
    for (const ami of amis) {
        if (ami.Name && requiredNameRegex.test(ami.Name)) {
            const { name, date } = getPartsFromAmiName(ami.Name);
            const key = name;
            
            // check if we have it
            if (!mostRecentAmiByType[key]) {
                mostRecentAmiByType[key] = { date, ami };
            }
            
            // check if this ami is more recent than the previous one
            if (date > mostRecentAmiByType[key].date) {
                mostRecentAmiByType[key] = { date, ami };
            }
        }
    }

    return mostRecentAmiByType;
};

/**
 * Assumes naming convention like foo-bar-Major.Minor-vYYYYMMdd
 * @param {string} amiName
 * @returns {{ name: string, date: string, version: string, type: string }}
 * The name is like foo-bar-Major.Minor
 * The date is like vYYYYMMdd
 * The version is like Major.Minor
 * The type is like foo-bar.
 */
const getPartsFromAmiName = (amiName) => {
    if (!amiName) {
        console.error('unexpected ami name', amiName);
        throw new Error('unexpected ami name');
    }

    const parts = amiName.split('-');
    if (parts.length === 0) {
        console.error('unexpected ami name format', amiName, parts);
        throw new Error('unexpected ami name format');
    }

    const datePart = parts.splice(-1, 1)[0];
    const name = parts.join('-');
    const k8sVersion = parts.splice(-1, 1)[0];
    const type = parts.join('-');
    return {
        name,
        date: datePart,
        version: k8sVersion,
        type,
    };
};

module.exports = {
    fetchAllAmis,
    latestAmisOfType,
    getPartsFromAmiName,
};
