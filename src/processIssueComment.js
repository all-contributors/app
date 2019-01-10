const CommentReply = require('./CommentReply')
const Repository = require('./Repository')
const OptionsConfig = require('./OptionsConfig')
const ContentFiles = require('./ContentFiles')

const getUserDetails = require('./utils/getUserDetails')
// const parseComment = require('./parse-comment')

const { GIHUB_BOT_NAME } = require('./utils/settings')
const { AllContributorBotError } = require('./utils/errors')

async function processIssueComment({ context, commentReply }) {
    const repository = new Repository({
        ...context.repo(),
        github: context.github,
    })
    const optionsConfig = new OptionsConfig({
        repository,
        commentReply,
    })
    await optionsConfig.fetch()

    // TODO parse comment and gain intentions
    // const { who, contributions } = parseComment(commentBody)
    // We had trouble reading your comment. Basic usage:\n\n\`@${GIHUB_BOT_NAME} please add jakebolam for code\`
    const who = 'jakebolam'
    const contributions = ['code']

    const { name, avatar_url, profile } = await getUserDetails({
        github: context.github,
        username: who,
    })

    await optionsConfig.addContributor({
        login: who,
        contributions,
        name,
        avatar_url,
        profile,
    })

    const contentFiles = new ContentFiles({
        context,
        repository,
    })
    await contentFiles.fetch(optionsConfig)
    await contentFiles.generate(optionsConfig)
    const filesByPathToUpdate = contentFiles.get()
    filesByPathToUpdate[optionsConfig.getPath()] = {
        content: optionsConfig.getRaw(),
        originalSha: optionsConfig.getOriginalSha(),
    }

    const pullRequestNumber = await repository.createPullRequestFromFiles({
        title: `docs: add ${who} as a contributor`,
        body: `Adds ${who} as a contributor for ${contributions.join(
            ', ',
        )}.\n\nThis was requested by ${commentReply.replyingToWho()} [in this comment](${
            commentReply.replyingToWhere
        })`,
        filesByPath: filesByPathToUpdate,
        branchName: `all-contributors/add-${who}`,
    })

    commentReply.reply(
        `I've put up [a pull request](#${pullRequestNumber}) to add ${who}! :tada:`,
    )
}

function hasMentionedBotName(context) {
    const commentBody = context.payload.comment.body
    const hasMentionedBotName = commentBody.includes(GIHUB_BOT_NAME)
    return hasMentionedBotName
}

async function processIssueCommentSafe({ context }) {
    if (context.isBot) {
        context.log.debug('From a bot, exiting')
        return
    }

    if (!hasMentionedBotName(context)) {
        context.log.debug('Message not for us, exiting')
        return
    }

    const commentReply = new CommentReply({ context })
    try {
        await processIssueComment({ context, commentReply })
    } catch (error) {
        if (error.handled) {
            context.log.debug(error)
        } else if (error instanceof AllContributorBotError) {
            context.log.error(error)
            commentReply.reply(error.message)
        } else {
            context.log.error(error)
            commentReply.reply(`We had trouble processing your request`)
            commentReply.reply(`Error: ${error.message || error.code || error}`)
            throw error
        }
    } finally {
        await commentReply.send()
    }
}

module.exports = processIssueCommentSafe
