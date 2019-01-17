const parseComment = require('../../../src/utils/parse-comment')

describe('parseComment', () => {
    const testBotName = 'AllContributorsBotTest'

    test('Basic intent to add', () => {
        expect(
            parseComment(
                `@${testBotName} please add jakebolam for doc, infra and code`,
            ),
        ).toEqual({
            action: 'add',
            who: 'jakebolam',
            contributions: ['doc', 'infra', 'code'],
        })
    })

    test('Basic intent to add - ignore case (for action and contributions, NOT for user)', () => {
        expect(
            parseComment(
                `@${testBotName} please Add jakeBolam for DOC, inFra and coDe`,
            ),
        ).toEqual({
            action: 'add',
            who: 'jakeBolam',
            contributions: ['doc', 'infra', 'code'],
        })
    })

    test('Basic intent to add - non name username', () => {
        expect(
            parseComment(`@${testBotName} please add tbenning for design`),
        ).toEqual({
            action: 'add',
            who: 'tbenning',
            contributions: ['design'],
        })
    })

    test('Basic intent to add - captialized username', () => {
        expect(
            parseComment(`@${testBotName} please add Rbot25_RULES for tool`),
        ).toEqual({
            action: 'add',
            who: 'Rbot25_RULES',
            contributions: ['tool'],
        })
    })

    test('Basic intent to add - with plurals', () => {
        expect(
            parseComment(`@${testBotName} please add dat2 for docs`),
        ).toEqual({
            action: 'add',
            who: 'dat2',
            contributions: ['doc'],
        })
    })

    test('Support full words (like infrastructure)', () => {
        expect(
            parseComment(
                `@${testBotName} please add jakebolam for infrastructure, documentation`,
            ),
        ).toEqual({
            action: 'add',
            who: 'jakebolam',
            contributions: ['infra', 'doc'],
        })
    })

    test('Support adding people with mentions', () => {
        expect(
            parseComment(
                `@${testBotName} please add @sinchang for infrastructure`,
            ),
        ).toEqual({
            action: 'add',
            who: 'sinchang',
            contributions: ['infra'],
        })
    })

    test('Support alternative sentences', () => {
        expect(
            parseComment(`@${testBotName} add @sinchang for infrastructure`),
        ).toEqual({
            action: 'add',
            who: 'sinchang',
            contributions: ['infra'],
        })

        expect(
            parseComment(
                `Jane you're crushing it in documentation and infrastructure, let's add jane.doe23 for her contributions. cc @${testBotName}`,
            ),
        ).toEqual({
            action: 'add',
            who: 'jane.doe23',
            contributions: ['doc', 'infra'],
        })
    })

    test('Support split words (like user testing)', () => {
        expect(
            parseComment(
                `@${testBotName} please add jakebolam for infrastructure, fund finding`,
            ),
        ).toEqual({
            action: 'add',
            who: 'jakebolam',
            contributions: ['infra', 'fundingFinding'],
        })

        expect(
            parseComment(
                `@${testBotName} please add jakebolam for infrastructure, user testing and testing`,
            ),
        ).toEqual({
            action: 'add',
            who: 'jakebolam',
            contributions: ['infra', 'userTesting', 'test'],
        })
    })

    test('Support split words types that are referenced via other terms (e.g. a plural split word)', () => {
        expect(
            parseComment(
                `@${testBotName} please add @jakebolam for infrastructure, funds`,
            ),
        ).toEqual({
            action: 'add',
            who: 'jakebolam',
            contributions: ['infra', 'fundingFinding'],
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
