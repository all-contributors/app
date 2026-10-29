import isMessageByApp from "./lib/is-message-by-app.js";
import isMessageForApp from "./lib/is-message-for-app.js";
import CommentReply from "./lib/modules/comment-reply.js";
import processIssueComment from "./lib/process-issue-comment.js";
import { AllContributorBotError } from "./lib/modules/errors.js";

/**
 * @param {import('probot').Probot} app
 */
export default (app) => {
  app.on("issue_comment.created", async (context) => {
    if (isMessageByApp(context)) return;
    if (!isMessageForApp(context)) return;

    // process comment and reply
    const commentReply = new CommentReply(context);
    try {
      await processIssueComment({ context, commentReply });
    } catch (error) {
      const isKnownError = error instanceof AllContributorBotError;
      if (!isKnownError) {
        commentReply.reply(
          `We had trouble processing your request. Please try again later.`
        );

        throw error;
      }

      context.log.info({ isKnownError, error: error.name }, error.message);
      commentReply.reply(error.message);
    } finally {
      await commentReply.send();
    }
  });

  app.on(
    ["installation", "installation_repositories"],
    async ({ name, payload, log }) => {
      const {
        action,
        repositories,
        repositories_added,
        repositories_removed,
        installation,
      } = payload;

      const repositoriesChange =
        action === "created"
          ? repositories.length
          : action === "deleted"
          ? -repositories.length
          : repositories_added
          ? repositories_added.length - repositories_removed.length
          : 0;

      const meta = {
        event: name,
        action,
        account: installation.account.id,
        accountType: installation.account.type.toLowerCase(),
        accountLogin: installation.account.login,
        installation: installation.id,
        selection: installation.repository_selection,
        repositoriesChange,
      };
      log.info(meta, `${meta.accountLogin}: ${name} ${action}`);
    }
  );
};
