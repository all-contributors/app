module.exports = setupRepository;

const Repository = require("../src/tasks/processIssueComment/Repository");
const {
  BranchNotFoundError,
} = require("../src/tasks/processIssueComment/utils/errors");

async function setupRepository({ context, branchName }) {
  const defaultBranch = context.payload.repository.default_branch;
  const repository = new Repository({
    ...context.repo(),
    octokit: context.octokit,
    defaultBranch,
    log: context.log,
  });

  try {
    await repository.getRef(branchName);
    context.log.info(
      `Branch: ${branchName} EXISTS, will work from this branch`
    );
    repository.setBaseBranch(branchName);
  } catch (error) {
    if (error instanceof BranchNotFoundError) {
      context.log.info(
        `Branch: ${branchName} DOES NOT EXIST, will work from default branch`
      );
    } else {
      throw error;
    }
  }

  return repository;
}
