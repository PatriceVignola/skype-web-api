/**
 * @prettier
 * @flow
 */

import fetch from 'node-fetch';
import cheerio from 'cheerio';
import request from 'request-promise-native';
import {stringify} from 'query-string';
import {Cookie} from 'tough-cookie';

type LiveKeys = {
  ppft: string,
  mspRequ: string,
  mspOk: string,
};

function parseSkypeTokenHtml(html: string) {
  const $ = cheerio.load(html);
  const skypeTokenNode = $('input[name=skypetoken]');
  const expiresInSecondsNode = $('input[name=expires_in]');

  if (!skypeTokenNode) {
    throw Error('Cannot parse the Skype Token');
  }

  const value: string = skypeTokenNode.val();
  const expiresInMilliseconds: ?number = expiresInSecondsNode
    ? parseInt(expiresInSecondsNode.val(), 10) * 1000
    : 3600 * 24 * 1000;

  const epochMillisecondsExpiration = Date.now() + expiresInMilliseconds;

  return {
    value,
    epochMillisecondsExpiration,
  };
}

function parseLiveTokenHtml(html: string): string {
  const $ = cheerio.load(html);
  const liveTokenNode = $('#t');

  if (!liveTokenNode) {
    // TODO: Add better error messages (e.g. incorrect password)
    throw Error('Cannot parse the Live Token');
  }

  return liveTokenNode.val();
}

function parsePpftHtml(html: string): string {
  const regex = /<input.*name\s*=\s*"PPFT".*value\s*=\s*"(.+)".*\/\s*>/;
  const match = html.match(regex);

  if (!match || match.length < 2) {
    throw Error('Cannot parse the PPFT key');
  }

  return match[1];
}

async function getLiveKeys(): Promise<LiveKeys> {
  const queryString = stringify({
    client_id: 578134,
    redirect_uri: 'https://web.skype.com/',
  });

  const url = `https://login.skype.com/login/oauth/microsoft?${queryString}`;

  const response = await fetch(url);

  const cookieStrings: string[] = response.headers.get('set-cookie').split(',');
  const cookies = cookieStrings.map(cookieString => Cookie.parse(cookieString));

  const liveKeys = {
    // TODO: Add errour handling for response.text() and parsePpftHtml()
    ppft: parsePpftHtml(await response.text()),
    mspRequ: '',
    mspOk: '',
  };

  cookies.forEach(cookie => {
    if (cookie.key === 'MSPRequ') {
      liveKeys.mspRequ = cookie.value;
    } else if (cookie.key === 'MSPOK') {
      liveKeys.mspOk = cookie.value;
    }
  });

  if (liveKeys.mspRequ === undefined) {
    throw Error('Cannot parse the MSPRequ key');
  }

  if (liveKeys.mspOk === undefined) {
    throw Error('Cannot parse the MSPOK key');
  }

  return liveKeys;
}

async function getLiveToken(username: string, password: string) {
  const wreplyQueryString = stringify({
    client_id: 578134,
    site_name: 'lw.skype.com',
    redirect_uri: 'https://web.skype.com/',
  });

  const queryString = stringify(
    {
      wa: 'wsignin1.0',
      wp: 'MBI_SSL',
      wreply: `https://lw.skype.com/login/oauth/proxy?${wreplyQueryString}`,
    },
    {encode: false},
  );

  const {ppft, mspRequ, mspOk} = await getLiveKeys();
  const ckTst = Date.now();

  const formData = {login: username, passwd: password, PPFT: ppft};

  const url = `https://login.live.com/ppsecure/post.srf?${queryString}`;

  const jar = request.jar();
  jar.setCookie(
    request.cookie(`MSPRequ=${mspRequ}`),
    'https://login.live.com/',
  );

  jar.setCookie(request.cookie(`MSPOK=${mspOk}`), 'https://login.live.com/');
  jar.setCookie(request.cookie(`CkTst=${ckTst}`), 'https://login.live.com/');

  const html = await request.post({url, jar, formData});

  const liveToken = parseLiveTokenHtml(html);

  return liveToken;
}

async function generateSkypeToken(username: string, password: string) {
  const liveToken = await getLiveToken(username, password);

  const formData = {
    t: liveToken,
  };

  const url = `https://login.skype.com/login/microsoft`;
  const html = await request.post({url, formData});

  // TODO: Add some error handling

  const skypeToken = parseSkypeTokenHtml(html);

  return skypeToken;
}

export default generateSkypeToken;
