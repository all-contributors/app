function generateValidProfileLink(blog, githubProfileURL) {
  const validRegexWithScheme = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
  const validRegexWithoutScheme = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
  if (validRegexWithScheme.test(blog)) return blog;
  if (validRegexWithoutScheme.test(blog)) return `http://${blog}`;
  return githubProfileURL || ''
}

module.exports = {
  generateValidProfileLink
}
