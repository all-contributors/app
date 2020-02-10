function isMessageForBot(message) {
    const lowerCaseMessage = message.toLowerCase()
    const isMessageForBot =
        /@all-contributors\s/.test(lowerCaseMessage) ||
        /@allcontributors\s/.test(lowerCaseMessage) ||
        /@allcontributors\[bot\]\s/.test(lowerCaseMessage)
    return isMessageForBot
}

module.exports = isMessageForBot
