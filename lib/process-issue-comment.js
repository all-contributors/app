module.exports = probotProcessIssueComment;

const parseComment = require("./parse-comment");
const toSafeGitReferenceName = require("./to-safe-git-reference-name");
const setupRepository = require("./setup-repository");
const setupOptionsConfig = require("./setup-options-config");
const addContributor = require("./add-contributor");

async function probotProcessIssueComment({ context, commentReply }) {
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

  const safeWho = toSafeGitReferenceName(who);
  const branchName = `all-contributors/add-${safeWho}`;

  const repository = await setupRepository({
    context,
    branchName,
  });
  const optionsConfig = await setupOptionsConfig({ repository });

  repository.skipCiString = optionsConfig.options.skipCi ? "[skip ci]" : "";

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
