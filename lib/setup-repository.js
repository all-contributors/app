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
    const isBranchNotFoundError = error instanceof BranchNotFoundError;
    /* istanbul ignore if */
    if (!isBranchNotFoundError) {
      throw error;
    }

    context.log.info(
      `Branch: ${branchName} DOES NOT EXIST, will work from default branch`
    );
  }

  return repository;
}
