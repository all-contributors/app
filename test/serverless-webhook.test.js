const {
    handler: serverlessWebhookHandler,
} = require('../src/serverless-webhook')

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
        const response = await serverlessWebhookHandler(mockEvent, mockContext)
        expect(response.body).toEqual('Tracked install count')
        // TODO: expect lambda.invoke TO NOT BE CALLED
    })

    test('If not a comment (or commit_comment), exit', async () => {
        const mockEvent = {
            headers: {
                'x-github-event': 'lol',
            },
        }
        const response = await serverlessWebhookHandler(mockEvent, mockContext)
        expect(response.body).toEqual('Not a comment, exiting')
        // TODO: expect lambda.invoke TO NOT BE CALLED
    })

    test('If a comment, but not created, exit', async () => {
        const mockEvent = {
            headers: {
                'x-github-event': 'issue_comment',
            },
            body: {
                action: 'edited',
            },
        }
        const response = await serverlessWebhookHandler(mockEvent, mockContext)
        expect(response.body).toEqual('Not a comment creation, exiting')
        // TODO: expect lambda.invoke TO NOT BE CALLED
    })

    test('If a commit comment, but not created, exit', async () => {
        const mockEvent = {
            headers: {
                'x-github-event': 'issue_comment',
            },
            body: {
                action: 'edited',
            },
        }
        const response = await serverlessWebhookHandler(mockEvent, mockContext)
        expect(response.body).toEqual('Not a comment creation, exiting')
        // TODO: expect lambda.invoke TO NOT BE CALLED
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
        const response = await serverlessWebhookHandler(mockEvent, mockContext)
        expect(response.body).toEqual('Not from a user, exiting')
        // TODO: expect lambda.invoke TO NOT BE CALLED
    })

    test('Issue Comment, If not for us, exit', async () => {
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
        const response = await serverlessWebhookHandler(mockEvent, mockContext)
        expect(response.body).toEqual('Message not for us, exiting')
        // TODO: expect lambda.invoke TO NOT BE CALLED
    })

    test('Commit Comment, If not for us, exit', async () => {
        const mockEvent = {
            headers: {
                'x-github-event': 'commit_comment',
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
        const response = await serverlessWebhookHandler(mockEvent, mockContext)
        expect(response.body).toEqual('Message not for us, exiting')
        // TODO: expect lambda.invoke TO NOT BE CALLED
    })

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
