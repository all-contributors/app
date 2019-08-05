const serverlessWebhook = require('../src/serverless-webhook')

describe('Serverless Webhook', () => {
    const mockContext = {}

    test('If installation track the install state', async () => {
        const mockEvent = {
            headers: {
                'x-github-event': 'installation',
            },
            body: {
                installation: {
                    account: {
                        login: 'testaccount',
                    },
                },
                sender: {
                    login: 'jakebolam',
                },
            },
        }
        const spy = jest.spyOn(serverlessWebhook, 'invokeLambda')

        const response = await serverlessWebhook.handler(mockEvent, mockContext)
        expect(spy).toHaveBeenCalledTimes(0)
        expect(response.body).toEqual('Tracked install count')
    })

    test('If not an issue comment, exit', async () => {
        const mockEvent = {
            headers: {
                'x-github-event': 'lol',
            },
        }
        const spy = jest.spyOn(serverlessWebhook, 'invokeLambda')
        const response = await serverlessWebhook.handler(mockEvent, mockContext)
        expect(spy).toHaveBeenCalledTimes(0)
        expect(response.body).toEqual('Not an issue comment, exiting')
    })

    test('If an issue comment, but not created, exit', async () => {
        const mockEvent = {
            headers: {
                'x-github-event': 'issue_comment',
            },
            body: {
                action: 'edited',
            },
        }
        const spy = jest.spyOn(serverlessWebhook, 'invokeLambda')
        const response = await serverlessWebhook.handler(mockEvent, mockContext)
        expect(spy).toHaveBeenCalledTimes(0)
        expect(response.body).toEqual('Not a comment creation, exiting')
    })

    test('If bot, exit', async () => {
        const mockEvent = {
            headers: {
                'x-github-event': 'issue_comment',
            },
            body: {
                action: 'created',
                sender: {
                    type: 'Bot',
                },
            },
        }
        const spy = jest.spyOn(serverlessWebhook, 'invokeLambda')
        const response = await serverlessWebhook.handler(mockEvent, mockContext)
        expect(spy).toHaveBeenCalledTimes(0)
        expect(response.body).toEqual('Not from a user, exiting')
    })

    test('If not for us, exit', async () => {
        const mockEvent = {
            headers: {
                'x-github-event': 'issue_comment',
            },
            body: {
                action: 'created',
                sender: {
                    type: 'User',
                },
                comment: {
                    body: 'Message not for us, exiting',
                },
            },
        }
        const spy = jest.spyOn(serverlessWebhook, 'invokeLambda')
        const response = await serverlessWebhook.handler(mockEvent, mockContext)
        expect(spy).toHaveBeenCalledTimes(0)
        expect(response.body).toEqual('Message not for us, exiting')
    })

    test.todo('If User and for us, take it')
    // test('If User and for us, take it', async () => {
    //     const mockEvent = {
    //         headers: {
    //             'x-github-event': 'issue_comment',
    //         },
    //         body: {
    //             action: 'created',
    //             sender: {
    //                 type: 'User',
    //             },
    //             comment: {
    //                 body: '@all-contributors please do blah',
    //             },
    //         },
    //     }
    //     const response = await serverlessWebhookHandler(mockEvent, mockContext)
    //     expect(response.body).toEqual('Accepted and processing comment')
    //     // TODO: expect lambda.invoke TO BE CALLED
    // })
})
