// TODO: get off of fork once https://github.com/probot/serverless-lambda/pull/13/files is released

const { createProbot } = require('probot')
const { resolve } = require('probot/lib/resolver')
const { findPrivateKey } = require('probot/lib/private-key')

let probot

const loadProbot = appFn => {
    probot =
        probot ||
        createProbot({
            id: process.env.APP_ID,
            secret: process.env.WEBHOOK_SECRET,
            cert: findPrivateKey(),
        })

    if (typeof appFn === 'string') {
        appFn = resolve(appFn)
    }

    if (process.env.SENTRY_DSN) {
        probot.load(require('probot/lib/apps/sentry'))
    }
    probot.load(appFn)

    return probot
}

module.exports.serverless = appFn => {
    return async (event, context) => {
        // Otherwise let's listen handle the payload
        probot = probot || loadProbot(appFn)

        // Ends function immediately after callback
        context.callbackWaitsForEmptyEventLoop = false

        // Determine incoming webhook event type
        const e =
            event.headers['x-github-event'] || event.headers['X-GitHub-Event']

        // Convert the payload to an Object if API Gateway stringifies it
        event.body =
            typeof event.body === 'string' ? JSON.parse(event.body) : event.body

        const { info: logInfo, error: logError } = probot.apps[0].log

        // Do the thing
        logInfo(
            `Received event ${e}${
                event.body.action ? `.${event.body.action}` : ''
            }`,
        )
        if (event) {
            try {
                await probot.receive({
                    name: e,
                    payload: event.body,
                })
                const res = {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: `Received ${e}.${event.body.action}`,
                    }),
                }
                return context.done(null, res)
            } catch (err) {
                logError(err)
                return context.done(null, {
                    statusCode: 500,
                    body: JSON.stringify(err),
                })
            }
        } else {
            logError({ event, context })
            context.done(null, 'unknown error')
        }
        logInfo('Nothing to do.')
        return context.done(null, {
            statusCode: 200,
            body: 'Nothing to do.',
        })
    }
}
