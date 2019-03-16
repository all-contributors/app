const Analytics = require('../../utils/Analytics')

function getTrackName(action) {
    if (action === 'deleted') {
        return 'Deleted'
    } else if (action === 'created') {
        return 'Created'
    } else {
        return 'Unknown'
    }
}

async function trackInstall(payload) {
    const analytics = new Analytics({
        owner: payload.installation.account.login,
        user: payload.sender.login,
        log: {
            info: console.log, // eslint-disable-line no-console
            error: console.error, // eslint-disable-line no-console
        },
    })

    const trackName = getTrackName(payload.action)
    analytics.track(`trackInstallation${trackName}`, {
        action: payload.action,
        installation: payload.installation,
        repositories: payload.repositories && payload.repositories.length,
    })

    await analytics.finishQueue()
}

module.exports = trackInstall
