const nock = require('nock')
const { Probot } = require('probot')

const processIssueCommentApp = require('../../../src/tasks/processIssueComment/probot-processIssueComment')
const { rejectionOf } = require('../../testUtils')

const issue_commentCreatedPayload = require('../../fixtures/issue_comment.created.json')
const reposGetContentsAllContributorsRCdata = require('../../fixtures/repos.getContents.all-contributorsrc.json')
const usersGetByUsernameJakeBolamdata = require('../../fixtures/users.getByUsername.jakebolam.json')
const reposGetContentsREADMEMDdata = require('../../fixtures/repos.getContents.README.md.json')
const gitGetRefdata = require('../../fixtures/git.getRef.json')
const gitCreateRefdata = require('../../fixtures/git.createRef.json')
const reposUpdateFiledata = require('../../fixtures/repos.updateFile.json')
const pullsCreatedata = require('../../fixtures/pulls.create.json')

describe('All Contributors app - End to end', () => {
    let probot

    const verifyBody = body => {
        expect(body).toMatchSnapshot()
        return true
    }

    beforeEach(() => {
        probot = new Probot({})
        const app = probot.load(processIssueCommentApp)

        // just return a test token
        app.app = () => 'test'
    })

    test('Happy path, add correct new contributor', async () => {
        jest.setTimeout(10000)

        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc',
            )
            .reply(200, reposGetContentsAllContributorsRCdata)

        nock('https://api.github.com')
            .get('/users/jakebolam')
            .reply(200, usersGetByUsernameJakeBolamdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/README.md',
            )
            .reply(200, reposGetContentsREADMEMDdata)

        nock('https://api.github.com')
            .get(
                `/repos/all-contributors/all-contributors-bot/git/refs/heads/master`,
            )
            .reply(200, gitGetRefdata)

        nock('https://api.github.com')
            .post(
                `/repos/all-contributors/all-contributors-bot/git/refs`,
                verifyBody,
            )
            .reply(201, gitCreateRefdata)

        nock('https://api.github.com')
            .put(
                `/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc`,
                verifyBody,
            )
            .reply(200, reposUpdateFiledata)

        nock('https://api.github.com')
            .put(
                `/repos/all-contributors/all-contributors-bot/contents/README.md`,
                verifyBody,
            )
            .reply(200, reposUpdateFiledata)

        nock('https://api.github.com')
            .put(
                `/repos/all-contributors/all-contributors-bot/contents//nested-folder/SOME-DOC.md`,
                verifyBody,
            )
            .reply(200, reposUpdateFiledata)

        nock('https://api.github.com')
            .post(
                `/repos/all-contributors/all-contributors-bot/pulls`,
                verifyBody,
            )
            .reply(201, pullsCreatedata)

        nock('https://api.github.com')
            .post(
                '/repos/all-contributors/all-contributors-bot/issues/1/comments',
                verifyBody,
            )
            .reply(200)

        await probot.receive({
            name: 'issue_comment',
            payload: issue_commentCreatedPayload,
        })
    })

    test('Happy path, add correct new contributor, no allcontributors file (repo needs init first)', async () => {
        jest.setTimeout(10000)

        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc',
            )
            .reply(404)

        nock('https://api.github.com')
            .get('/users/jakebolam')
            .reply(200, usersGetByUsernameJakeBolamdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/README.md',
            )
            .reply(200, reposGetContentsREADMEMDdata)

        nock('https://api.github.com')
            .get(
                `/repos/all-contributors/all-contributors-bot/git/refs/heads/master`,
            )
            .reply(200, gitGetRefdata)

        nock('https://api.github.com')
            .post(
                `/repos/all-contributors/all-contributors-bot/git/refs`,
                verifyBody,
            )
            .reply(201, gitCreateRefdata)

        nock('https://api.github.com')
            .put(
                `/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc`,
                verifyBody,
            )
            .reply(201, reposUpdateFiledata)

        nock('https://api.github.com')
            .put(
                `/repos/all-contributors/all-contributors-bot/contents/README.md`,
                verifyBody,
            )
            .reply(200, reposUpdateFiledata)

        nock('https://api.github.com')
            .put(
                `/repos/all-contributors/all-contributors-bot/contents//nested-folder/SOME-DOC.md`,
                verifyBody,
            )
            .reply(200, reposUpdateFiledata)

        nock('https://api.github.com')
            .post(
                `/repos/all-contributors/all-contributors-bot/pulls`,
                verifyBody,
            )
            .reply(201, pullsCreatedata)

        nock('https://api.github.com')
            .post(
                '/repos/all-contributors/all-contributors-bot/issues/1/comments',
                verifyBody,
            )
            .reply(200)

        await probot.receive({
            name: 'issue_comment',
            payload: issue_commentCreatedPayload,
        })
    })

    test('Fail path, no readme file (configuration error)', async () => {
        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc',
            )
            .reply(200, reposGetContentsAllContributorsRCdata)

        nock('https://api.github.com')
            .get('/users/jakebolam')
            .reply(200, usersGetByUsernameJakeBolamdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/README.md',
            )
            .reply(404)

        nock('https://api.github.com')
            .post(
                '/repos/all-contributors/all-contributors-bot/issues/1/comments',
                verifyBody,
            )
            .reply(200)

        await probot.receive({
            name: 'issue_comment',
            payload: issue_commentCreatedPayload,
        })
    })

    test('Fail path, no such user', async () => {
        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc',
            )
            .reply(200, reposGetContentsAllContributorsRCdata)

        nock('https://api.github.com')
            .get('/users/jakebolam')
            .reply(404)

        nock('https://api.github.com')
            .post(
                '/repos/all-contributors/all-contributors-bot/issues/1/comments',
                verifyBody,
            )
            .reply(200)

        await probot.receive({
            name: 'issue_comment',
            payload: issue_commentCreatedPayload,
        })
    })

    test('Fail path, Unknown error (e.g. Network is dead, service down etc, our code is bad) crashes and sends error message', async () => {
        jest.setTimeout(20000)

        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc',
            )
            .reply(500)

        nock('https://api.github.com')
            .post(
                '/repos/all-contributors/all-contributors-bot/issues/1/comments',
                verifyBody,
            )
            .reply(200)

        const error = await rejectionOf(
            probot.receive({
                name: 'issue_comment',
                payload: issue_commentCreatedPayload,
            }),
        )
        expect(error instanceof Error).toBeTruthy()
    })
})
