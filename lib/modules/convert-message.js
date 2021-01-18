const conv = require("commit-conv");
const Config = require("./config");

const convertMessage = (tag, message, repository) => {
  const convention = new Config({ repository }).get().commitConvention;
  return conv({
    tag,
    msg: message,
    convention,
  });
};

module.exports = convertMessage;
