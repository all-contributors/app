const processIssueComment = require('../src/processIssueComment')
const { GIHUB_BOT_NAME } = require('../src/utils/settings')

describe('Process Issue Comment', () => {
    test('If bot, exit, do not attempt to reply', async () => {
        const mockContext = {
            isBot: true,
            log: {
                debug: jest.fn(),
            },
            github: jest.fn(),
        }
        await processIssueComment({ context: mockContext })
        expect(mockContext.log.debug).toHaveBeenCalledWith(
            'From a bot, exiting',
        )
        expect(mockContext.github).not.toHaveBeenCalled()
    })

    test('If not for us, exit, do not attempt to reply', async () => {
        const mockContext = {
            isBot: false,
            log: {
                debug: jest.fn(),
            },
            github: jest.fn(),
            payload: {
                comment: {
                    body: `Some body's message`,
                },
            },
        }
        await processIssueComment({ context: mockContext })
        expect(mockContext.log.debug).toHaveBeenCalledWith(
            'Message not for us, exiting',
        )
        expect(mockContext.github).not.toHaveBeenCalled()
    })

    // test('If there is nil contributions, inform about it', async () => {
    //     const mockContext = {
    //         isBot: false,
    //         log: {
    //             debug: jest.fn(),
    //         },
    //         github: jest.fn(),
    //         payload: {
    //             comment: {
    //                 body: `@${GIHUB_BOT_NAME} please add jakebolam for `,
    //                 user: {
    //                     login: '@Berkmann18',
    //                     html_url: '',
    //                     issue: jest.fn
    //                 }
    //             },
    //         }
    //     }
    //     await processIssueComment({ context: mockContext })
    //     expect(mockContext.log.debug).toHaveBeenCalledWith(
    //         'No contributions',
    //     )
    //    expect(mockContext.github).not.toHaveBeenCalled()
    // })
})

// 'Message not for us, exiting'
