const {
    handler: serverlessProcessCommentTaskHandler,
} = require('../../../src/tasks/processIssueComment/serverless-task')

describe('ProcessIssueComment Serverless Task', () => {
    const mockContext = {}

    test('If not an issue comment, exit', async () => {
        const mockEvent = {
            name: 'issue_comment',
            payload: {},
        }
        const response = await serverlessProcessCommentTaskHandler(
            mockEvent,
            mockContext,
        )
        expect(response.body).toEqual('Processed comment')
    })
})
