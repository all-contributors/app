function generateValidProfileLink(blog, githubProfileURL) {
  const validRegexWithScheme = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
  const validRegexWithoutScheme = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
  if (validRegexWithoutScheme.test(blog)) return `http://${blog}`;
  if (validRegexWithScheme.test(blog)) return blog;
  return githubProfileURL || ''
}

function generatePrBody(message, skipCi) {
  return skipCi ? message.concat('\n\n[skip ci]') : message;
}

function generatePrTitle(message, contributions) {
  const contributionsTitlePartLimit = 3

  let contributionsTitlePartText = contributions.join(', ')

  const arr = contributions.slice(0, contributionsTitlePartLimit);
  if (contributions.length > contributionsTitlePartLimit) arr[arr.length - 1] = `${contributions.length - 2} more`
  if (arr.length > 1) contributionsTitlePartText = arr.slice(0, arr.length - 1).join(', ') + ", and " + arr.slice(-1);
  
  return [message, `for ${contributionsTitlePartText}`].join(' ')
}

module.exports = {
  generatePrBody,
  generatePrTitle,
  generateValidProfileLink,
}
