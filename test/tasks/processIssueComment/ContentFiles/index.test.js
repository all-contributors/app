const fs = require('fs')
const path = require('path')

const ContentFiles = require('../../../../src/tasks/processIssueComment/ContentFiles')

describe('ContentFiles', () => {
    const mockRepository = {}
    const mockTestFileContent = fs.readFileSync(
        path.join(__dirname, 'test-readme-file.md'),
        'utf8',
    )
    const mockTestFileContentNoTable = fs.readFileSync(
        path.join(__dirname, 'test-readme-file-no-table.md'),
        'utf8',
    )

    test(`Add's new contributor`, () => {
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
        contentFiles.generate(mockOptionsConfig)

        expect(contentFiles.get()['README.md'].content).toMatchSnapshot()
    })

    test(`Init content`, () => {
        const contentFiles = new ContentFiles({
            repository: mockRepository,
        })
        const mockSha = 'mock sha right here yo'
        contentFiles.contentFilesByPath = {
            'README.md': {
                content: mockTestFileContentNoTable,
                sha: mockSha,
            },
        }

        const mockOptionsConfig = {
            get: function() {
                return {
                    contributorsPerLine: 7,
                }
            },
        }
        contentFiles.init(mockOptionsConfig)

        const readme = contentFiles.get()['README.md']
        expect(readme.content).toMatchSnapshot()
        expect(readme.originalSha).toEqual(mockSha)

        const mockOptionsConfig2 = {
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
        contentFiles.generate(mockOptionsConfig2)

        const readme2 = contentFiles.get()['README.md']
        expect(readme2.content).toMatchSnapshot()
        expect(readme2.originalSha).toEqual(mockSha)
    })
})
