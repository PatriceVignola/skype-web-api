/**
 * @prettier
 * @flow
 */

import fetch from 'node-fetch';

async function generateFileObjectId(
  fileName: string,
  recipientMri: string,
  skypeToken: string,
): Promise<string> {
  const headers = {
    Authorization: `skype_token ${skypeToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/javascript',
    'X-Client-Version': '0/0.0.0.0',
  };

  const formData = {
    type: 'sharing/file',
    filename: fileName,
    permissions: {},
  };

  formData.permissions[recipientMri] = ['read'];

  const url = 'https://api.asm.skype.com/v1/objects';

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(formData),
    headers,
  });

  const json = await response.json();

  return json.id;
}

async function uploadFileToCloud(
  fileBuffer: Buffer,
  fileName: string,
  recipientMri: string,
  objectId: string,
  skypeToken: string,
) {
  const headers = {
    Authorization: `skype_token ${skypeToken}`,
  };

  const url = `https://api.asm.skype.com/v1/objects/${objectId}/content/original`;

  const response = await fetch(url, {
    method: 'PUT',
    body: fileBuffer,
    headers,
  });

  if (response.status !== 201) {
    throw Error('Cannot upload the file to the cloud');
  }
}

async function sendFile(
  fileBuffer: Buffer,
  fileName: string,
  recipientMri: string,
  skypeToken: string,
  registrationToken: string,
): Promise<number> {
  const objectId = await generateFileObjectId(
    fileName,
    recipientMri,
    skypeToken,
  );

  await uploadFileToCloud(
    fileBuffer,
    fileName,
    recipientMri,
    objectId,
    skypeToken,
  );

  const objectUri = `https://api.asm.skype.com/v1/objects/${objectId}`;
  const objectUrlThumbnail = `https://api.asm.skype.com/v1/objects/${objectId}/views/thumbnail`;
  const downloadUrl = `https://login.skype.com/login/sso?&amp;docid=${objectId}`;

  const content = `<URIObject type="File.1" uri="${objectUri}" url_thumbnail="${objectUrlThumbnail}"><Title>Title: ${fileName}</Title><Description> Description: ${fileName}</Description><a href="${downloadUrl}"> ${downloadUrl}</a><OriginalName v="${fileName}"/><FileSize v="${
    fileBuffer.byteLength
  }"/></URIObject>`;

  const body = JSON.stringify({
    'Has-Mentions': false,
    clientmessageid: Date.now(),
    content,
    contenttype: 'text',
    messagetype: 'RichText/Media_GenericFile',
  });

  const headers = {
    RegistrationToken: `registrationToken=${registrationToken}`,
    BehaviorOverride: 'redirectAs404',
  };

  let url = `https://client-s.gateway.messenger.live.com/v1/users/ME/conversations/${recipientMri}/messages`;
  let response = await fetch(url, {method: 'POST', headers, body});
  let json = await response.json();

  // If the user is on a different cloud, send the file to the right cloud
  if (json.errorCode && json.errorCode === 752) {
    url = response.headers.get('location');
    response = await fetch(url, {method: 'POST', headers, body});
    json = await response.json();
  }

  if (response.status !== 201) {
    throw Error('A problem occurred when sending the file.');
  }

  return json.OriginalArrivalTime;
}

export default sendFile;
