/**
 * @prettier
 * @flow
 */

import fetch from 'node-fetch';
import {stringify} from 'query-string';

type MessagesJson = {
  messages: [
    {
      id: string,
      originalarrivaltime: string,
      // TODO: Try and gather all possible types
      messagetype: 'RichText' | 'RichText/Media_GenericFile',
      version: string,
      composetime: string,
      clientmessageid: string,
      conversationLink: string,
      content: string,
      type: 'Message', // Are there other possible types?
      conversationid: string,
      from: string,
    },
  ],
  _medatata: {
    syncState: string,
    lastCompleteSegmentStartTime: number,
    lastCompleteSegmentEndTime: number,
  },
};

type Message = {
  id: number,
  arrivalDateTime: string,
  composeDateTime: string,
  content: string,
  senderMri: string,
};

async function getMessages(
  contactMri: string,
  registrationToken: string,
): Promise<Message[]> {
  const queryString = stringify({
    startTime: 0,
    pageSize: 51,
    view: 'msnp24Equivalent|supportsMessageProperties',
    targetType: 'Passport|Skype|Lync|Thread|PSTN',
  });

  const headers = {
    RegistrationToken: `registrationToken=${registrationToken}`,
  };

  const url = `https://client-s.gateway.messenger.live.com/v1/users/ME/conversations/${contactMri}/messages?${queryString}`;

  const response = await fetch(url, {headers});
  const messagesJson: MessagesJson = await response.json();

  if (!messagesJson.messages) {
    throw Error("The user doesn't exist or is not part of your contacts.");
  }

  return messagesJson.messages.map(message => ({
    id: parseInt(message.id, 10),
    arrivalDateTime: message.originalarrivaltime,
    composeDateTime: message.composetime,
    content: message.content,
    senderMri: message.from.substr(message.from.lastIndexOf('/') + 1),
    type: message.messagetype,
  }));
}

export default getMessages;
