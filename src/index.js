const GIHUB_BOT_NAME = '@AllContributorsBot'
const ALL_CONTRIBUTORS_RC = '.all-contributorsrc'

const { Repository, ResourceNotFoundError} = require('./repository')
// const parseComment = require('./parse-comment')

async function createComment({ context, body }) {
    const issueComment = context.issue({ body })
    return context.github.issues.createComment(issueComment)
}

async function getReadmeFileContentsByPath({ repository, rcFileContent }) {
    if (Array.isArray(rcFileContent.files)) {
        return repository.getMultipleFileContents(rcFileContent.files)
    } else {
        // default 'files' is ['README.md']
        return repository.getMultipleFileContents(['README.md'])
    }
}

async function processNewIssueComment(context) {
    if (context.isBot) {
        context.log('From a bot, exiting')
        return
    }

    const fromUser = context.payload.comment.user.login
    const commentBody = context.payload.comment.body
    const hasMentionedBotName = commentBody.includes(GIHUB_BOT_NAME)

    if (!hasMentionedBotName) {
        context.log('Message not for us, exiting')
        return
    }

    const repository = new Repository(context)

    let rcFileContent
    try {
        rcFileContent = repository.getFileContents(ALL_CONTRIBUTORS_RC)
    } catch (error) {
        if (error instanceof ResourceNotFoundError) {
            await createComment({
                context,
                body: `@${fromUser} Please setup ${repository.getFullname()} for all-contributors using the [all-contributors-cli](https://github.com/all-contributors/all-contributors-cli) tool.`,
            })
            context.log(error)
            return
        }
    }

    // TODO parse comment and gain intentions
    // const { who, contributions } = parseComment(commentBody)
    // We had trouble reading your comment. Basic usage:\n\n\`@${GIHUB_BOT_NAME} please add jakebolam for code\`
    const who = 'jakebolam'
    const contributions = ['code']

    const readmeFileContentsByPath = getReadmeFileContentsByPath({
        repository,
        rcFileContent,
    })

    // // TODO: add PR to allContributorsCLI for node api? (Or refactor out?)
    // const {newRcFileContent, newReadmeFileContentsList} = allContributors.addContributor({
    //     rcFileContent,
    //     readmeFileContentsByPath,
    //       username: who,
    //       contributors: contributions,
    //     contextToAvoidApiCalls
    //
    // })

    // TODO: Create branch, update files
    // GET master state when we read files
    // https://octokit.github.io/rest.js/#api-Git-createRef
    // https://octokit.github.io/rest.js/#api-Repos-updateFile

    // TODO: post pull request
    // https://octokit.github.io/rest.js/#api-Pulls-createFromIssue

    // TODO: Comment back with link to pull request
}

module.exports = app => {
    // issueComment.edited
    app.on('issue_comment.created', async context => {
        app.debug(context)
        try {
            await processNewIssueComment(context)
        } catch (error) {
            await createComment({
                context,
                body: `@${
                    context.payload.comment.user.login
                } we had trouble processing your request. \n\nError: ${
                    error.message
                }`,
            })
            throw error
        }
    })
}
