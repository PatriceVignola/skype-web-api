/**
 * @prettier
 * @flow
 */

import 'regenerator-runtime/runtime';

import getContacts from './api/getContacts';
import getMessages from './api/getMessages';
import getMyUserProfile from './api/getMyUserProfile';
import getUserProfiles from './api/getUserProfiles';
import login from './api/login';
import sendFile from './api/sendFile';

import type {Tokens} from './api/login';

class SkypeApi {
  tokens: Tokens;

  constructor(tokens?: Tokens) {
    if (tokens) {
      this.tokens = tokens;
    }
  }

  login = async (username: string, password: string) => {
    this.tokens = await login(username, password);
  };

  getMyUserProfile = async () => getMyUserProfile(this.tokens.skypeToken.value);

  getUserProfiles = async (usernames?: string[]) =>
    getUserProfiles(this.tokens.skypeToken.value, usernames);

  sendFile = async (
    fileBuffer: Buffer,
    fileName: string,
    recipientMri: string,
  ) =>
    sendFile(
      fileBuffer,
      fileName,
      recipientMri,
      this.tokens.skypeToken.value,
      this.tokens.registrationToken.value,
    );

  getContacts = async () => getContacts(this.tokens.skypeToken.value);

  getMessages = async (contactMri: string) =>
    getMessages(contactMri, this.tokens.registrationToken.value);
}

export {
  getContacts,
  getMessages,
  getMyUserProfile,
  getUserProfiles,
  login,
  sendFile,
};

export default SkypeApi;
