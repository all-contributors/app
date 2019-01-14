# Privacy Policy

Jake Bolam ("Me", "Myself", and "I") built AllContributorsBot (the "app") as an Open Source GitHub App. This service is provided by myself and is intended for use as is.

This page is used to inform users ("you") regarding my policies with the collection, use, and disclosure of personal information if anyone decided to use this service.

If you choose to use the app, then you agree to the collection and use of information in relation to this policy. The collected information is required for the service to work. It is neither stored nor shared with 3rd parties.

## Information collection and use

When installing the the app you grant it access to the following three scopes

1. **Read & write access to [pull requests](https://developer.github.com/v3/apps/permissions/#permission-on-statuses)**

   The app creates pull reuqests to add new contributors for their contributions. It requires write access to create these pull reuqests.

2. **Read & write access to [issues](https://developer.github.com/v3/apps/permissions/#permission-on-issues)**

   The app responds to comments on issues/pull-reuqests when a user types `@all-contributors` the write perimission is required for this behaviour.

3. **Read & write access to [contents](https://developer.github.com/v3/apps/permissions/#permission-on-contents)**

   The app app uses `.all-contributorsrc` to manage configuration for the app per repo, and list of contributors. It also will read & write to the `README.md` file, or any other [files configurged](https://github.com/all-contributors/all-contributors-cli#configuration) in your `.all-contributorsrc` file under the `files` key. No files will be directly updated on the default/`master` branches, all files will be updated in branches and pull-requests created.

The app receives [IssueComment](https://developer.github.com/v3/activity/events/types/#issuecommentevent) events from GitHub, but any data not required for the functionality of the app is discarded.

## Sharing of data with 3rd party services

The app is hosted on [AWS Lambda](https://aws.amazon.com/lambda/). No user data is persisted besides a temporary storage of log files for less than 30 days.

For the purpose of error tracking, error stacks are shared with [Sentry](https://sentry.io/) ([Privacy notice](https://sentry.io/privacy/)).

## Security

I value your trust in providing your personal information, thus I am striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and I cannot guarantee its absolute security.

## Changes to this privacy policy

I may update this privacy policy from time to time. Thus, you are advised to review this page periodically for any changes. I will notify you of any changes by creating a pull request on this repository and leaving it open for at least 14 days to give time for you to raise any concerns. These changes are effective immediately after they are merged into the main branch.

## Contact me

If you have any questions or suggestions about my Privacy Policy, do not hesitate to contact me at `jake.bolam@gmail.com`.

### Notes to users updating this policy
This is linked to from the github marketplace from the bots listing page
