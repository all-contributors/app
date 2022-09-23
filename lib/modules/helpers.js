function generateValidLink(url, username) {
  let validLink = url
  let validUsername = username || 'all-contributors'

  const validRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
  const validRegexWithoutProtocol = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/

  if (validLink.match(validRegexWithoutProtocol)) validLink = `http://${url}/`
  if (!validLink.match(validRegex)) validLink = `https://github.com/${validUsername}/`

  return validLink
}

module.exports = {
  generateValidLink
}
