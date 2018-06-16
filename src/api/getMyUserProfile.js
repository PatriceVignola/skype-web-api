/**
 * @prettier
 * @flow
 */

import fetch from 'node-fetch';
import formatUserProfile from './formatUserProfile';
import type {UserProfile, UserProfileJson} from './formatUserProfile';

async function getMyUserProfile(skypeToken: string): Promise<UserProfile> {
  const headers = {
    'x-skypetoken': skypeToken,
  };

  const url = 'https://profile.skype.com/profile/v1/users/self/profile';
  const response = await fetch(url, {headers});
  const json: UserProfileJson = await response.json();

  return formatUserProfile(json);
}

export default getMyUserProfile;
