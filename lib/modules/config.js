const ALL_CONTRIBUTORS_RC = ".all-contributorsrc";

const { addContributorWithDetails } = require("all-contributors-cli");

const { AllContributorBotError } = require("./errors");

class Config {
  constructor(repository, options) {
    this.repository = repository;

    this.DEFAULT_OPTIONS = {
      files: ["README.md"],
      imageSize: 100,
      commit: false,
      commitConvention: "angular",
      contributors: [],
      contributorsPerLine: 7,
      skipCi: true,
      repoType: "github",
      repoHost: "https://github.com"
    };

    this.options = Object.assign(this.DEFAULT_OPTIONS, options);
  }

  ensureValid() {
    const { repo, owner } = this.repository;

    this.get();

    this.options.projectName = repo;
    this.options.projectOwner = owner;
  }

  async fetch() {
    const {
      content: rawOptionsFileContent,
      sha,
    } = await this.repository.getFile(ALL_CONTRIBUTORS_RC);
    this.fileSha = sha;

    try {
      this.options = JSON.parse(rawOptionsFileContent);

      this.ensureValid();

      return this.options;
    } catch (error) {
      const isSyntaxError = error instanceof SyntaxError;

      /* istanbul ignore if */
      if (!isSyntaxError) throw error;

      throw new AllContributorBotError(
        `This project's configuration file has malformed JSON: ${ALL_CONTRIBUTORS_RC}. Error:: ${error.message}`
      );
    }
  }

  init() {
    this.get();
    this.ensureValid();
  }

  get() {
    const options = this.options;

    if (!Array.isArray(options.files)) {
      options.files = ["README.md"];
    }

    if (!options.commitConvention) {
      options.commitConvention = "angular";
    }

    if (!Number.isInteger(options.contributorsPerLine)) {
      options.contributorsPerLine = 7;
    }

    if (!Array.isArray(options.contributors)) {
      options.contributors = [];
    }

    return options;
  }

  getRaw() {
    return `${JSON.stringify(this.options, null, 2)}\n`;
  }

  getPath() {
    return ALL_CONTRIBUTORS_RC;
  }

  getOriginalSha() {
    return this.fileSha;
  }

  _findOldContributions(username) {
    const options = this.options;

    const contributors = options.contributors;
    // TODO: Improve `contributors` mapping from CLI
    for (let i = 0; i < contributors.length; i++) {
      if (contributors[i].login === username) {
        return contributors[i].contributions;
      }
    }

    return [];
  }

  isContributorWithRequestedContributionTypeAlreadyExists({login, contributions}) {
    const oldContributions = this._findOldContributions(login);

    // Is there new contribution type?
    return contributions.every(contributionType => oldContributions.includes(contributionType));
  }

  async addContributor({ login, contributions, name, avatar_url, profile }) {
    const options = this.options;

    const oldContributions = this._findOldContributions(login);
    const newContributions = [
      ...new Set([...oldContributions, ...contributions]),
    ];

    const newContributorsList = await addContributorWithDetails({
      options,
      login,
      contributions: newContributions,
      name,
      avatar_url,
      profile: profile,
    });
    const newOptions = {
      ...options,
      contributors: newContributorsList,
    };
    this.options = newOptions;
    return newOptions;
  }
}

module.exports = Config;
