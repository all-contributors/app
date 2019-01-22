/* eslint-disable no-comment */

const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

const isMessageForBot = require('./utils/isMessageForBot')

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const name =
            event.headers['x-github-event'] || event.headers['X-GitHub-Event']
        const payload =
            typeof event.body === 'string' ? JSON.parse(event.body) : event.body

        if (name !== 'issue_comment') {
            return {
                statusCode: 201,
                body: 'Not an issue comment, exiting',
            }
        }

        if (payload.action !== 'created') {
            return {
                statusCode: 201,
                body: 'Not a comment creation, exiting',
            }
        }

        if (payload.sender.type !== 'User') {
            return {
                statusCode: 201,
                body: 'Not from a user, exiting',
            }
        }

        const commentBody = payload.comment.body
        if (!isMessageForBot(commentBody)) {
            return {
                statusCode: 202,
                body: 'Message not for us, exiting',
            }
        }

        const processIssueCommentPayload = JSON.stringify({
            name,
            payload,
        })

        lambda.invoke({
            FunctionName: `${
                process.env.SERVICE_NAME_AND_STAGE
            }-processIssueComment`,
            InvocationType: 'Event',
            LogType: 'None',
            Payload: new Buffer(processIssueCommentPayload),
        })

        return {
            statusCode: 200,
            body: 'Accepted and processing comment',
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: error.message,
        }
    }
}
