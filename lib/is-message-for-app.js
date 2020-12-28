module.exports = isMessageForApp;

/**
 * @param {import('probot').Context}
 */
function isMessageForApp(context) {
  const lowerCaseMessage = context.payload.comment.body.toLowerCase();
  return (
    /@all-contributors\s/.test(lowerCaseMessage) ||
    /@allcontributors\s/.test(lowerCaseMessage) ||
    /@allcontributors\[bot\]\s/.test(lowerCaseMessage)
  );
}
