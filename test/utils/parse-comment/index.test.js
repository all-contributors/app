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

    test('Intent unknown', () => {
        expect(
            parseComment(`@${testBotName} please lollmate for tool`),
        ).toEqual({
            action: false,
        })
    })
    //
    // test('Basic intent to add (with plurals)', () => {
    //     expect(
    //         parseComment(`@${testBotName} please add dat2 for docs`),
    //     ).toEqual({
    //         action: 'add',
    //         who: 'dat2',
    //         contributions: ['doc'],
    //     })
    // })
})
