/**
 * @prettier
 * @flow
 */

import fetch from 'node-fetch';
import formatUserProfile from './formatUserProfile';
import type {UserProfile, UserProfileJson} from './formatUserProfile';

async function getUserProfiles(
  skypeToken: string,
  usernames?: string[],
): Promise<UserProfile[]> {
  const headers = {
    'x-skypetoken': skypeToken,
  };

  const body = JSON.stringify({
    usernames,
  });

  const url = 'https://profile.skype.com/profile/v1/batch/profiles';
  const response = await fetch(url, {method: 'POST', headers, body});
  const jsonArray: UserProfileJson[] = await response.json();

  return jsonArray.map(json => formatUserProfile(json));
}

export default getUserProfiles;
