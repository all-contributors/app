# Bot Architecture
Structure:
- `/src/tasks/processIsssueComment` is the root for incoming comments with the following sub components:
- `CommentReply`, deals with responding to a comment
- `ContentFiles`, or readmes files that will be re-generated updated with the table
- `OptionsConfig`, the configuraiton for the bot, and the list of contributions
- `Repository`, used by ContentFiels and OptionsConfig for getting files, updating files, creating branches and pull requests
- `utils/parse-comment` used for determing the intention of the users comment

Uses [Probot](https://github.com/probot/probot) for incoming events, and communicating/authenticating with github. [Probot docs](https://probot.github.io/docs/), [GitHub oktokit/restjs API docs](https://octokit.github.io/rest.js/)

