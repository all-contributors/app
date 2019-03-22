const nock = require('nock')
const { Probot } = require('probot')

const processIssueCommentApp = require('../../../src/tasks/processIssueComment/probot-processIssueComment')
const { rejectionOf } = require('../../testUtils')

const issue_commentCreatedPayload = require('../../fixtures/issue_comment.created.json')
const issue_commentCreatedPayloadUnknownIntention = require('../../fixtures/issue_commented.created.unknown-intention.json')
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
        probot = new Probot({
            id: 123,
            cert: `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQC2RTg7dNjQMwPzFwF0gXFRCcRHha4H24PeK7ey6Ij39ay1hy2o
H9NEZOxrmAb0bEBDuECImTsJdpgI6F3OwkJGsOkIH09xTk5tC4fkfY8N7LklK+uM
ndN4+VUXTPSj/U8lQtCd9JnnUL/wXDc46wRJ0AAKsQtUw5n4e44f+aYggwIDAQAB
AoGAW2/cJs+WWNPO3msjGrw5CYtZwPuJ830m6RSLYiAPXj0LuEEpIVdd18i9Zbht
fL61eoN7NEuSd0vcN1PCg4+mSRAb/LoauSO3HXote+6Lhg+y5mVYTNkE0ZAW1zUb
HOelQp9M6Ia/iQFIMykhrNLqMG9xQIdLH8BDGuqTE+Eh8jkCQQDyR6qfowD64H09
oYJI+QbsE7yDOnG68tG7g9h68Mp089YuQ43lktz0q3fhC7BhBuSnfkBHwMztABuA
Ow1+dP9FAkEAwJeYJYxJN9ron24IePDoZkL0T0faIWIX2htZH7kJODs14OP+YMVO
1CPShdTIgFeVp/HlAY2Qqk/do2fzyueZJwJBAN5GvdUjmRyRpJVMfdkxDxa7rLHA
huL7L0wX1B5Gl5fgtVlQhPhgWvLl9V+0d6csyc6Y16R80AWHmbN1ehXQhPkCQGfF
RsV0gT8HRLAiqY4AwDfZe6n8HRw/rnpmoe7l1IHn5W/3aOjbZ04Gvzg9HouIpaqI
O8xKathZkCKrsEBz6aECQQCLgqOCJz4MGIVHP4vQHgYp8YNZ+RMSfJfZA9AyAsgP
Pc6zWtW2XuNIGHw9pDj7v1yDolm7feBXLg8/u9APwHDy
-----END RSA PRIVATE KEY-----`,
        })

        probot.load(processIssueCommentApp)
    })

    test('1:Happy path, add correct new contributor', async () => {
        jest.setTimeout(10000)
        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                `/repos/all-contributors/all-contributors-bot/git/refs/heads/all-contributors/add-jakebolam`,
            )
            .reply(404)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master',
            )
            .reply(200, reposGetContentsAllContributorsRCdata)

        nock('https://api.github.com')
            .get('/users/jakebolam')
            .reply(200, usersGetByUsernameJakeBolamdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/README.md?ref=master',
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

    test('2:Happy path, add correct new contributor, no allcontributors file (repo needs init first)', async () => {
        jest.setTimeout(10000)

        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                `/repos/all-contributors/all-contributors-bot/git/refs/heads/all-contributors/add-jakebolam`,
            )
            .reply(404)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master',
            )
            .reply(404)

        nock('https://api.github.com')
            .get('/users/jakebolam')
            .reply(200, usersGetByUsernameJakeBolamdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/README.md?ref=master',
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

    test('3:Fail path, no readme file (configuration error)', async () => {
        jest.setTimeout(10000)

        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                `/repos/all-contributors/all-contributors-bot/git/refs/heads/all-contributors/add-jakebolam`,
            )
            .reply(404)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master',
            )
            .reply(200, reposGetContentsAllContributorsRCdata)

        nock('https://api.github.com')
            .get('/users/jakebolam')
            .reply(200, usersGetByUsernameJakeBolamdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/README.md?ref=master',
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

    test('4:Fail path, no such user', async () => {
        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                `/repos/all-contributors/all-contributors-bot/git/refs/heads/all-contributors/add-jakebolam`,
            )
            .reply(404)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master',
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

    test('5: Fail path, Unknown user intention', async () => {
        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master',
            )
            .reply(200, reposGetContentsAllContributorsRCdata)

        nock('https://api.github.com')
            .post(
                '/repos/all-contributors/all-contributors-bot/issues/1/comments',
                verifyBody,
            )
            .reply(200)

        await probot.receive({
            name: 'issue_comment',
            payload: issue_commentCreatedPayloadUnknownIntention,
        })
    })

    test('6:Fail path, Unknown error (e.g. Network is dead, service down etc, our code is bad) crashes and sends error message', async () => {
        jest.setTimeout(20000)

        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                `/repos/all-contributors/all-contributors-bot/git/refs/heads/all-contributors/add-jakebolam`,
            )
            .reply(404)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master',
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

    test('7: Happy path, add correct new contributor, but branch exists', async () => {
        jest.setTimeout(20000)
        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                `/repos/all-contributors/all-contributors-bot/git/refs/heads/all-contributors/add-jakebolam`,
            )
            .reply(200, gitGetRefdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc',
            )
            .query({ ref: 'all-contributors/add-jakebolam' })
            .reply(200, reposGetContentsAllContributorsRCdata)

        nock('https://api.github.com')
            .get('/users/jakebolam')
            .reply(200, usersGetByUsernameJakeBolamdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/README.md',
            )
            .query({ ref: 'all-contributors/add-jakebolam' })
            .reply(200, reposGetContentsREADMEMDdata)

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

    test('8: Happy path, add correct new contributor, but branch exists and PR is open', async () => {
        jest.setTimeout(10000)

        nock('https://api.github.com')
            .post('/app/installations/11111/access_tokens')
            .reply(200, { token: 'test' })

        nock('https://api.github.com')
            .get(
                `/repos/all-contributors/all-contributors-bot/git/refs/heads/all-contributors/add-jakebolam`,
            )
            .reply(200, gitGetRefdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc',
            )
            .query({ ref: 'all-contributors/add-jakebolam' })
            .reply(200, reposGetContentsAllContributorsRCdata)

        nock('https://api.github.com')
            .get('/users/jakebolam')
            .reply(200, usersGetByUsernameJakeBolamdata)

        nock('https://api.github.com')
            .get(
                '/repos/all-contributors/all-contributors-bot/contents/README.md',
            )
            .query({ ref: 'all-contributors/add-jakebolam' })
            .reply(200, reposGetContentsREADMEMDdata)

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
            .persist()
            .post(
                `/repos/all-contributors/all-contributors-bot/pulls`,
                verifyBody,
            )
            .reply(422)

        nock('https://api.github.com')
            .post(
                '/repos/all-contributors/all-contributors-bot/issues/1/comments',
                verifyBody,
            )
            .reply(200)

        probot.receive({
            name: 'issue_comment',
            payload: issue_commentCreatedPayload,
        })
    })
})
