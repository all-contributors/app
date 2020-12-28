module.exports = setupRepository;

const Repository = require("./repository");
const { BranchNotFoundError } = require("./errors");

async function setupRepository({ context, branchName }) {
  const repository = new Repository(context);

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
