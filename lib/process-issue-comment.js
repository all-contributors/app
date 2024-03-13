module.exports = processIssueComment;

const parseComment = require("./parse-comment");
const toSafeGitReferenceName = require("./to-safe-git-reference-name");
const setupRepository = require("./setup-repository");
const getConfig = require("./get-config");
const addContributor = require("./add-contributor");

async function processIssueComment({ context, commentReply }) {
  const commentBody = context.payload.comment.body;
  const repo = context.payload.repository;
  const createdBy = context.payload.comment.user;

  const { action, contributors } = parseComment(commentBody);

  if (action !== "add") {
    context.log.info(`Unknown action "${action}"`);
    commentReply.reply(`I could not determine your intention.`);
    commentReply.reply(
      `Basic usage: @all-contributors please add @someone for code, doc and infra`
    );
    commentReply.reply(
      `For other usages see the [documentation](https://allcontributors.org/docs/en/bot/usage)`
    );
    return;
  }

  let pullCreated = false;

  for (var contributor in contributors) {
    const who = contributor;
    const contributions = contributors[who];
    const branchName = `all-contributors/add-${toSafeGitReferenceName(who)}`;

    const log = context.log.child({
      who,
      action,
      contributions,
      account: repo.owner.id,
      accountType: repo.owner.type.toLowerCase(),
      accountLogin: repo.owner.login,
      createdBy: createdBy.id,
      createdByLogin: createdBy.login,
      createdByType: createdBy.type.toLowerCase(),
      repository: repo.id,
      private: repo.private,
      success: false,
    });

    pullCreated ||= await triggerActionAdd(
      context,
      commentReply,
      log,
      who,
      contributions,
      branchName
    );
  }

  if (!pullCreated) {
    commentReply.reply(
      `I couldn't determine any contributions to add, did you specify any contributions?
        Please make sure to use [valid contribution names](https://allcontributors.org/docs/en/emoji-key).`
    );
  }
}

async function triggerActionAdd(
  context,
  commentReply,
  log,
  who,
  contributions,
  branchName
) {
  if (contributions.length === 0) {
    log.info(`No contributions for ${who}`);
    return false;
  }

  // set up repository instance. Uses branch if it exists, falls back to repository's default branch
  const repository = await setupRepository({ context, branchName });

  // loads configuration from repository. Initializes config if file does not exist
  const config = await getConfig(repository);

  repository.setSkipCi(config.options.skipCi);

  // TODO: Add implement to support single PR
  const { pullCreated, user } = await addContributor({
    context,
    commentReply,
    repository,
    config,
    who,
    contributions,
    branchName,
  });

  if (!pullCreated) {
    log.info(
      {
        pullCreated,
        success: true,
      },
      `${who} already have ${contributions.join(", ")}`
    );
  } else {
    log.info(
      {
        pullCreated,
        success: true,
        createdFor: user.id,
        createdForType: "user",
        createdForLogin: user.login.toLowerCase(),
      },
      `${who} added for ${contributions.join(", ")}`
    );
  }
  return true;
}
