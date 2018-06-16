/**
 * @prettier
 * @flow
 */

import fetch from 'node-fetch';

async function sendMessage(
  text: string,
  recipientMri: string,
  registrationToken: string,
) {
  const headers = {
    RegistrationToken: `registrationToken=${registrationToken}`,
  };

  const body = JSON.stringify({
    'Has-Mentions': false,
    clientmessageid: Date.now(),
    content: text,
    contenttype: 'text',
    messagetype: 'RichText',
  });

  const url = `https://client-s.gateway.messenger.live.com/v1/users/ME/conversations/${recipientMri}/messages`;

  const response = await fetch(url, {method: 'POST', headers, body});

  const json = await response.json();

  return json;
}

export default sendMessage;
