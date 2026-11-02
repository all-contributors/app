/**
 * @param {import('probot').Context}
 */
export default function isMessageForApp(context) {
  const lowerCaseMessage = context.payload.comment.body.toLowerCase();
  return /@all-?contributors(\[bot\])?\s/.test(lowerCaseMessage);
}
