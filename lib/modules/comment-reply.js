import { readIssueComment } from '../webhook-payload-fields.js';

/**
 * Queues all replies, and sends in one message
 */
export default class CommentReply {
  /**
   * @param {import('probot').Context}
   */
  constructor(context) {
    this.context = context;
    this.message = '';
    this.sent = false;
  }

  replyingToWho() {
    return readIssueComment(this.context.payload).authorLogin;
  }

  replyingToWhere() {
    return readIssueComment(this.context.payload).commentUrl;
  }

  reply(message) {
    this.message += `\n\n${message}`;
  }

  async send() {
    if (this.sent) {
      throw new Error('Message already sent');
    }
    this.sent = true;
    const fromUser = this.replyingToWho();
    const body = `@${fromUser} ${this.message}`;
    this.context.log.debug(`Sending comment: ${body}`);
    const issueComment = this.context.issue({ body });
    return this.context.octokit.issues.createComment(issueComment);
  }
}
