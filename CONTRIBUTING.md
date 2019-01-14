# Contributing
(Work in-progress)
If you're interested in helping out, come pjoin us on slack](https://join.slack.com/t/all-contributors/shared_invite/enQtNTE3ODMyMTA4NTk0LTUwZDMxZGZkMmViMzYzYzk2YTM2NjRkZGM5Yzc0ZTc5NmYzNWY3Y2Q0ZTY3ZmFhZDgyY2E3ZmIzNWQwMTUxZmE) for help getting-started


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
`yarn add serverless-dotenv-plugin`

in `serverless.yml` plugins add:
`- serverless-dotenv-plugin`


Create file test-file.json with payload
```
curl -vX POST http://localhost:3000/ -d @test-payload.json \
--header "Content-Type: application/json" \
--header "X-GitHub-Event: issue_comment"
```


## Monitoring:
Sentry: https://sentry.io/all-contributors/github-bot/
AWS Lambda: https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/all-contributors-bot-prod-githubWebhook?tab=monitoring
