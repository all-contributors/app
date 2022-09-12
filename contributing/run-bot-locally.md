# Local Bot Setup

> _IMPORTANT_: Please uninstall the production bot from your user account before continuing (otherwise multiple bots will respond to your comments)

To get your app running against GitHub

## 1. Create a GitHub App for testing

### 1.1 Go to your github [developer settings](https://github.com/settings/developers)

### 1.2 Create a [new github app](https://github.com/settings/apps/new)

Required fields are:

- `name`, which can be whatever you like, globally unique on github
- `homepage url`, which can be set to anything
- `webhook url`, which can be set to anything

Important fields are:

- `webhook secret`, set this to `development`
- `Permissions` which should be set [as defined in the app.yml](https://github.com/all-contributors/all-contributors-bot/blob/master/app.yml#L54), e.g. set read & write for `Repository contents`, `Issues` and `Pull Requests`, and read for `Repository Metadata`
- `Subscribe to Events` which should be set [as defined in the app.yml](https://github.com/all-contributors/all-contributors-bot/blob/master/app.yml#L15), e.g. check the checkbox for `Issue comment`
- Ensure `Where can this GitHub App be installed?` is set to `only this account`
  ![where can this app be installed](where-can-this-app-be-installed.png)

## 2. Configure Your GitHub App for testing

You should now have an app created
![my test app](app-created.png)

- On the General Tab, Click `Generate Private Key` and download it for later usage, call it something like `allcontributorsbot.pem`
- On the Install Tab, Install the app/bot on your user

## 3. Configure Your local to talk to the github app

Create a file named `.env` with the following template:

```
APP_ID=
WEBHOOK_SECRET=development
PRIVATE_KEY=
```

**Values**

- `APP_ID`, you can get this from the General tab on the developer settings for your app
- `WEBHOOK_SECRET`, leave as development (you set this on app setup)
- `PRIVATE_KEY` when you generated the private key from your app, you should have a `allcontributorsbot.pem` file locally (or similar). run `openssl base64 < allcontributorsbot.pem | tr -d '\n' | pbcopy` on the file which will copy the base64 contents onto your clipboard, paste that into the line for `PRIVATE_KEY`

## 4. Setup a test GitHub repository/with issues PR

- Setup a repository under your name (the name on github where the bot is installed)
- Enable issues and pull requests
- Create an issue
- Comment on the issue: `@all-contributors please add @jakebolam for design` (replace @jakebolam with your username)

To verify if the bot should have seen this goto [your app settings](https://github.com/settings/apps/). On the Advanced Tab, Click the most recent deliver to see the payload. It should look something like this:
![delivery comment](delivery-comment.png). Copy the payload and save it locally in a file called `test-webhook-payload.json`. Also make note of the headers under the 'Headers' section. 

## 5. Send your first hook

1. Install the node modules for the bot `yarn install`
2. Run the bot `yarn start`
3. Curl the bot (or use Postman, using the headers you got from the previous step and the content from `test-webhook-payload.json`)
   If you're using `curl`, this will look something like this:

```
curl -vX POST http://localhost:3000/ -d @test-webhook-payload.json \
--header "Content-Type: application/json" \
--header "User-Agent: GitHub-Hookshot/4d63832" \
--header "X-GitHub-Delivery: 413857f0-8b61-11eb-92be-566b7aa5f6ee" \
--header "X-GitHub-Event: issue_comment" \
--header "X-GitHub-Hook-ID: 297478976" \
--header "X-GitHub-Hook-Installation-Target-ID: 105785" \
--header "X-GitHub-Hook-Installation-Target-Type: integration" \
--header "X-Hub-Signature: sha1=ed222e6750dc2954a422ed8dd371f9da66368104" \
--header "X-Hub-Signature-256: sha256=04d0943f20545ac8df974466c502e4b9743d3618149b03f4ea1a9e658bf31fd0"
```

If there are no errors in the bot console, check your github test issue to see the bot respond :tada:

# Using [smee.io](https://smee.io/)

Alternatively, instead of having to mock the webhook payload using `curl`, you can add an additional environment variable called `WEBHOOK_PROXY_URL` and set it to a [smee.io](https://smee.io) channel URL.

Once you've done that, set the Webhook URL for you app in GitHub to the same channel URL and, after a server restart, your bot will be able to directly respond to incoming webhooks. 
