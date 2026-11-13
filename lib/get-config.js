import Config from './modules/config.js';
import { ResourceNotFoundError } from './modules/errors.js';

/**
 * Fetches the repository's `.all-contributorsrc` configuration, initializing it if missing.
 *
 * @param {object} repository
 * @returns {Promise<import('./modules/config.js').default>}
 */
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
