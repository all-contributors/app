const { exec } = require('shelljs')

const getSafeRef = require('../../../src/utils/git/getSafeRef')

const testIsBranchSafe = function(branchNameIn, branchNameOut) {
    const safeRef = getSafeRef(branchNameIn)
    expect(safeRef).toEqual(branchNameOut)
    const checkFormat = exec(`git check-ref-format --branch ${safeRef}`)
    if (checkFormat.code !== 0) {
        throw new Error(`${safeRef} is not safe from git`)
    }
}

describe('getSafeRef', () => {
    test('Converts invalid chars to make ref safe', () => {
        testIsBranchSafe('all-contributors[bot]', 'all-contributors-bot]')
        testIsBranchSafe('branch.lol..', 'branch-lol--')
        testIsBranchSafe('branch^yep', 'branch-yep')
        testIsBranchSafe('branch/yep', 'branch-yep')
        testIsBranchSafe('branch\\yep', 'branch-yep')
    })
})
