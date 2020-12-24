module.exports = setupOptionsConfig;

const OptionsConfig = require("../src/tasks/processIssueComment/OptionsConfig");
const {
  ResourceNotFoundError,
} = require("../src/tasks/processIssueComment/utils/errors");

async function setupOptionsConfig({ repository }) {
  const optionsConfig = new OptionsConfig({
    repository,
  });

  try {
    await optionsConfig.fetch();
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      optionsConfig.init();
    } else {
      throw error;
    }
  }

  return optionsConfig;
}
