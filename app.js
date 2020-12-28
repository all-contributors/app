const isMessageForBot = require("./lib/is-message-for-bot");
const CommentReply = require("./lib/comment-reply");
const processIssueComment = require("./lib/process-issue-comment");
const { AllContributorBotError } = require("./lib/errors");

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.on("issue_comment.created", async (context) => {
    if (context.payload.sender.login === "allcontributors[bot]") {
      // Ignore own comments
      return;
    }

    if (!isMessageForBot(context.payload.comment.body)) {
      // Ignore comments that are not for us
      return;
    }

    // process comment and reply
    const commentReply = new CommentReply({ context });
    try {
      await processIssueComment({ context, commentReply });
    } catch (error) {
      if (!(error instanceof AllContributorBotError)) {
        commentReply.reply(
          `We had trouble processing your request. Please try again later.`
        );

        throw error;
      }

      context.log.info(error);
      commentReply.reply(error.message);
    } finally {
      await commentReply.send();
    }
  });
};
