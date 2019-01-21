const OptionsConfig = require('../../src/OptionsConfig')

describe('ContentFiles', () => {
    const mockRepository = {
        repo: 'all-contributors-bot-test',
        owner: 'all-contributors',
    }
    const mockCommentReply = {}

    test(`Add's new contributor`, async () => {
        const optionsConfig = new OptionsConfig({
            repository: mockRepository,
            commentReply: mockCommentReply,
        })

        optionsConfig.options = {
            contributors: [
                {
                    login: 'jakebolam',
                    name: 'Jake Bolam',
                    avatar_url:
                        'https://avatars2.githubusercontent.com/u/3534236?v=4',
                    profile: 'https://jakebolam.com',
                    contributions: ['code', 'ideas', 'infra', 'test'],
                },
            ],
        }

        await optionsConfig.addContributor({
            login: 'tbenning',
            contributions: ['design'],
            name: 'Tyler Benning',
            avatar_url: 'https://tylerbenning.com/profile.png',
            profile: 'https://tylerbenning.com',
        })

        expect(optionsConfig.options).toMatchSnapshot()
    })

    test(`Add's new contributions for contributor`, async () => {
        const optionsConfig = new OptionsConfig({
            repository: mockRepository,
            commentReply: mockCommentReply,
        })

        optionsConfig.options = {
            contributors: [
                {
                    login: 'jakebolam',
                    name: 'Jake Bolam',
                    avatar_url:
                        'https://avatars2.githubusercontent.com/u/3534236?v=4',
                    profile: 'https://jakebolam.com',
                    contributions: ['code', 'ideas', 'infra', 'test'],
                },
            ],
        }

        await optionsConfig.addContributor({
            login: 'jakebolam',
            contributions: ['doc'],
            name: 'Jake Bolam',
            avatar_url: 'https://avatars2.githubusercontent.com/u/3534236?v=4',
            profile: 'https://jakebolam.com',
        })

        expect(optionsConfig.options).toEqual({
            contributors: [
                {
                    login: 'jakebolam',
                    name: 'Jake Bolam',
                    avatar_url:
                        'https://avatars2.githubusercontent.com/u/3534236?v=4',
                    profile: 'https://jakebolam.com',
                    contributions: ['code', 'ideas', 'infra', 'test', 'doc'],
                },
            ],
        })
    })

    test(`If profile URL is missing protocol, add it for them`, async () => {
        const optionsConfig = new OptionsConfig({
            repository: mockRepository,
            commentReply: mockCommentReply,
        })
        optionsConfig.init()

        await optionsConfig.addContributor({
            login: 'jakebolam',
            contributions: ['ideas'],
            name: 'Jake Bolam',
            avatar_url: 'https://avatars2.githubusercontent.com/u/3534236?v=4',
            profile: 'jakebolam.com',
        })

        expect(optionsConfig.options.contributors).toEqual([
            {
                login: 'jakebolam',
                name: 'Jake Bolam',
                avatar_url:
                    'https://avatars2.githubusercontent.com/u/3534236?v=4',
                profile: 'http://jakebolam.com',
                contributions: ['ideas'],
            },
        ])
    })

    test(`Inits the contributor file`, () => {
        const optionsConfig = new OptionsConfig({
            repository: mockRepository,
            commentReply: mockCommentReply,
        })

        expect(optionsConfig.options).toBeUndefined()

        optionsConfig.init()

        expect(optionsConfig.options).toEqual({
            projectName: mockRepository.repo,
            projectOwner: mockRepository.owner,
            repoType: 'github',
            repoHost: 'https://github.com',
            files: ['README.md'],
            imageSize: 100,
            commit: false,
            contributors: [],
            contributorsPerLine: 7,
        })
    })
})
