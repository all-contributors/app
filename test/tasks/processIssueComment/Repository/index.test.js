const nock = require('nock')

const Repository = require('../../../../src/tasks/processIssueComment/Repository')

const gitGetRefdata = require('../../../fixtures/git.getRef.json')
const gitCreateRefdata = require('../../../fixtures/git.createRef.json')
const reposUpdateFiledata = require('../../../fixtures/repos.updateFile.json')
const pullsCreatedata = require('../../../fixtures/pulls.create.json')
const mockGithub = require('../../../mocks/mockGithub')

describe('Repository', () => {
    const repository = new Repository({
        repo: 'all-contributors-bot',
        owner: 'all-contributors',
        github: mockGithub,
    })

    const verifyBody = body => {
        expect(body).toMatchSnapshot()
        return true
    }

    test('create new file', async () => {
        nock('https://api.github.com')
            .put(
                `/repos/all-contributors/all-contributors-bot/contents/notes/hello.txt`,
                verifyBody,
            )
            .reply(201, reposUpdateFiledata)

        await repository.createFile({
            content: 'Hello World',
            filePath: 'notes/hello.txt',
            branchName: 'all-contributors/add-jakebolam',
        })
    })

    test('createPullRequest with files', async () => {
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

        const pullRequestNumber = await repository.createPullRequestFromFiles({
            title: 'Pull request title',
            body: 'Pull request body',
            filesByPath: {
                '.all-contributorsrc': {
                    content: JSON.stringify({ test: 'test content' }),
                    originalSha: 'aa218f56b14c9653891f9e74264a383fa43fefbe',
                },
                'README.md': {
                    content: 'Updated list',
                    originalSha: 'aa218f56b14c9653891f9e74264a383fa43fefbl',
                },
                '/nested-folder/SOME-DOC.md': {
                    content: 'Updated list in nested folder',
                    originalSha: 'aa218f56b14de653891f9e74264a383fa43fefbd',
                },
            },
            branchName: 'all-contributors/add-jakebolam',
            defaultBranch: 'master',
        })
        expect(pullRequestNumber).toEqual(
            'https://github.com/all-contributors/all-contributors-bot/pull/1347',
        )
    })
})
