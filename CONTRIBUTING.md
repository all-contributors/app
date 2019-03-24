# Contributing
If you're interested in helping out, come join us on [Slack](https://join.slack.com/t/all-contributors/shared_invite/enQtNTE3ODMyMTA4NTk0LTUwZDMxZGZkMmViMzYzYzk2YTM2NjRkZGM5Yzc0ZTc5NmYzNWY3Y2Q0ZTY3ZmFhZDgyY2E3ZmIzNWQwMTUxZmE) for help getting-started [![Chat on Slack](https://img.shields.io/badge/slack-join-ff69b4.svg)](https://join.slack.com/t/all-contributors/shared_invite/enQtNTE3ODMyMTA4NTk0LTUwZDMxZGZkMmViMzYzYzk2YTM2NjRkZGM5Yzc0ZTc5NmYzNWY3Y2Q0ZTY3ZmFhZDgyY2E3ZmIzNWQwMTUxZmE)

For issues to work on, [see the issues tab](https://github.com/all-contributors/all-contributors-bot/issues)

## App Architecture
Structure:
- `/src/tasks/processIsssueComment` is the root for incoming comments with the following sub components:
- `CommentReply`, deals with responding to a comment
- `ContentFiles`, or readmes files that will be re-generated updated with the table
- `OptionsConfig`, the configuraiton for the bot, and the list of contributions
- `Repository`, used by ContentFiels and OptionsConfig for getting files, updating files, creating branches and pull requests
- `utils/parse-comment` used for determing the intention of the users comment

Uses [Probot](https://github.com/probot/probot) for incoming events, and communicating/authenticating with github. [Probot docs](https://probot.github.io/docs/), [GitHub oktokit/restjs API docs](https://octokit.github.io/rest.js/)


## Local Bot Setup
IMPORTANT: Please uninstall the production bot from your user account before continuing (otherwise multiple bots will respond to your comments)

To get your app running against GitHub

### 1. Create a GitHub App for testing
1. Go to your github [developer settings](https://github.com/settings/developers)
2. Create a [new github app](https://github.com/settings/apps/new) (name it whatever you like)
- Required fields are :
- `homepage url`, which can be set to anything
- `webhook url`, which can be set to anything
- Important fields are :
- `webhook secret`, set this to `development`
- `Permissions` which should we set [as defined in the app.yml](https://github.com/all-contributors/all-contributors-bot/blob/master/app.yml#L54), e.g. set read & write for `Repository contents`, `Issues` and `Pull Requests`, and read for `Repository Metadata`
- `Subscrive to Events` which should we set [as defined in the app.yml](https://github.com/all-contributors/all-contributors-bot/blob/master/app.yml#L15), e.g. check the checkbox for `Issue comment`
- Ensure `Where can this GitHub App be installed?` is set to `only this account`
![where can this app be installed](contributing/where-can-this-app-be-installed.png)

### 2. Configure Your GitHub App for testing
You should now have an app created
![my test app](contributing/app-created.png)

- On the General Tab, Click `Generate Private Key` and download it for later usage
- On the Install Tab, Install the app on your user


### 3. Configure Your local to talk to the github app
Copy `.env.example` and name it `.env`, replace the following lines with content from above.
```
APP_ID=
WEBHOOK_SECRET=development
PRIVATE_KEY=
```
- `APP_ID`, you can get this from the General tab on the developer settings for your app
- `WEBHOOK_SECRET`, leave as development (you set this on app setup)
- `PRIVATE_KEY` when you generated the private key from your app, you should have a .pem file locally. run `openssl base64 < allcontributorsbot.pem | tr -d '\n' | pbcopy` on the file which will but the base64 contents on your keyboard, paste that into the line for PRIVATE_KEY

### 4. Setup a test github repository/with issues PR
- Setup a repostiory under your name (the name on github where the bot is installed)
- Enable issues and pull reuqests
- Create an issue
- Comment on the issue: `@all-contributors please add @jakebolam for design` (replace @jakebolam with your username)

To verify if the bot should have seen this goto [your app settings](https://github.com/settings/apps/). On the Advaced Tab, Click the most recent deliever to see the payload. It should look something like this:
![delivery comment](contributing/delivery-comment.png). Copy the payload and save it locally in a file called `test-webhook-payload.json`


### 5. Send your first hook
1. Install the node modules for the bot`yarn install`
2. Run the bot `yarn start`
3. Curl the bot (or use postman, with 2 headers and the content from `test-webhook-payload.json`)
If you're using curl it would look like:
```
curl -vX POST http://localhost:3000/ -d @test-webhook-payload.json \
--header "Content-Type: application/json" \
--header "X-GitHub-Event: issue_comment"
```

If there are no errors in the bot console, check your github test issue to see the bot respond :tada:

## Working with forks:
### Syncing a fork
1. `git remote add parent git@github.com:all-contributors/all-contributors-bot.git`
2. `git fetch parent`
3. `git checkout master` or `git checkout empty-contribs` (this branch on your fork)
4. `git merge parent/master`

See https://help.github.com/articles/syncing-a-fork/





## Deployments
There is a sandbox environment:
https://github.com/all-contributors-sandbox


## Production Monitoring:
- [Thundra](https://console.thundra.io/functions/)
- [Sentry](https://sentry.io/all-contributors/github-bot/)
- [AWS Dashboard](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=All-Contributors-Bot)
- [AWS Lambda](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/all-contributors-bot-prod-githubWebhook?tab=monitoring)
- [Bot Stats](https://gkioebvccg.execute-api.us-east-1.amazonaws.com/prod/probot/stats)
- [Analytics](https://analytics.amplitude.com/all-contributors)
- Coming Soon [All Contributors Usage Stats](d)
