/**
 * @param {import('probot').Context} context
 */
export default function isMessageByApp(context) {
  return context.payload.sender.login === "allcontributors[bot]";
}
