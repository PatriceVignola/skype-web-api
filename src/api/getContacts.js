/**
 * @prettier
 * @flow
 */

import fetch from 'node-fetch';
import type {UserProfile} from './formatUserProfile';

type ContactsJson = {
  contacts: [
    {
      // 8:echo123 is 'Echo / Sound Test Service'
      person_id: string, // e.g.: "28:username"
      mri: string, // e.g.: "28:username"
      display_name: string,
      dispay_name_source: 'profile' | 'user_edits',
      profile: {
        name: {
          first: string,
          surname?: string,
          nickname?: string,
          company?: string,
        },
        richMood?: string,
        jobtitle?: string,
        avatar_url?: string,
        birthday?: string,
        gender?: 'male' | 'female',
        locations?: [
          {
            type: string, // home, etc
            country: string, // CA, US, FR, gb, etc. (no standardized case)
            city?: string,
            state?: string, // This is like "province" in UserProfile
          },
        ],
        language?: string, // FR, en, etc. (no standardized case)
        mood?: string,
        about?: string,
        website?: string,
        phones?: [
          {
            number: string,
            type: 'home' | 'mobile' | 'office',
          },
        ],
      },
      // Agent is only used for the concierge, translator, bots
      agent?: {
        // im.send, im.receive, file.send, moji.send, photo.send,
        // audio.send, group_chat, etc.
        capabilities?: string[],
        trust: 'not-trusted',
        type: 'participant',
        info: {
          // im.send, im.receive, file.send, moji.send, photo.send,
          // audio.send, group_chat, etc.
          capabilities?: string[],
          trusted: 'True' | 'False',
          type: 'Participant',
        },
      },
      authorized: boolean,
      auth_certificate?: string,
      suggested?: boolean,
      email_hashes?: string[],
      blocked?: boolean,
      explicit?: boolean, // Not sure what this is
      creation_time: string,
      relationship_history?: {
        sources: [
          {
            // init_conversation, accept_invite, add_contact, msa_family, etc.
            type: string,
            subtype?: string, // t1, etc.
            time: string,
          },
        ],
      },
    },
  ],
  blocklist: [
    {
      mri: string,
    },
  ],
  groups: Object[],
  scope: string, // Full, etc.
};

export type Contact = {
  profile: UserProfile,
  blocked: boolean,
  suggested: boolean,
  relationshipHistory: ?({
    type: string,
    subType: ?string,
    dateTime: string,
  }[]),
};

async function getContacts(skypeToken: string): Promise<Contact[]> {
  const headers = {
    'x-skypetoken': skypeToken,
    accept: 'application/json; ver=1.0',
  };

  const url = `https://contacts.skype.com/contacts/v2/users/self`;
  const response = await fetch(url, {headers});
  const json: ContactsJson = await response.json();

  const genderMap = {male: 'Male', female: 'Female'};

  const contacts = json.contacts.map(c => {
    const location = c.profile.locations ? c.profile.locations[0] : null;
    const countryCode =
      location && location.country ? location.country.toUpperCase() : null;
    const gender =
      (c.profile.gender && genderMap[c.profile.gender]) || 'Unspecified';
    const languageCode = c.profile.language
      ? c.profile.language.toUpperCase()
      : null;

    const phones = {};

    c.profile.phones &&
      c.profile.phones.forEach(phone => {
        phones[phone.type] = phone.number;
      });

    const relationshipHistory = c.relationship_history
      ? c.relationship_history.sources.map(source => ({
          type: source.type,
          subType: source.subtype || null,
          dateTime: source.time,
        }))
      : null;

    const mriParts = c.mri.split(':');

    return {
      profile: {
        about: c.profile.about || null,
        avatarUrl: c.profile.avatar_url || null,
        birthday: c.profile.birthday || null,
        city: (location && location.city) || null,
        countryCode,
        emails: [],
        firstName: c.profile.name ? c.profile.name.first : null,
        lastName: (c.profile.name && c.profile.name.surname) || null,
        gender,
        homePage: c.profile.website || null,
        jobTitle: c.profile.jobtitle || null,
        languageCode,
        mood: c.profile.mood || null,
        phoneHome: phones.home || null,
        phoneMobile: phones.mobile || null,
        phoneOffice: phones.office || null,
        province: (location && location.state) || null,
        richMood: c.profile.richMood || null,
        username: mriParts.length > 2 ? mriParts[2] : mriParts[1],
        namespace: mriParts.length > 2 ? mriParts[1] : null,
      },
      blocked: c.blocked || false,
      suggested: c.suggested || false,
      relationshipHistory,
      displayName: c.display_name,
      mri: c.mri,
    };
  });

  return contacts;
}

export default getContacts;
