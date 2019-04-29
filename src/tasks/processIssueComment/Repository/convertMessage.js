const conv = require('commit-conv')
const OptionsConfig = require('../OptionsConfig')

const convertMessage = (tag, message, repository) => {
    const convention = new OptionsConfig({ repository }).get().commitConvention
    return conv({
        tag,
        msg: message,
        convention,
    })
}

module.exports = convertMessage
