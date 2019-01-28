const nlp = require('compromise')

// Types that are valid (multi words must all be lower case)
const validContributionTypes = [
    'blog',
    'bug',
    'business',
    'code',
    'content',
    'design',
    'doc',
    'eventorganizing',
    'example',
    'financial',
    'fundingfinding',
    'ideas',
    'infra',
    'maintenance',
    'platform',
    'plugin',
    'question',
    'review',
    'security',
    'talk',
    'test',
    'tool',
    'translation',
    'tutorial',
    'usertesting',
    'video',
]

// Types that are valid multi words, that we need to re map back to there camelCase parts
const validMultiContributionTypesMapping = {
    eventorganizing: 'eventOrganizing',
    fundingfinding: 'fundingFinding',
    usertesting: 'userTesting',
}

// Additional terms to match to types (plurals, aliases etc)
const contributionTypeMappings = {
    blogs: 'blog',
    blogging: 'blog',
    bugs: 'bug',
    codes: 'code',
    coding: 'code',
    designing: 'design',
    desigs: 'design',
    doc: 'doc',
    docs: 'doc',
    documenting: 'doc',
    documentation: 'doc',
    examples: 'example',
    finance: 'financial',
    financials: 'financial',
    funds: 'fundingfinding',
    idea: 'ideas',
    infras: 'infra',
    infrastructure: 'infra',
    maintaining: 'maintenance',
    platforms: 'platform',
    plugins: 'plugin',
    questions: 'question',
    reviews: 'review',
    securing: 'security',
    talks: 'talk',
    tests: 'test',
    testing: 'test',
    tools: 'tool',
    tooling: 'tool',
    translating: 'translation',
    translations: 'translation',
    tutorials: 'tutorial',
    videoes: 'video',
}

// Additional terms to match to types (plurals, aliases etc) that are multi word
const contributionTypeMultiWordMapping = {
    'event organizing': 'eventOrganizing',
    'fund finding': 'fundingFinding',
    'funding finding': 'fundingFinding',
    'user testing': 'userTesting',
    'business development': 'business',
}

const Contributions = {}

validContributionTypes.forEach(type => {
    Contributions[type] = 'Contribution'
})

Object.keys(contributionTypeMappings).forEach(type => {
    Contributions[`${type}`] = 'Contribution'
})

const plugin = {
    words: {
        ...Contributions,
        add: 'Action',
    },
}

nlp.plugin(plugin)

function parseAddComment(message, action) {
    const whoMatched = nlp(message)
        .match(`${action} [.]`)
        .normalize({
            whitespace: true, // remove hyphens, newlines, and force one space between words
            case: false, // keep only first-word, and 'entity' titlecasing
            numbers: false, // turn 'seven' to '7'
            punctuation: true, // remove commas, semicolons - but keep sentence-ending punctuation
            unicode: false, // visually romanize/anglicize 'Björk' into 'Bjork'.
            contractions: false, // turn "isn't" to "is not"
            acronyms: false, //remove periods from acronyms, like 'F.B.I.'
            parentheses: false, //remove words inside brackets (like these)
            possessives: false, // turn "Google's tax return" to "Google tax return"
            plurals: false, // turn "batmobiles" into "batmobile"
            verbs: false, // turn all verbs into Infinitive form - "I walked" → "I walk"
            honorifics: false, //turn 'Vice Admiral John Smith' to 'John Smith'
        })
        .data()[0].text

    const who = whoMatched.startsWith('@') ? whoMatched.substr(1) : whoMatched

    // Contributions
    const doc = nlp(message).toLowerCase()
    // This is to support multi word 'matches' (altho the compromise docs say it supports this *confused*)
    Object.entries(contributionTypeMultiWordMapping).forEach(
        ([multiWordType, singleWordType]) => {
            doc.replace(multiWordType, singleWordType)
        },
    )
    const contributions = doc
        .match('#Contribution')
        .data()
        .map(data => {
            // This removes whitespace, commas etc
            return data.normal
        })
        .map(type => {
            if (contributionTypeMappings[type])
                return contributionTypeMappings[type]
            return type
        })
        .map(type => {
            // Convert usertesting to userTesting for the node api
            if (validMultiContributionTypesMapping[type])
                return validMultiContributionTypesMapping[type]
            return type
        })

    return {
        action: 'add',
        who,
        contributions,
    }
}

function parseComment(message) {
    const doc = nlp(message)

    const action = doc
        .toLowerCase()
        .match('#Action')
        .normalize()
        .out('string')

    if (action === 'add') {
        return parseAddComment(message, action)
    }

    return {
        action: false,
    }
}

module.exports = parseComment
