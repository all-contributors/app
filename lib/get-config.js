module.exports = getConfig;

const Config = require("./modules/config");
const { ResourceNotFoundError } = require("./modules/errors");

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
