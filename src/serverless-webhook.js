/* eslint-disable no-comment */
const thundra = require('@thundra/core')({
    apiKey: process.env.LAMBDA_THUNDRA_API_KEY,
})

const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

const trackInstall = require('./tasks/trackInstall')
const isMessageForBot = require('./utils/isMessageForBot')

function invokeLambda(payload) {
    const processIssueCommentPayload = JSON.stringify(payload)

    if (process.env.IS_OFFLINE) {
        const { exec } = require('shelljs')
        const result = exec(
            `./node_modules/.bin/serverless invoke local --function processIssueComment --data '${processIssueCommentPayload}'`,
        )
        if (result.code !== 0) {
            return Promise.reject('Invoking function failed')
        }
        return Promise.resolve()
    }

    return new Promise(function(resolve, reject) {
        lambda.invoke(
            {
                FunctionName: `${
                    process.env.SERVICE_NAME_AND_STAGE
                }-processIssueComment`,
                InvocationType: 'Event',
                LogType: 'None',
                Payload: new Buffer(processIssueCommentPayload),
            },
            function(error, data) {
                if (error) {
                    reject(error)
                } else {
                    resolve(data)
                }
            },
        )
    })
}

module.exports.handler = thundra(async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const name =
        event.headers['x-github-event'] || event.headers['X-GitHub-Event']
    const payload =
        typeof event.body === 'string' ? JSON.parse(event.body) : event.body

    if (name === 'installation') {
        await trackInstall(payload)

        return {
            statusCode: 200,
            body: 'Tracked install count',
        }
    }

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

    await invokeLambda({
        name,
        payload,
    })

    return {
        statusCode: 200,
        body: 'Accepted and processing comment',
    }
})
