const nock = require('nock')
const { Probot } = require('probot')

const allContributorsApp = require('../src')
const { rejectionOf } = require('./testUtils')

const issue_commentCreatedPayload = require('./fixtures/issue_comment.created.json')
const reposGetContentsAllContributorsRCdata = require('./fixtures/repos.getContents.all-contributorsrc.json')
const usersGetByUsernameJakeBolamdata = require('./fixtures/users.getByUsername.jakebolam.json')
const reposGetContentsREADMEMDdata = require('./fixtures/repos.getContents.README.md.json')

describe('All Contributors app - End to end', () => {
    let probot

    beforeEach(() => {
        probot = new Probot({})
        const app = probot.load(allContributorsApp)

        // just return a test token
        app.app = () => 'test'
    })

    test('Happy path, add correct new contributor', async () => {
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
            .post(
                '/repos/all-contributors/all-contributors-bot/issues/1/comments',
                body => {
                    expect(body).toMatchSnapshot()
                    return true
                },
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
                body => {
                    expect(body).toMatchSnapshot()
                    return true
                },
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
                body => {
                    expect(body).toMatchSnapshot()
                    return true
                },
            )
            .reply(200)

        await probot.receive({
            name: 'issue_comment',
            payload: issue_commentCreatedPayload,
        })
    })

    test('Fail path, no allcontributors file (repo needs setup)', async () => {
        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc',
            )
            .reply(404)

        nock('https://api.github.com')
            .post(
                '/repos/all-contributors/all-contributors-bot/issues/1/comments',
                body => {
                    expect(body).toMatchSnapshot()
                    return true
                },
            )
            .reply(200)

        await probot.receive({
            name: 'issue_comment',
            payload: issue_commentCreatedPayload,
        })
    })

    test('Fail path, Unknown error (e.g. Network is dead, service down etc, our code is bad) crashes and sends error message', async () => {
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
                body => {
                    expect(body).toMatchSnapshot()
                    return true
                },
            )
            .reply(200)

        const error = await rejectionOf(
            probot.receive({
                name: 'issue_comment',
                payload: issue_commentCreatedPayload,
            }),
        )
        expect(error instanceof Error).toBeTruthy()
        expect(error).toMatchSnapshot()
    })
})
