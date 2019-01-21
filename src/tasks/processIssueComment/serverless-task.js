const getProbot = require('../../utils/getProbot')
const probotApp = require('./probot-app')

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const probot = getProbot()
        probot.load(probotApp)

        const { name, payload } = JSON.parse(event.body)
        await probot.receive({
            name,
            payload,
        })
        return {
            statusCode: 200,
            body: 'Processed comment',
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: error.message,
        }
    }
}
