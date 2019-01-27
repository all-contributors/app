const nock = require('nock')

const Analytics = require('../../src/utils/Analytics')

describe('Analytics', () => {
    test('Analytics', async () => {
        const analytics = new Analytics({
            repo: 'all-contributors-bot',
            owner: 'all-contributors',
            user: 'mockusername',
            apiKey: 'mock api key',
            funnelId: 'mockFunnelId',
        })

        nock('https://api.amplitude.com')
            .post(`/httpapi`, body => {
                expect(body).toMatchSnapshot()
                return true
            })
            .reply(200)

        analytics.track('my-event')

        await analytics.finishQueue()
    })
})
