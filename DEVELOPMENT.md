# Development Guide

This guide shows you how to set up the all-contributors bot on your
computer, run the tests and linter, and match what runs in our
continuous integration (CI).

Before you start, please read [CONTRIBUTING.md](CONTRIBUTING.md). We ask
that you open an issue before you open a pull request.

## How the project is built

* **Runtime:** Node.js 22, the same version CI uses.
* **Framework:** [Probot](https://probot.github.io/), a framework for
  building GitHub Apps. The entry point is [`app.js`](app.js).
* **Language:** JavaScript. The bot logic lives in [`lib/`](lib) and the
  tests live in [`test/`](test).
* **Tests:** [Vitest](https://vitest.dev/), configured in
  [`vitest.config.ts`](vitest.config.ts).
* **Formatting:** [Prettier](https://prettier.io/).

To learn how the code fits together, see
[Bot architecture](contributing/bot-architecture.md).

## Set up your environment

This guide assumes that you have [nvm](https://github.com/nvm-sh/nvm)
installed to manage Node versions, and that you have cloned your fork of
[all-contributors/app](https://github.com/all-contributors/app).

```sh
# Use Node 22 (same as CI)
nvm install 22
nvm use 22

# Install the exact dependency versions from package-lock.json
npm ci
```

## Run the tests

```sh
npm test
```

This runs Vitest once with coverage. A few options can help when you
debug:

* `npx vitest run test/unit` runs only the tests in one folder.
* `npx vitest` runs in watch mode and reruns tests when you save a file.
* `npm test -- --no-file-parallelism` runs test files one at a time,
  which helps you track down flaky tests.

### Snapshots

A snapshot is a saved copy of some output that one of our tests
produced. You don't write a snapshot by hand. The integration tests call
`toMatchSnapshot()`, and Vitest stores the result in
`test/integration/__snapshots__/`.

Two things get saved. The request body is the call the bot was about to
send to the GitHub API. The log lines are what the bot printed. The test
strips `pid`, `time`, and `hostname` from the logs first, so a timestamp
doesn't fail the run.

The first run creates the `.snap` file. Later runs compare the live value
to that file and fail if they differ.

If you changed that output on purpose, update the saved snapshots with
the `-u` flag:

```sh
npm test -- -u
```

Read the snapshot diff before you commit it. A changed request body means
the bot now sends something different to the GitHub API. A changed log
line means the bot prints something different. Commit the updated `.snap`
files with your change.

## Check formatting

```sh
# Check formatting
npm run lint

# Fix formatting
npm run lint:fix
```

> [!NOTE]
> The lint scripts check `src/` and `test/`, but not `lib/`. Fixing that is
> tracked in the upgrade plan.

## Run the bot locally

The tests don't talk to GitHub. To see the bot reply to a real comment,
you create your own GitHub App and point it at the bot on your computer.
Follow [Run the bot locally](contributing/run-bot-locally.md) for the
steps.

## Match CI

The [test workflow](.github/workflows/test.yml) runs on Ubuntu with
Node 22. It runs `npm ci`, then `npm test`, then uploads coverage to
Codecov.

To avoid "works on my computer but fails in CI":

* Run `nvm use 22` before you work.
* Install with `npm ci` so you get the versions in `package-lock.json`.

## Test someone else's pull request

```sh
git remote add upstream https://github.com/all-contributors/app.git
git fetch upstream pull/<PR_NUMBER>/head:pr-<PR_NUMBER>
git checkout pr-<PR_NUMBER>
npm ci
npm test
```

## Before you open a pull request

* `npm ci` works on Node 22.
* `npm test` passes, and you committed any updated snapshots.
* `npm run lint` is clean.
* Your pull request links to the issue where we discussed the change.

## Troubleshooting

* **`ELSPROBLEMS` or invalid dependency versions:** your installed
  packages don't match `package-lock.json`. Switch to Node 22, then run
  `rm -rf node_modules && npm ci`.
* **Tests pass locally but fail in CI:** check that `node -v` shows 22,
  and run `npm test -- --no-file-parallelism`.
* **The bot behaves differently from the tests:** replay a real webhook,
  as shown in [Run the bot locally](contributing/run-bot-locally.md).

## See how the bot is used

The [All Contributors bot usage dashboard](https://all-contributors.github.io/dashboard/)
shows active installations over time and how many pull requests the bot
opens each month.
