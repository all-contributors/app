module.exports = toSafeGitReferenceName;

function toSafeGitReferenceName(ref) {
  // Replace fullstops
  // ~, ^ or : ? * [
  // /
  // remove @ symbols
  // remove backslash
  return ref.replace(/[\.\[\~\^\:\?\*\@\/\\]/gi, "-");
}
