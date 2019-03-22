const thundra = require('@thundra/core')({
    apiKey: process.env.LAMBDA_THUNDRA_API_KEY,
})

const getProbot = require('../../utils/getProbot')
const processIssueCommentApp = require('./probot-processIssueComment')

module.exports.handler = thundra(async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const probot = getProbot()
    probot.load(processIssueCommentApp)

    await probot.receive({
        name: event.name,
        payload: event.payload,
    })
    return {
        statusCode: 200,
        body: 'Processed comment',
    }
})
