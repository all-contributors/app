const uuid = require('uuid')
const nodeFetch = require('node-fetch')
const { URLSearchParams } = require('url')

class Analytics {
    constructor({ user, repo, owner, apiKey, log, funnelId }) {
        this.user = user
        this.repo = repo
        this.owner = owner
        this.eventPromises = []
        this.funnel_id = funnelId || uuid.v4()
        this.apiKey = apiKey || process.env.AMPLITUDE_API_KEY
        this.log = log
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
                funnel_id: this.funnel_id,
                ...metadata,
            },
        }

        const events = [
            // TODO batch up to 10 events at a time
            event,
        ]

        const log = this.log

        const params = new URLSearchParams()
        params.append('api_key', this.apiKey)
        params.append('event', JSON.stringify(events))

        const newEventPromise = nodeFetch('https://api.amplitude.com/httpapi', {
            method: 'POST',
            body: params,
            timeout: 5000,
            redirect: 'error',
            follow: 0,
        })
            .then(response => {
                if (!response.ok) {
                    log.error(response)
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
