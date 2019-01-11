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

// TODO
// const contributionTypeMappings = {
//     'event organizing': 'eventOrganizing',
//     'funding finding': 'fundingFinding',
//     'user testing': 'user testing',
// }

const Contributions = {}

validContributionTypes.forEach(type => {
    Contributions[type] = 'Contribution'
})

const plugin = {
    words: {
        ...Contributions,
    },
    patterns: {
        // 'add #person for #Contribution': 'AddContributor',
        // "i can't (log|sign|get) in to my? #Software": 'LoginIssue'
    },
}
nlp.plugin(plugin)

function parseAddComment(doc, action) {
    const who = doc.match(`${action} [.]`).data()[0].normal

    // TODO: handle plurals (e.g. some said docs)
    const contributions = doc
        .match('#Contribution')
        .data()
        .map(data => {
            // This removes whitespace, commas etc
            return data.normal
        })

    return {
        action: 'add',
        who,
        contributions,
    }
}

function parseComment(message) {
    const doc = nlp(message)

    if (doc.verbs().data().length === 0) {
        return {}
    }

    const action = doc.verbs().data()[0].normal
    if (action === 'add') {
        return parseAddComment(doc, action)
    }

    return {
        action,
    }
}

module.exports = parseComment
