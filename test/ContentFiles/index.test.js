const fs = require('fs')
const path = require('path')

const ContentFiles = require('../../src/ContentFiles')

describe('ContentFiles', () => {
    const mockRepository = {}
    const mockTestFileContent = fs.readFileSync(
        path.join(__dirname, 'test-readme-file.md'),
        'utf8',
    )

    test(`Add's new contributor`, async () => {
        const contentFiles = new ContentFiles({
            repository: mockRepository,
        })
        contentFiles.contentFilesByPath = {
            'README.md': {
                content: mockTestFileContent,
            },
        }

        const mockOptionsConfig = {
            get: function() {
                return {
                    contributorsPerLine: 7,
                    contributors: [
                        {
                            login: 'jakebolam',
                            name: 'Jake Bolam',
                            avatar_url:
                                'https://avatars2.githubusercontent.com/u/3534236?v=4',
                            profile: 'https://jakebolam.com',
                            contributions: ['code', 'ideas', 'infra', 'test'],
                        },
                        {
                            login: 'tbenning',
                            name: 'tbenning',
                            avatar_url:
                                'https://avatars2.githubusercontent.com/u/7265547?v=4',
                            profile: 'https://github.com/tbenning',
                            contributions: ['design'],
                        },
                    ],
                }
            },
        }
        await contentFiles.generate(mockOptionsConfig)

        expect(contentFiles.get()['README.md'].content).toMatchSnapshot()
    })
})
