import isMessageByApp from './lib/is-message-by-app.js';
import isMessageForApp from './lib/is-message-for-app.js';
import CommentReply from './lib/modules/comment-reply.js';
import { AllContributorBotError } from './lib/modules/errors.js';
import processIssueComment from './lib/process-issue-comment.js';
import { readInstallation } from './lib/webhook-payload-fields.js';

/**
 * @param {import('probot').Probot} app
 */
export default (app) => {
  app.on('issue_comment.created', async (context) => {
    if (isMessageByApp(context)) return;
    if (!isMessageForApp(context)) return;

    // process comment and reply
    const commentReply = new CommentReply(context);
    try {
      await processIssueComment({ context, commentReply });
    } catch (error) {
      const isKnownError = error instanceof AllContributorBotError;
      if (!isKnownError) {
        commentReply.reply(`We had trouble processing your request. Please try again later.`);

        throw error;
      }

      context.log.info({ isKnownError, error: error.name }, error.message);
      commentReply.reply(error.message);
    } finally {
      await commentReply.send();
    }
  });

  app.on(['installation', 'installation_repositories'], async ({ name, payload, log }) => {
    const {
      accountId,
      accountLogin,
      accountType,
      action,
      installationId,
      repositories,
      repositoriesAdded,
      repositoriesRemoved,
      repositorySelection,
    } = readInstallation(payload);

    const repositoriesChange =
      action === 'created'
        ? repositories.length
        : action === 'deleted'
          ? -repositories.length
          : repositoriesAdded
            ? repositoriesAdded.length - repositoriesRemoved.length
            : 0;

    const meta = {
      event: name,
      action,
      account: accountId,
      accountType: accountType.toLowerCase(),
      accountLogin,
      installation: installationId,
      selection: repositorySelection,
      repositoriesChange,
    };
    log.info(meta, `${meta.accountLogin}: ${name} ${action}`);
  });
};
