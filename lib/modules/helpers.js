function generateValidLink(url, username = '') {
  let validLink = url
  const validRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/

  if (!validLink.startsWith("http")) validLink = `http://${url}/`
  if (!validLink.match(validRegex)) validLink = `https://github.com/${username}/`

  return validLink
}

module.exports = {
  generateValidLink
}
