import { readIssueComment } from './webhook-payload-fields.js';

/**
 * @param {import('probot').Context}
 */
export default function isMessageForApp(context) {
  const lowerCaseMessage = readIssueComment(context.payload).commentBody.toLowerCase();
  return /@all-?contributors(\[bot\])?\s/.test(lowerCaseMessage);
}
