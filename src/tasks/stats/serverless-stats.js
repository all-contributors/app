const AWS = require('aws-sdk')
const s3 = new AWS.s3({ apiVersion: '2006-03-01' })

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const data = await s3
            .getObject({
                Bucket: process.env.STATS_BUCKET,
                Key: 'stats.json',
            })
            .promise()

        return {
            statusCode: 200,
            body: JSON.parse(data.Body.toString('utf-8')),
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        }
    }
}
