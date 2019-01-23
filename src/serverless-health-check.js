module.exports.handler = async (event, context) => { // eslint-disable-line
    // TODO: add real health check
    return {
        statusCode: 200,
        body: 'Service is healthy',
    }
}
