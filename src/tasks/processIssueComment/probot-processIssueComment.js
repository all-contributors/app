const Analytics = require('../../utils/Analytics')
const CommentReply = require('./CommentReply')
const Repository = require('./Repository')
const OptionsConfig = require('./OptionsConfig')
const ContentFiles = require('./ContentFiles')

const getUserDetails = require('./utils/getUserDetails')
const parseComment = require('./utils/parse-comment')

const {
    AllContributorBotError,
    BranchNotFoundError,
    ResourceNotFoundError,
} = require('./utils/errors')

const getSafeRef = require('./utils/git/getSafeRef')

async function processAddContributor({
    context,
    commentReply,
    repository,
    optionsConfig,
    who,
    contributions,
    branchName,
}) {
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
        repository,
    })
    await contentFiles.fetch(optionsConfig)
    if (optionsConfig.getOriginalSha() === undefined) {
        contentFiles.init()
    }
    contentFiles.generate(optionsConfig)
    const filesByPathToUpdate = contentFiles.get()
    filesByPathToUpdate[optionsConfig.getPath()] = {
        content: optionsConfig.getRaw(),
        originalSha: optionsConfig.getOriginalSha(),
    }

    const {
        pullRequestURL,
        pullCreated,
    } = await repository.createPullRequestFromFiles({
        title: `docs: add ${who} as a contributor`,
        body: `Adds @${who} as a contributor for ${contributions.join(
            ', ',
        )}.\n\nThis was requested by ${commentReply.replyingToWho()} [in this comment](${commentReply.replyingToWhere()})`,
        filesByPath: filesByPathToUpdate,
        branchName,
    })

    if (pullCreated) {
        commentReply.reply(
            `I've put up [a pull request](${pullRequestURL}) to add @${who}! :tada:`,
        )
        return
    }
    // Updated
    commentReply.reply(
        `I've updated [the pull request](${pullRequestURL}) to add @${who}! :tada:`,
    )
}

async function setupRepository({ context, branchName }) {
    const defaultBranch = context.payload.repository.default_branch
    const repository = new Repository({
        ...context.repo(),
        github: context.github,
        defaultBranch,
        log: context.log,
    })

    try {
        await repository.getRef(branchName)
        context.log.info(
            `Branch: ${branchName} EXISTS, will work from this branch`,
        )
        repository.setBaseBranch(branchName)
    } catch (error) {
        if (error instanceof BranchNotFoundError) {
            context.log.info(
                `Branch: ${branchName} DOES NOT EXIST, will work from default branch`,
            )
        } else {
            throw error
        }
    }

    return repository
}

async function setupOptionsConfig({ repository }) {
    const optionsConfig = new OptionsConfig({
        repository,
    })

    try {
        await optionsConfig.fetch()
    } catch (error) {
        if (error instanceof ResourceNotFoundError) {
            optionsConfig.init()
        } else {
            throw error
        }
    }

    return optionsConfig
}

async function probotProcessIssueComment({ context, commentReply, analytics }) {
    const commentBody = context.payload.comment.body
    analytics.track('processComment', {
        commentBody: commentBody,
    })
    const { who, action, contributions } = parseComment(commentBody)

    if (action === 'add') {
        analytics.track('addContributor', {
            who: commentBody,
            contributions: contributions,
        })
        const safeWho = getSafeRef(who)
        const branchName = `all-contributors/add-${safeWho}`

        const repository = await setupRepository({
            context,
            branchName,
        })
        const optionsConfig = await setupOptionsConfig({ repository })

        await processAddContributor({
            context,
            commentReply,
            repository,
            optionsConfig,
            who,
            contributions,
            branchName,
        })
        analytics.track('processCommentSuccess')
        return
    }

    analytics.track('unknownIntent', {
        action,
    })

    commentReply.reply(`I could not determine your intention.`)
    commentReply.reply(
        `Basic usage: @all-contributors please add @jakebolam for code, doc and infra`,
    )
    commentReply.reply(
        `For other usages see the [documentation](https://github.com/all-contributors/all-contributors-bot#usage)`,
    )
    return
}

async function probotProcessIssueCommentSafe({ context }) {
    const analytics = new Analytics({
        ...context.repo(),
        user: context.payload.sender.login,
        log: context.log,
    })
    const commentReply = new CommentReply({ context })
    try {
        await probotProcessIssueComment({ context, commentReply, analytics })
    } catch (error) {
        if (error instanceof AllContributorBotError) {
            context.log.info(error)
            commentReply.reply(error.message)
            analytics.track('errorKnown', {
                errorMessage: error.message,
            })
        } else {
            context.log.error(error)
            commentReply.reply(
                `We had trouble processing your request. Please try again later.`,
            )
            analytics.track('errorUnKnown', {
                errorMessage: error.message,
            })
            throw error
        }
    } finally {
        await commentReply.send()
        await analytics.finishQueue()
    }
}

function processIssueCommentApp(app) {
    // issueComment.edited
    // Issue comments and PR comments both create issue_comment events
    app.on('issue_comment.created', async context => {
        app.log.trace(context)
        await probotProcessIssueCommentSafe({ context })
    })
}

module.exports = processIssueCommentApp
