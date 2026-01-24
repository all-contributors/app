# Development Guide

This guide explains how the All Contributors app is built, how to run and test it locally, and how to keep your local environment aligned with CI.

## Quick Start

This guide assumes that you have `nvm` installed to manage Node versions. It also assumes that you are working in a fork that has been cloned locally of the 
all-contributors/app repository.

### Environment setup

To begin, be sure that you are using node version 22 (what we are running in CI), install all dependencies using the package-lock.json lockfile.

```console

# Use Node 22 (same as CI)
nvm install 22
nvm use 22

# Install dependencies specified in the package-lock.json lockfile
npm ci
```

### Test suite

Next, you can run the test suite using npm.

```sh
# Run the tests
npm test
```

We use Jest as our test runner.
To update snapshots, which can need to happen when tests change and/or Jest is updated, run:

```sh
# Update Jest snapshots
npm test -- -u
```


