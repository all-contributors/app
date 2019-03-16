# Contributing
(Work in-progress)
If you're interested in helping out, come join us on [Slack](https://join.slack.com/t/all-contributors/shared_invite/enQtNTE3ODMyMTA4NTk0LTUwZDMxZGZkMmViMzYzYzk2YTM2NjRkZGM5Yzc0ZTc5NmYzNWY3Y2Q0ZTY3ZmFhZDgyY2E3ZmIzNWQwMTUxZmE) for help getting-started


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



### Testing serverless locally

TODO: make smee plugin for serverless

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
- [Sentry](https://sentry.io/all-contributors/github-bot/)
- [AWS Lambda](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/all-contributors-bot-prod-githubWebhook?tab=monitoring)
- [Bot Stats](https://gkioebvccg.execute-api.us-east-1.amazonaws.com/prod/probot/stats)
- [Analytics](https://analytics.amplitude.com/all-contributors)
- Coming Soon [All Contributors Usage Stats](d)
