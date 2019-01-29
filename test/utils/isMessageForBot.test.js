const isMessageForBot = require('../../src/utils/isMessageForBot')

describe('isMessageForBot', () => {
    test('For us', () => {
        expect(
            isMessageForBot(
                `@all-contributors please add jakebolam for doc, infra and code`,
            ),
        ).toBe(true)

        expect(
            isMessageForBot(
                `@allcontributors[bot] please add jakebolam for doc, infra and code`,
            ),
        ).toBe(true)

        expect(
            isMessageForBot(
                `@allcontributors please add jakebolam for doc, infra and code`,
            ),
        ).toBe(true)
    })

    test('For us, case in-sensitive', () => {
        expect(
            isMessageForBot(
                `@aLL-conTRIBUtors please add jakebolam for doc, infra and code`,
            ),
        ).toBe(true)
    })

    test('Not for us', () => {
        expect(
            isMessageForBot(
                `all-contributors please add jakebolam for doc, infra and code`,
            ),
        ).toBe(false)

        expect(
            isMessageForBot(`Please add jakebolam for doc, infra and code`),
        ).toBe(false)
    })
})
