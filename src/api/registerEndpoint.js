/**
 * @prettier
 * @flow
 */

import bigInt from 'big-integer';
import {sha256} from 'js-sha256';
import fetch from 'node-fetch';
import {Cookie} from 'tough-cookie';

function int32ToLittleEndianHexString(int32) {
  const HEX_CHARS = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result +=
      HEX_CHARS.charAt((int32 >> (i * 8 + 4)) & 15) +
      HEX_CHARS.charAt((int32 >> (i * 8)) & 15);
  }
  return result;
}

function checkSum64(challengeParts, hashParts) {
  if (challengeParts.length < 2 || challengeParts.length % 2 !== 0) {
    throw new Error('Invalid parameters');
  }

  const MAX_INT32 = 0x7fffffff;

  const MAGIC = 0x0e79a9c1; // A magic constant
  const HASH_0 = hashParts[0] & MAX_INT32; // Remove the sign bit
  const HASH_1 = hashParts[1] & MAX_INT32;
  const HASH_2 = hashParts[2] & MAX_INT32;
  const HASH_3 = hashParts[3] & MAX_INT32;
  let low = bigInt(); // 0-31 bits of the result
  let high = bigInt(); // 32-63 bits of the result
  let temp;
  const len = challengeParts.length;
  for (let i = 0; i < len; i += 2) {
    temp = bigInt(challengeParts[i])
      .multiply(MAGIC)
      .mod(MAX_INT32);
    low = low
      .add(temp)
      .multiply(HASH_0)
      .add(HASH_1)
      .mod(MAX_INT32);
    high = high.add(low);
    temp = bigInt(challengeParts[i + 1]);
    low = low
      .add(temp)
      .multiply(HASH_2)
      .add(HASH_3)
      .mod(MAX_INT32);
    high = high.add(low);
  }
  low = low.add(HASH_1).mod(MAX_INT32);
  high = high.add(HASH_3).mod(MAX_INT32);
  return new Uint32Array([low.toJSNumber(), high.toJSNumber()]);
}

function uint8ArrayToUint32Array(uint8Array: Buffer) {
  const len = uint8Array.length;
  if (len % 4 !== 0) {
    throw new Error('uint8Array.length must be a multiple of 4');
  }
  const uint32Array = new Uint32Array(len / 4);
  for (let i = 0, j = 0; i < len; i += 4, j++) {
    uint32Array[j] += uint8Array[i] * (1 << 0);
    uint32Array[j] += uint8Array[i + 1] * (1 << 8);
    uint32Array[j] += uint8Array[i + 2] * (1 << 16);
    uint32Array[j] += uint8Array[i + 3] * (1 << 24);
  }
  return uint32Array;
}

function hmacSha256(input, productId, productKey) {
  let message = Buffer.concat([input, productId]);
  // adjust length to be a multiple of 8 with right-padding of character '0'
  if (message.length % 8 !== 0) {
    const fix = 8 - (message.length % 8);
    const padding = Buffer.alloc(fix, '0', 'utf8');
    padding.fill('0');
    message = Buffer.concat([message, padding]);
  }
  const challengeParts = uint8ArrayToUint32Array(message);
  const sha256HexString = sha256(Buffer.concat([input, productKey]));
  const sha256Buffer = Buffer.from(sha256HexString, 'hex');
  // Get half of the sha256 as 4 uint32
  const sha256Parts = uint8ArrayToUint32Array(sha256Buffer.slice(0, 16));
  const checkSumParts = checkSum64(challengeParts, sha256Parts);
  sha256Parts[0] ^= checkSumParts[0];
  sha256Parts[1] ^= checkSumParts[1];
  sha256Parts[2] ^= checkSumParts[0];
  sha256Parts[3] ^= checkSumParts[1];
  return (
    int32ToLittleEndianHexString(sha256Parts[0]) +
    int32ToLittleEndianHexString(sha256Parts[1]) +
    int32ToLittleEndianHexString(sha256Parts[2]) +
    int32ToLittleEndianHexString(sha256Parts[3])
  );
}

function getLockAndKeyHeader() {
  const appId = 'msmsgs@msnmsgr.com';
  const time = Math.floor(new Date().getTime() / 1000);
  const secret = 'Q1P7W2E4J9R8U3S5';

  const timeBuffer = Buffer.from(time.toString(10));
  const appIdBuffer = Buffer.from(appId);
  const secretBuffer = Buffer.from(secret);
  const lockAndKeyResponse = hmacSha256(timeBuffer, appIdBuffer, secretBuffer);

  return `appId=${appId}; time=${time}; lockAndKeyResponse=${lockAndKeyResponse}`;
}

async function registerEndpoint(skypeToken: string) {
  const url =
    'https://client-s.gateway.messenger.live.com/v1/users/ME/endpoints';

  const lockAndKey = getLockAndKeyHeader();

  const headers = {
    LockAndKey: lockAndKey,
    Authentication: `skypetoken=${skypeToken}`,
    BehaviorOverride: 'redirectAs404',
    Accept: 'application/json, text/javascript',
    ClientInfo:
      'os=Windows; osVer=10; proc=Win64; lcid=en-us; deviceType=1; country=n/a; clientName=skype.com; clientVer=908/1.30.0.128',
  };

  const body = JSON.stringify({
    endpointFeatures: 'Agent',
  });

  const response = await fetch(url, {method: 'POST', headers, body});

  const registrationTokenHeader = response.headers.get('set-registrationtoken');
  const params: string[] = registrationTokenHeader.split(';');
  const token = {};

  params.forEach(param => {
    const cookie = Cookie.parse(param);

    if (cookie.key === 'registrationToken') {
      token.value = cookie.value;
    } else if (cookie.key === 'expires') {
      // It typically expires after 1 day
      token.epochMillisecondsExpiration = cookie.value * 1000;
    }

    // There is also an "endpointId" cookie, but we don't use it yet; we can
    // always go back later and fetch it if we need it
  });

  if (!token.value || !token.epochMillisecondsExpiration) {
    throw Error('Endpoint registration failed');
  }

  return token;
}

export default registerEndpoint;
