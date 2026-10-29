import Config from "./modules/config.js";
import { ResourceNotFoundError } from "./modules/errors.js";

export default async function getConfig(repository) {
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
