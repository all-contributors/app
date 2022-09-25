const { generateValidProfileLink } = require('../../lib/modules/helpers');

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

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - valid URL format with `https` in between', async () => {
    let url = 'tenshhttpsiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - no protocol', async () => {
    let url = 'tenshiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - no protocol and starting with `http`', async () => {
    let url = 'httptenshiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - no protocol and starting with `https`', async () => {
    let url = 'httpstenshiamd.com';
    let validUrl = generateValidProfileLink(url, githubProfileUrl);

    expect(validUrl).toEqual(url);
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
