const parseComment = require('../../../src/utils/parse-comment')
const { GIHUB_BOT_NAME } = require('../../../src//utils/settings')

describe('parseComment', () => {
    test('Basic intent to add', () => {
        expect(
            parseComment(
                `@${GIHUB_BOT_NAME} please add jakebolam for doc, infra and code`,
            ),
        ).toEqual({
            action: 'add',
            who: 'jakebolam',
            contributions: ['doc', 'infra', 'code'],
        })
    })

    test('Basic intent to add - non name username', () => {
        expect(
            parseComment(
                `@${GIHUB_BOT_NAME} please add tbenning for design`,
            ),
        ).toEqual({
            action: 'add',
            who: 'tbenning',
            contributions: ['design'],
        })

        expect(
            parseComment(
                `@${GIHUB_BOT_NAME} please add Rbot25_RULES for design`,
            ),
        ).toEqual({
            action: 'add',
            who: 'Rbot25_RULES',
            contributions: ['tools'],
        })
    })
    //
    // test('Basic intent to add (with plurals)', () => {
    //     expect(
    //         parseComment(
    //             `@${GIHUB_BOT_NAME} please add jakebolam for docs, infra and code`,
    //         ),
    //     ).toEqual({
    //         action: 'add',
    //         who: 'jakebolam',
    //         contributions: ['doc', 'infra', 'code'],
    //     })
    // })
})
