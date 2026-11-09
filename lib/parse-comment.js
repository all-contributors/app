import nlp from 'compromise';

// Types that are valid (multi words must all be lower case)
const validContributionTypes = [
  'a11y',
  'audio',
  'blog',
  'bug',
  'business',
  'code',
  'content',
  'data',
  'design',
  'doc',
  'eventorganizing',
  'example',
  'financial',
  'fundingfinding',
  'ideas',
  'infra',
  'maintenance',
  'mentoring',
  'platform',
  'plugin',
  'projectManagement',
  'promotion',
  'question',
  'research',
  'review',
  'security',
  'talk',
  'test',
  'tool',
  'translation',
  'tutorial',
  'usertesting',
  'video',
];

// Types that are valid multi words, that we need to re map back to their camelCase parts
const validMultiContributionTypesMapping = {
  eventorganizing: 'eventOrganizing',
  fundingfinding: 'fundingFinding',
  usertesting: 'userTesting',
  projectmanagement: 'projectManagement',
};

// Additional terms to match to types (plurals, aliases etc)
const contributionTypeMappings = {
  accessibility: 'a11y',
  advertisement: 'promotion',
  blogs: 'blog',
  blogging: 'blog',
  bugs: 'bug',
  codes: 'code',
  coding: 'code',
  dataset: 'data',
  datasets: 'data',
  designing: 'design',
  designs: 'design',
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
  management: 'projectManagement',
  managing: 'projectManagement',
  mentor: 'mentoring',
  music: 'audio',
  platforms: 'platform',
  plugins: 'plugin',
  project: 'projectManagement',
  projectManaging: 'projectManagement',
  questions: 'question',
  reviews: 'review',
  securing: 'security',
  sound: 'audio',
  talks: 'talk',
  tests: 'test',
  testing: 'test',
  tools: 'tool',
  tooling: 'tool',
  translator: 'translation',
  translating: 'translation',
  translations: 'translation',
  tutorials: 'tutorial',
  videos: 'video',
};

// Additional terms to match to types (plurals, aliases etc) that are multi word
const contributionTypeMultiWordMapping = {
  'audio production': 'audio',
  'audio recording': 'audio',
  'music production': 'audio',
  'data collection': 'data',
  'data collections': 'data',
  'data set': 'data',
  'data sets': 'data',
  'event organising': 'eventOrganizing',
  'event organizing': 'eventOrganizing',
  'fund finding': 'fundingFinding',
  'funding finding': 'fundingFinding',
  'user testing': 'userTesting',
  'business development': 'business',
  'project management': 'projectManagement',
  'social media': 'promotion',
};

const Contributions = {};

validContributionTypes.forEach((type) => {
  Contributions[type] = 'Contribution';
});

Object.keys(contributionTypeMappings).forEach((type) => {
  Contributions[`${type}`] = 'Contribution';
});

const plugin = {
  words: {
    ...Contributions,
    add: 'Action',
  },
};

nlp.plugin(plugin);

function findWho(message, action) {
  function findWhoSafe(match) {
    message = message.replace(/-/g, '#/#'); // workaround (https://github.com/spencermountain/compromise/issues/726)
    const whoNormalizeSettings = {
      // compromise v14 runs every key listed here, even ones set to false,
      // so only list the options you want turned on
      whitespace: true, // collapse newlines and extra spaces into one space
      punctuation: true, // remove commas and semicolons, and turn dashes into spaces
    };
    const matchedSet = nlp(message).match(match).normalize(whoNormalizeSettings).groups();

    if (matchedSet[0] && matchedSet[0].found) {
      const matchedText = matchedSet[0].text();
      return matchedText.replace(/#\/#/g, '-');
    }
  }

  // TODO: Unused
  //const whoMatchedMention = findWhoSafe(`@[.]`);
  // if (whoMatchedMention) {
  //   return whoMatchedMention;
  // }

  const whoMatchedByAction = findWhoSafe(`${action} [.]`);
  if (whoMatchedByAction) {
    return whoMatchedByAction;
  }

  const whoMatchedByFor = findWhoSafe(`[.] for`);
  if (whoMatchedByFor) {
    return whoMatchedByFor;
  }
}

function parseAddSentence(message, action) {
  message = message
    .split(',')
    .map((e) => e.trim())
    .join(', ');

  const whoMatched = findWho(message, action);
  if (!whoMatched) {
    return {
      who: undefined,
    };
  }

  const who = whoMatched.startsWith('@') ? whoMatched.substr(1) : whoMatched;

  // Contributions
  const doc = nlp(message).toLowerCase();
  // This is to support multi word 'matches' (altho the compromise docs say it supports this *confused*)
  Object.entries(contributionTypeMultiWordMapping).forEach(([multiWordType, singleWordType]) => {
    doc.replace(multiWordType, singleWordType);
  });

  const rawContributions = doc
    .match('#Contribution')
    .not('#AtMention')
    .json()
    .map((data) => {
      // This removes whitespace, commas etc
      return data.terms.map((term) => term.normal).join(' ');
    });

  const contributions = doc
    .match('#Contribution')
    .not('#AtMention')
    .json()
    .map((data) => {
      // This removes whitespace, commas etc
      return data.terms.map((term) => term.normal).join(' ');
    })
    .filter((element, index) => {
      return rawContributions.indexOf(element) === index;
    })
    .map((type) => {
      if (contributionTypeMappings[type]) return contributionTypeMappings[type];
      return type;
    })
    .map((type) => {
      // Convert usertesting to userTesting for the node api
      if (validMultiContributionTypesMapping[type]) return validMultiContributionTypesMapping[type];
      return type;
    });

  return {
    who,
    contributions,
  };
}

function parseAddComment(message, action) {
  const contributors = {};

  const sentences = nlp(message).sentences();
  sentences.forEach(function (sentence) {
    const sentenceRaw = sentence.data()[0].text;
    const { who, contributions } = parseAddSentence(sentenceRaw, action);

    if (who) {
      contributors[who] = contributions;
    }
  });

  return {
    action: 'add',
    contributors,
  };
}

function parseComment(message) {
  const doc = nlp(message.toLowerCase());

  const action = doc.match('#Action').normalize().out('string');

  if (action.match('add')) {
    return parseAddComment(message, action);
  }

  return {
    action: false,
  };
}

export default parseComment;
