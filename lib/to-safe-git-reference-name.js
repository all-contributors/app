module.exports = toSafeGitReferenceName;

function toSafeGitReferenceName(ref) {
  // Replace fullstops
  // ~, ^ or : ? * [
  // /
  // remove @ sybmobls
  // remove backslash
  return ref.replace(/[\.\[\~\^\:\?\*\@\/\\]/gi, "-");
}
