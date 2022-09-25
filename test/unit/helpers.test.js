const { 
  generatePrTitle,
  generateValidProfileLink,
} = require('../../lib/modules/helpers');

describe('generatePrTitle', () => {
  const message = 'add tenshiAMD as a contributor';

  test('returns valid message - with 1 contribution type/s', async () => {
    let contributions = ['code'];
    let validText = generatePrTitle(message, contributions);

    expect(validText).toEqual('add tenshiAMD as a contributor for code');
  });

  test('returns valid message - with 2 contribution type/s', async () => {
    let contributions = ['code', 'bug'];
    let validText = generatePrTitle(message, contributions);

    expect(validText).toEqual('add tenshiAMD as a contributor for code, and bug');
  });

  test('returns valid message - with 3 contribution type/s', async () => {
    let contributions = ['code', 'bug', 'design'];
    let validText = generatePrTitle(message, contributions);

    expect(validText).toEqual('add tenshiAMD as a contributor for code, bug, and design');
  });

  test('returns valid message - with nth contribution type/s', async () => {
    let contributions = ['code', 'bug', 'a11y', 'design', 'review'];
    let validText = generatePrTitle(message, contributions);

    expect(validText).toEqual(`add tenshiAMD as a contributor for code, bug, and ${contributions.length - 2} more`);
  });
});

describe('generateValidProfileLink', () => {
  const githubProfileUrl = 'https://github.com/tenshiAMD'

  test('returns valid link - valid URL format having `https` protocol', async () => {
    let url = 'https://tenshiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - valid URL format having `http` protocol', async () => {
    let url = 'http://tenshiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - valid URL format with `null` githubProfileUrl', async () => {
    let url = 'https://tenshiamd.com';
    let validUrl = generateValidProfileLink(url, null);

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - valid URL format with `http` in between', async () => {
    let url = 'tenshhttpiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(`http://${url}`);
  });

  test('returns valid link - valid URL format with `https` in between', async () => {
    let url = 'tenshhttpsiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(`http://${url}`);
  });

  test('returns valid link - no protocol', async () => {
    let url = 'tenshiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(`http://${url}`);
  });

  test('returns valid link - no protocol and starting with `http`', async () => {
    let url = 'httptenshiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(`http://${url}`);
  });

  test('returns valid link - no protocol and starting with `https`', async () => {
    let url = 'httpstenshiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(`http://${url}`);
  });

  test('returns valid link - incomplete URL format', async () => {
    let url = 'contributor';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(githubProfileUrl);
  });

  test('returns valid link - incomplete URL format with `null` githubProfileUrl', async () => {
    let url = 'contributor';
    let validUrl = generateValidProfileLink(url, null);

    expect(validUrl).toEqual('');
  });
});
