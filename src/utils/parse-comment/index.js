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
    //@TODO add maintenance once https://github.com/all-contributors/all-contributors-cli/pull/142 is merged
]

const contributionTypeMappings = {
    'event organizing': 'eventOrganizing',
    'funding finding': 'fundingFinding',
    'user testing': 'userTesting',
    documentation: 'doc',
    infrastructure: 'infra',
    testing: 'test',
}

const Contributions = {}

validContributionTypes.forEach(type => {
    Contributions[type] = 'Contribution'
    // Add plural forms (not all possible ones tho)
    Contributions[`${type}s`] = 'Contribution'
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

    const contributions = doc
        .match('#Contribution')
        .data()
        .map(data => {
            // This removes whitespace, commas etc
            let type = data.normal
            if (type !== 'ideas' && /s$/.test(type)) type = type.slice(0, -1) //-> singular
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
