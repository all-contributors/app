const { generateValidLink } = require('../../lib/modules/helpers');

describe('generateValidLink', () => {
  const username = 'tenshiAMD'

  test('returns valid link - valid URL format having `https` protocol', async () => {
    let url = 'https://tenshiamd.com';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - valid URL format having `http` protocol', async () => {
    let url = 'http://tenshiamd.com';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - valid URL format with `null` username', async () => {
    let url = 'https://tenshiamd.com';
    let validUrl = generateValidLink(url, null);

    expect(validUrl).toEqual(url);
  });

  test('returns valid link - valid URL format with `http` in between', async () => {
    let url = 'tenshhttpiamd.com';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(`http://${url}/`);
  });

  test('returns valid link - valid URL format with `https` in between', async () => {
    let url = 'tenshhttpsiamd.com';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(`http://${url}/`);
  });

  test('returns valid link - no protocol', async () => {
    let url = 'tenshiamd.com';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(`http://${url}/`);
  });

  test('returns valid link - no protocol and starting with `http`', async () => {
    let url = 'httptenshiamd.com';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(`http://${url}/`);
  });

  test('returns valid link - no protocol and starting with `https`', async () => {
    let url = 'httpstenshiamd.com';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(`http://${url}/`);
  });

  test('returns valid link - incomplete URL format', async () => {
    let url = 'contributor';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(`https://github.com/${username}/`);
  });

  test('returns valid link - incomplete URL format with `null` username', async () => {
    let url = 'contributor';
    let validUrl = generateValidLink(url, null);

    expect(validUrl).toEqual(`https://github.com/all-contributors/`);
  });
});
