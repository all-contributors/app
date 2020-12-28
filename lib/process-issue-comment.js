module.exports = processIssueComment;

const parseComment = require("./parse-comment");
const toSafeGitReferenceName = require("./to-safe-git-reference-name");
const setupRepository = require("./setup-repository");
const setupOptionsConfig = require("./setup-options-config");
const addContributor = require("./add-contributor");

async function processIssueComment({ context, commentReply }) {
  const commentBody = context.payload.comment.body;
  const { who, action, contributions } = parseComment(commentBody);

  if (action !== "add") {
    commentReply.reply(`I could not determine your intention.`);
    commentReply.reply(
      `Basic usage: @all-contributors please add @someone for code, doc and infra`
    );
    commentReply.reply(
      `For other usages see the [documentation](https://allcontributors.org/docs/en/bot/usage)`
    );
    return;
  }

  if (contributions.length === 0) {
    context.log.debug("No contributions");
    return commentReply.reply(
      `I couldn't determine any contributions to add, did you specify any contributions?
          Please make sure to use [valid contribution names](https://allcontributors.org/docs/en/emoji-key).`
    );
  }

  const branchName = `all-contributors/add-${toSafeGitReferenceName(who)}`;

  // set up repository instance. Uses branch if it exists, falls back to repository's default branch
  const repository = await setupRepository({ context, branchName });

  // loads configuration from repository. Initializes config if file does not exist
  const optionsConfig = await setupOptionsConfig(repository);

  repository.setSkipCi(optionsConfig.options.skipCi);

  await addContributor({
    context,
    commentReply,
    repository,
    optionsConfig,
    who,
    contributions,
    branchName,
  });
}
