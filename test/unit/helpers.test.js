const { generateValidLink } = require('../../lib/modules/helpers');

describe('generateValidLink', () => {
  const username = 'tenshiAMD'

  test('return valid link - no protocol', async () => {
    let url = 'tenshiamd.com';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(`http://${url}/`);
  });

  test('return valid link - incomplete URL format', async () => {
    let url = 'contributor';
    let validUrl = generateValidLink(url, username);

    expect(validUrl).toEqual(`https://github.com/${username}/`);
  });
});
