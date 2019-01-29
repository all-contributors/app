const parseComment = require('../../../../../src/tasks/processIssueComment/utils/parse-comment')

describe('parseComment', () => {
    const testBotName = 'all-contributors'

    test('Basic intent to add', () => {
        expect(
            parseComment(
                `@${testBotName} please add jakebolam for doc, infra and code`,
            ),
        ).toEqual({
            action: 'add',
            contributors: {
                jakebolam: ['doc', 'infra', 'code'],
            },
        })
    })

    test('Basic intent to add - ignore case (for action and contributions, NOT for user)', () => {
        expect(
            parseComment(
                `@${testBotName} please Add jakeBolam for DOC, inFra and coDe`,
            ),
        ).toEqual({
            action: 'add',
            contributors: {
                jakeBolam: ['doc', 'infra', 'code'],
            },
        })
    })

    test('Basic intent to add - non name username', () => {
        expect(
            parseComment(`@${testBotName} please add tbenning for design`),
        ).toEqual({
            action: 'add',
            contributors: {
                tbenning: ['design'],
            },
        })
    })

    test('Basic intent to add - captialized username', () => {
        expect(
            parseComment(`@${testBotName} please add Rbot25_RULES for tool`),
        ).toEqual({
            action: 'add',
            contributors: {
                Rbot25_RULES: ['tool'],
            },
        })
    })

    test('Basic intent to add - with plurals', () => {
        expect(
            parseComment(`@${testBotName} please add dat2 for docs`),
        ).toEqual({
            action: 'add',
            contributors: {
                dat2: ['doc'],
            },
        })
    })

    test('Support full words (like infrastructure)', () => {
        expect(
            parseComment(
                `@${testBotName} please add jakebolam for infrastructure, documentation`,
            ),
        ).toEqual({
            action: 'add',
            contributors: {
                jakebolam: ['infra', 'doc'],
            },
        })
    })

    test('Support adding people with mentions', () => {
        expect(
            parseComment(
                `@${testBotName} please add @sinchang for infrastructure`,
            ),
        ).toEqual({
            action: 'add',
            contributors: {
                sinchang: ['infra'],
            },
        })
    })

    test('Support alternative sentences', () => {
        expect(
            parseComment(`@${testBotName} add @sinchang for infrastructure`),
        ).toEqual({
            action: 'add',
            contributors: {
                sinchang: ['infra'],
            },
        })

        expect(
            parseComment(
                `Jane you are crushing it in documentation and your infrastructure work has been great too. Let's add jane.doe23 for her contributions. cc @all-contributors-bot`,
            ),
        ).toEqual({
            action: 'add',
            contributors: {
                'jane.doe23': ['doc', 'infra'],
            },
        })
    })

    test('Support split words (like user testing)', () => {
        expect(
            parseComment(
                `@${testBotName} please add jakebolam for infrastructure, fund finding`,
            ),
        ).toEqual({
            action: 'add',
            contributors: {
                jakebolam: ['infra', 'fundingFinding'],
            },
        })

        expect(
            parseComment(
                `@${testBotName} please add jakebolam for infrastructure, user testing and testing`,
            ),
        ).toEqual({
            action: 'add',
            contributors: {
                jakebolam: ['infra', 'userTesting', 'test'],
            },
        })
    })

    test('Support split words types that are referenced via other terms (e.g. a plural split word)', () => {
        expect(
            parseComment(
                `@${testBotName} please add @jakebolam for infrastructure, funds`,
            ),
        ).toEqual({
            action: 'add',
            contributors: {
                jakebolam: ['infra', 'fundingFinding'],
            },
        })
    })

    test('Intent unknown', () => {
        expect(
            parseComment(`@${testBotName} please lollmate for tool`),
        ).toEqual({
            action: false,
        })
    })
})
