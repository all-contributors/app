module.exports = getSafeRef;

function getSafeRef(ref) {
  // Replace fullstops
  // ~, ^ or : ? * [
  // /
  // remove @ sybmobls
  // remove backslash
  return ref.replace(/[\.\[\~\^\:\?\*\@\/\\]/gi, "-");
}
