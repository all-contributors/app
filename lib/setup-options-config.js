module.exports = setupOptionsConfig;

const OptionsConfig = require("./options-config");
const { ResourceNotFoundError } = require("./errors");

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
