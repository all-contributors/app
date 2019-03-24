# Contributing
If you're interested in helping out, come join us on [Slack](https://join.slack.com/t/all-contributors/shared_invite/enQtNTE3ODMyMTA4NTk0LTUwZDMxZGZkMmViMzYzYzk2YTM2NjRkZGM5Yzc0ZTc5NmYzNWY3Y2Q0ZTY3ZmFhZDgyY2E3ZmIzNWQwMTUxZmE) for help getting-started [![Chat on Slack](https://img.shields.io/badge/slack-join-ff69b4.svg)](https://join.slack.com/t/all-contributors/shared_invite/enQtNTE3ODMyMTA4NTk0LTUwZDMxZGZkMmViMzYzYzk2YTM2NjRkZGM5Yzc0ZTc5NmYzNWY3Y2Q0ZTY3ZmFhZDgyY2E3ZmIzNWQwMTUxZmE)


>Built with [Probot](https://github.com/probot/probot)

For more information on building apps: https://probot.github.io/docs/

To get your app running against GitHub, see: https://probot.github.io/docs/development/

GitHub APIs https://octokit.github.io/rest.js/


## Issues to work on:
[See the issues](https://github.com/all-contributors/all-contributors-bot/issues) here

Ideas not as issues yet:
- If the bot has an open pull request, don't open another one?
- How do we handle failure modes?
- Should we switch to typescript?



## Local Bot Setup

#### Create a GitHub App for testing
1. Go to your github [developer settings](https://github.com/settings/developers)
2. Create a [new github app](https://github.com/settings/apps/new) (name it whatever you like)
- Required fields are :
- `homepage url`, which can be set to anything
- `webhook url`, which can be set to anything
- Important fields are :
- `webhook secret`, set this to `development`
- `Permissions` which should we set [as defined in the app.yml](https://github.com/all-contributors/all-contributors-bot/blob/master/app.yml#L54)
- Ensure `Where can this GitHub App be installed?` is set to `only this account`

### Setup Your GitHub App for testing
You should now have an app created
![my test app]()


- `Events` which should be set [as defined in the app.yml](https://github.com/all-contributors/all-contributors-bot/blob/master/app.yml#L15)



2. Copy `.env.example` and name it `.env`, replace the following lines with content from above.
```
APP_ID=
WEBHOOK_SECRET=development
```

3. We also need to set the `PRIVATE_KEY` to do this
3. - run `openssl base64 < allcontributorsbot.pem | tr -d '\n' | pbcopy` which will copy the key, then paste it onto the line:
```
PRIVATE_KEY=
```





`yarn start-serverless`

Create file test-webhook-file.json with payload
```
curl -vX POST http://localhost:3000/ -d @test-webhook-payload.json \
--header "Content-Type: application/json" \
--header "X-GitHub-Event: issue_comment"
```

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
