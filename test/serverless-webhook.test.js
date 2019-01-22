const {
    handler: serverlessWebhookHandler,
} = require('../src/serverless-webhook')

describe('Serverless Webhook', () => {
    test('If bot, exit, do not attempt to reply', async () => {
        // const mockLambda = jest.fn()
        // jest.mock('aws-sdk', {
        //     Lambda: mockLambda,
        // })
        const mockEvent = {
            headers: {
                'x-github-event': 'issue_comment',
            },
            body: {
                action: 'created',
                sender: {
                    type: 'Bot',
                },
                comment: {
                    body: 'Test',
                },
            },
        }
        const mockContext = {}
        const response = await serverlessWebhookHandler(mockEvent, mockContext)
        expect(response.body).toEqual('Not from a user, exiting')
        //expect(mockLambda.invoke).not.toHaveBeenCalled()
    })
})
