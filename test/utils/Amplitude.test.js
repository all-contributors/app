const nock = require('nock')

const Amplitude = require('../../src/utils/Amplitude')

describe('Amplitude', () => {
    test('Amplitude', async () => {
        const amplitude = new Amplitude({
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

        amplitude.track('my-event')

        await amplitude.finishQueue()
    })
})
