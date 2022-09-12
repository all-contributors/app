const {
  generate: generateContentFile,
  initBadge,
  initContributorsList,
} = require("all-contributors-cli");

const { AllContributorBotError } = require("./errors");

/*
 *  Fetches, stores, generates, and updates the files containing the contributors table
 *
 *  many repositories have the contributors table in two files:
 *  1. README.md
 *  2. A documentation file, e.g. docs/index.md
 *  Some repos have translations and want the contributors table to be updated in all languages,
 *  e.g. https://github.com/injoon5/carbon/blob/master/.all-contributorsrc
 */
class ContentFiles {
  constructor({ repository }) {
    this.repository = repository;
    this.contentFilesByPath = null;
  }

  async fetch(config) {
    const options = config.get();
    if (options.files.length > 25) {
      throw new AllContributorBotError(
        `Your .all-contributorsrc cannot contain more than 25 files.`
      );
    }
    this.contentFilesByPath = await this.repository.getMultipleFiles(
      options.files
    );
  }

  init() {
    const newFilesByPath = modifyFiles({
      contentFilesByPath: this.contentFilesByPath,
      fileContentModifierFunction: function (content) {
        const contentWithBadge = initBadge(content);
        const contentWithList = initContributorsList(contentWithBadge);
        return contentWithList;
      },
    });
    this.contentFilesByPath = newFilesByPath;
  }

  generate(config) {
    const options = config.get();
    const newFilesByPath = modifyFiles({
      contentFilesByPath: this.contentFilesByPath,
      fileContentModifierFunction: function (content) {
        return generateContentFile(options, options.contributors, content);
      },
    });
    this.contentFilesByPath = newFilesByPath;
  }

  get() {
    return this.contentFilesByPath;
  }
}

module.exports = ContentFiles;

function modifyFiles({ contentFilesByPath, fileContentModifierFunction }) {
  const newFilesByPath = {};
  Object.entries(contentFilesByPath).forEach(
    ([filePath, { content, sha, originalSha }]) => {
      const newFileContents = fileContentModifierFunction(content);
      newFilesByPath[filePath] = {
        content: newFileContents,
        originalSha: sha || originalSha,
      };
    }
  );
  return newFilesByPath;
}
