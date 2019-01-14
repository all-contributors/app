// TODO: put back on release of: https://github.com/probot/serverless-lambda/pull/13/files
// const { serverless } = require('@probot/serverless-lambda')
const { serverless } = require('./serverless-lambda')
const appFn = require('./')
module.exports.probot = serverless(appFn)
