/**
 * @prettier
 * @flow
 */

import formatUserProfile from './formatUserProfile';
import type {UserProfile, UserProfileJson} from './formatUserProfile';

const mockJson: UserProfileJson = {
  about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  avatarUrl: 'https://dummyavatarurl.com',
  birthday: '1991-05-03',
  city: 'Dummy City',
  country: 'US',
  emails: ['dummy.email@dummy.com'],
  firstname: 'Dummy',
  lastname: 'Name',
  gender: null,
  homepage: 'https://dummyhomepage.com',
  jobtitle: 'Dummy Job Title',
  language: 'EN',
  mood: 'Happy',
  phoneHome: '555-365-2168',
  phoneMobile: '555-128-5642',
  phoneOffice: '555-852-8895',
  province: 'Washington',
  richMood: 'Very Happy',
  username: 'live:dummy.username',
  namespace: 'live',
};

const mockBadJson = {
  username: 'bad.username',
  status: {
    code: 40411,
    text: "Requested username 'bad.username' not found",
  },
};

const expectedUserProfile: UserProfile = {
  about: mockJson.about,
  avatarUrl: mockJson.avatarUrl,
  birthday: mockJson.birthday,
  city: mockJson.city,
  countryCode: mockJson.country,
  emails: mockJson.emails,
  firstName: mockJson.firstname,
  lastName: mockJson.lastname,
  gender: 'Unspecified',
  homePage: mockJson.homepage,
  jobTitle: mockJson.jobtitle,
  languageCode: mockJson.language,
  mood: mockJson.mood,
  phoneHome: mockJson.phoneHome,
  phoneMobile: mockJson.phoneMobile,
  phoneOffice: mockJson.phoneOffice,
  province: mockJson.province,
  richMood: mockJson.richMood,
  username: mockJson.username,
  namespace: mockJson.namespace,
};

describe('formatUserProfile', () => {
  it('formats json into the correct user profile', () => {
    const userProfile = formatUserProfile(mockJson);
    expect(userProfile).toEqual(expectedUserProfile);
  });

  it('formats json with Male gender into the current user profile', () => {
    const mockMaleJson = {
      ...mockJson,
      gender: 1,
    };
    const userProfile = formatUserProfile(mockMaleJson);
    expect(userProfile.gender).toEqual('Male');
  });

  it('formats json with Female gender into the current user profile', () => {
    const mockFemaleJson = {
      ...mockJson,
      gender: 2,
    };
    const userProfile = formatUserProfile(mockFemaleJson);
    expect(userProfile.gender).toEqual('Female');
  });

  it('converts undefined or null values to null', () => {
    const mockUndefinedCountry = {
      ...mockJson,
      country: null,
      language: null,
      namespace: undefined,
    };

    const userProfile = formatUserProfile(mockUndefinedCountry);
    expect(userProfile.countryCode).toBeNull();
    expect(userProfile.languageCode).toBeNull();
    expect(userProfile.namespace).toBeNull();
  });

  it('capitalizes country and language codes', () => {
    const mockLowerCase = {
      ...mockJson,
      country: 'ca',
      language: 'fr',
    };

    const userProfile = formatUserProfile(mockLowerCase);
    expect(userProfile.countryCode).toEqual('CA');
    expect(userProfile.languageCode).toEqual('FR');
  });

  it('throws an error when receiving a status field', () => {
    expect(() => {
      formatUserProfile((mockBadJson: any));
    }).toThrowError(mockBadJson.status.text);
  });
});
