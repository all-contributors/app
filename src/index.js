/* eslint-disable camelcase */

const {
    addContributorWithDetails,
    generate: generateContentFile,
} = require('all-contributors-cli')

const { Repository, ResourceNotFoundError } = require('./repository')
// const parseComment = require('./parse-comment')

const GIHUB_BOT_NAME = '@AllContributorsBot'
const ALL_CONTRIBUTORS_RC = '.all-contributorsrc'

async function createComment({ context, body }) {
    const issueComment = context.issue({ body })
    return context.github.issues.createComment(issueComment)
}

async function getReadmeFileContentsByPath({ repository, files }) {
    if (Array.isArray(files)) {
        return repository.getMultipleFileContents(files)
    } else {
        // default 'files' is ['README.md']
        return repository.getMultipleFileContents(['README.md'])
    }
}

async function getUserDetials({ context, username }) {
    // TODO: optimzation, if commenting user is the user we're adding we can avoid an api call
    // const commentUser = context.payload.comment.user.login
    // if (user === commentUser) {
    //     return {
    //         name: context.payload.comment.user.name
    //         avatarUrl: context.payload.comment.avatar_url
    //         profile:
    //     }
    // }

    const result = await context.github.users.getByUsername({ username })
    const { avatar_url, blog, html_url, name } = result.data

    return {
        name: name || username,
        avatar_url,
        profile: blog || html_url,
    }
}

async function addContributor({
    options,
    login,
    contributions,
    name,
    avatar_url,
    profile,
}) {
    const newContributorsList = await addContributorWithDetails({
        options,
        login,
        contributions,
        name,
        avatar_url,
        profile,
    })
    return { ...options, contributors: newContributorsList }
}

async function generateContentFiles({ options, readmeFileContentsByPath }) {
    const newReadmeFileContentsByPath = {}
    Object.entires(readmeFileContentsByPath).forEach(
        ([filePath, fileContents]) => {
            const newFileContents = generateContentFile(
                options,
                options.contributors,
                fileContents,
            )
            newReadmeFileContentsByPath[filePath] = newFileContents
        },
    )
    return newReadmeFileContentsByPath
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

    let optionsFileContent
    try {
        const rawOptionsFileContent = await repository.getFileContents(
            ALL_CONTRIBUTORS_RC,
        )
        optionsFileContent = JSON.parse(rawOptionsFileContent)
        // TODO: if JSON has error report that
    } catch (error) {
        if (error instanceof ResourceNotFoundError) {
            await createComment({
                context,
                body: `@${fromUser} This project is not yet setup for [all-contributors](https://github.com/all-contributors/all-contributors).\n
You will need to first setup [${
                    repository.repo
                }](https://github.com/${repository.getFullname()}) using the [all-contributors-cli](https://github.com/all-contributors/all-contributors-cli) tool.`,
            })
            context.log(error)
            return
        }
    }
    context.log('Options Content')
    context.log(optionsFileContent)

    // TODO parse comment and gain intentions
    // const { who, contributions } = parseComment(commentBody)
    // We had trouble reading your comment. Basic usage:\n\n\`@${GIHUB_BOT_NAME} please add jakebolam for code\`
    const who = 'jakebolam'
    const contributions = ['code']

    const { name, avatar_url, profile } = await getUserDetials({
        context,
        username: who,
    })

    const newOptionsContent = await addContributor({
        options: optionsFileContent,
        login: who,
        contributions,
        name,
        avatar_url,
        profile,
    })
    context.log('New Options Content')
    context.log(newOptionsContent)

    const readmeFileContentsByPath = await getReadmeFileContentsByPath({
        repository,
        files: optionsFileContent.files,
    })

    context.log('Readme file contents by path')
    context.log(readmeFileContentsByPath)

    const newReadmeFileContentsByPath = await generateContentFiles({
        options: newOptionsContent,
        readmeFileContentsByPath,
    })
    context.log('New readme file contents by path')
    context.log(newReadmeFileContentsByPath)

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
    // Issue comments and PR comments both create issue_comment events
    app.on('issue_comment.created', async context => {
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
