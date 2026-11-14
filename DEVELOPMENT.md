# Development Guide

This guide explains how the All Contributors app is built, how to run
and test it locally, and how to keep your local environment aligned
with our continuous integration (CI).

## Quick Start

This guide assumes that you have `nvm` installed to manage Node
versions. `nvm` (Node Version Manager) switches which version of Node
is active. `pnpm` installs packages and runs the tests. It also
assumes that you are working in a cloned fork of the
`all-contributors/app` GitHub repository.

### Environment setup

To begin, be sure that you are using Node version 24 (what we are
running in CI), then install all dependencies using the
`pnpm-lock.yaml` lockfile.

```sh
nvm install 24
nvm use 24

pnpm install
```

### Run the bot

Start the bot locally with:

```sh
pnpm start
```

That runs `probot run ./app.js`.
To answer real GitHub events you also need a test GitHub App and a `.env` file.
Those steps are in [contributing/run-bot-locally.md](contributing/run-bot-locally.md).

### Test suite

We use [Vitest](https://vitest.dev/) as the test runner both here and for our CLI package.
You can run `pnpm test` to run the full suite and create a coverage report.

```sh
pnpm test
```

### Snapshots

A snapshot is a saved copy of some output that one of our tests produced.
You do not write a snapshot by hand. The integration tests call `toMatchSnapshot()`,
and Vitest stores the result in `test/integration/__snapshots__/`.

Two things get saved. The request body is the call the bot was about to send to the GitHub API.
The log lines are what the bot printed.
The test strips `pid`, `time`, and `hostname` from the logs first, so a timestamp does not fail the run.

The first run creates the `.snap` file.
Later runs compare the live value to that file and fail if they differ.

When you note a difference in a snapshot or output and it's one that you intentionally designed into the bot,
you can update the saved snapshot file using the `-u` flag:

```sh
pnpm test -u
```

An example of this might be changes in GitHub's API response format that you intentionally designed into the bot.

> [!IMPORTANT]
> Read the diff in your pull request before you update or merge the changes.
> A changed request body means the bot sent something different to the GitHub API.
> A changed log line means the bot printed something different to the console.
