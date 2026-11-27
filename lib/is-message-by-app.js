import { readIssueComment } from './webhook-payload-fields.js';

/**
 * @param {import('probot').Context} context
 */
export default function isMessageByApp(context) {
  return readIssueComment(context.payload).senderLogin === 'allcontributors[bot]';
}
