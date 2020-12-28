module.exports = getConfig;

const Config = require("./config");
const { ResourceNotFoundError } = require("./errors");

async function getConfig(repository) {
  const config = new Config(repository);

  try {
    await config.fetch();
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      config.init();
    } else {
      throw error;
    }
  }

  return config;
}
