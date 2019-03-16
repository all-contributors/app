const nock = require('nock')

const Analytics = require('../../src/utils/Analytics')

describe('Analytics', () => {
    test('Analytics', async () => {
        const mockFn = jest.fn()
        const analytics = new Analytics({
            repo: 'all-contributors-bot',
            owner: 'all-contributors',
            user: {
                login: 'mockusername',
                id: 1234,
            },
            apiKey: 'mock api key',
            funnelId: 'mockFunnelId',
            isMock: true,
            log: {
                error: mockFn,
                info: mockFn,
            },
        })

        nock('https://api.amplitude.com')
            .post(`/httpapi`, body => {
                expect(body).toMatchSnapshot()
                return true
            })
            .reply(200)

        analytics.track('my-event')

        await analytics.finishQueue()

        expect(mockFn).not.toHaveBeenCalled()
    })
})
