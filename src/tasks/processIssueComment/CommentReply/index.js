/*
 *  Queues all replies, and sends in one message
 */
class CommentReply {
    constructor({ context }) {
        this.context = context
        this.message = ''
        this.sent = false
    }

    replyingToWho() {
        return this.context.payload.comment.user.login
    }

    replyingToWhere() {
        return this.context.payload.comment.html_url
    }

    reply(message) {
        this.message += `\n\n${message}`
    }

    async send() {
        if (this.sent) {
            throw new Error('Message already sent')
        }
        this.sent = true
        const fromUser = this.replyingToWho()
        const body = `@${fromUser} ${this.message}`
        this.context.log.info(`Sending comment: ${body}`)

        const isCommitComment = !!this.context.payload.comment.commit_id
        if (isCommitComment) {
            const {
                commit_id: sha,
                path,
                position,
            } = this.context.payload.comment

            return this.context.github.repos.createCommitComment({
                ...this.context.repo(),
                sha,
                body,
                path: path ? path : undefined,
                position: position ? position : undefined,
            })
        }

        const issueComment = this.context.issue({ body })
        return this.context.github.issues.createComment(issueComment)
    }
}

module.exports = CommentReply
