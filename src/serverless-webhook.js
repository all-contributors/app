const getProbot = require('./probot/getProbot')
const appFn = require('./')

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const probot = getProbot()
        probot.load(appFn)

        const name =
            event.headers['x-github-event'] || event.headers['X-GitHub-Event']
        const payload =
            typeof event.body === 'string' ? JSON.parse(event.body) : event.body
        await probot.receive({
            name,
            payload,
        })
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Received ${name}.${payload.action}`,
            }),
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        }
    }
}
