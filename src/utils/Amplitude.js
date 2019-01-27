const fetch = require('node-fetch')

class Amplitude {
    constructor({ user, repo, owner, apiKey }) {
        this.user = user
        this.repo = repo
        this.owner = owner
        this.eventPromises = []
        this.apiKey = apiKey || process.env.AMPLITUDE_API_KEY
    }

    track(eventName, metadata = {}) {
        const event = {
            user_id: this.user,
            event_type: eventName,
            user_properties: {
                repo: this.repo,
                owner: this.owner,
            },
            event_properties: {
                ...metadata,
            },
        }

        const payload = {
            api_key: this.apiKey,
            event: [
                // TODO batch up to 10 events at a time
                event,
            ],
        }

        const newEventPromise = fetch('https://api.amplitude.com/httpapi', {
            method: 'post',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
            redirect: 'error',
            follow: 0,
        }).then(response => {
            if (!response.ok) {
                // TODO: error handling
            }
        })

        this.eventPromises.push(newEventPromise)
    }

    async finishQueue() {
        if (this.eventPromises.length === 0) {
            return Promise.resolve()
        }
        return Promise.all(this.eventPromises)
    }
}

module.exports = Amplitude
