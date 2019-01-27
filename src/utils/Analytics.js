const uuid = require('uuid')
const nodeFetch = require('node-fetch')

class Analytics {
    constructor({
        user,
        repo,
        owner,
        apiKey = process.env.AMPLITUDE_API_KEY,
        log,
        funnelId = uuid.v4(),
    }) {
        this.user = user
        this.repo = repo
        this.owner = owner
        this.eventPromises = []
        this.funnelId = funnelId
        this.apiKey = apiKey
        this.log = log
    }

    track(eventName, metadata = {}) {
        if (!eventName) {
            throw new Error('Analytics missing event name')
        }

        const event = {
            user_id: this.user,
            event_type: eventName,
            user_properties: {
                repo: this.repo,
                owner: this.owner,
            },
            event_properties: {
                funnel_id: this.funnelId,
                ...metadata,
            },
        }

        const inputBody = {
            api_key: this.apiKey,
            events: [
                // TODO batch up to 10 events at a time
                event,
            ],
        }

        const log = this.log
        const newEventPromise = nodeFetch('https://api.amplitude.com/batch', {
            method: 'POST',
            body: inputBody,
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
            timeout: 5000,
            redirect: 'error',
            follow: 0,
        })
            .then(response => {
                if (!response.ok) {
                    log.error(response)
                    log.error(response.json())
                }
                return response
            })
            .catch(error => {
                log.error(error)
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

module.exports = Analytics
