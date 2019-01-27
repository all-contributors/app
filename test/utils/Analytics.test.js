const nock = require('nock')

const Analytcs = require('../../src/utils/Analytcs')

describe('Analytcs', () => {
    test('Analytcs', async () => {
        const analytics = new Analytcs({
            repo: 'all-contributors-bot',
            owner: 'all-contributors',
            user: 'mockusername',
            apiKey: 'mock api key',
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
