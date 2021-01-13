module.exports = isMessageForApp;

/**
 * @param {import('probot').Context}
 */
function isMessageForApp(context) {
  const lowerCaseMessage = context.payload.comment.body.toLowerCase();
  return /@all-?contributors(\[bot\])?\s/.test(lowerCaseMessage);
}
