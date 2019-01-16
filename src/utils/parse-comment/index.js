const nlp = require('compromise')

const validContributionTypes = [
    'blog',
    'bug',
    'code',
    'design',
    'doc',
    'eventOrganizing',
    'example',
    'financial',
    'fundingFinding',
    'ideas',
    'infra',
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
    'userTesting',
    'video',
]

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
    events: 'eventOrganizing',
    'event organizing': 'eventOrganizing',
    eventOrganizing: 'eventOrganizing',
    examples: 'example',
    finance: 'financial',
    financials: 'financial',
    funds: 'fundingFinding',
    'fund finding': 'fundingFinding',
    'funding finding': 'fundingFinding',
    idea: 'ideas',
    infras: 'infra',
    infrastructure: 'infra',
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
    translations: 'translation',
    tutorials: 'tutorial',
    'user testing': 'userTesting',
    userTesting: 'userTesting',
    videoes: 'video',
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
    patterns: {
        // 'add #person for #Contribution': 'AddContributor',
        // "i can't (log|sign|get) in to my? #Software": 'LoginIssue'
    },
}
debugger
nlp.plugin(plugin)

function parseAddComment(doc, action) {
    const whoMatched = doc
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
    debugger
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

    return {
        action: 'add',
        who,
        contributions,
    }
}

function parseComment(message) {
    const doc = nlp(message)

    const action = doc
        .match('#Action')
        .normalize()
        .out('string')

    if (action === 'add') {
        return parseAddComment(doc, action)
    }

    return {
        action: false,
    }
}

module.exports = parseComment
