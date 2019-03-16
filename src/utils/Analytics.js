const uuid = require('uuid')
const nodeFetch = require('node-fetch')
const { URLSearchParams } = require('url')

class Analytics {
    constructor({
        user,
        repo,
        owner,
        apiKey = process.env.AMPLITUDE_API_KEY,
        log,
        funnelId = uuid.v4(),
        isMock,
    }) {
        this.user = user
        this.repo = repo
        this.owner = owner
        this.eventPromises = []
        this.funnelId = funnelId
        this.apiKey = apiKey
        this.log = log
        this.isMock = isMock
    }

    track(eventName, metadata = {}) {
        const log = this.log

        if (
            process.env.NODE_ENV === 'local' ||
            (process.env.NODE_ENV === 'test' && !this.isMock)
        ) {
            log.info('Turn off Analytics in a local or test environment.')
            return
        }

        if (!eventName) {
            throw new Error('Analytics missing event name')
        }

        if (!this.apiKey) {
            throw new Error('Analytics API KEY is missing')
        }

        const event = {
            user_id: this.user.id,
            event_type: eventName,
            user_properties: {
                repo: this.repo,
                owner: this.owner,
                login: this.user.login,
            },
            event_properties: {
                funnel_id: this.funnelId,
                ...metadata,
            },
        }

        const events = [
            // TODO batch up to 10 events at a time
            event,
        ]

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
                    log.error(response.text())
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
