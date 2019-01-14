const OptionsConfig = require('../../src/OptionsConfig')

describe('ContentFiles', () => {
    const mockRepository = {}
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
})
