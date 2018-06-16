/**
 * @prettier
 * @flow
 */

export type UserProfileJson = {
  about: ?string,
  avatarUrl: ?string,
  birthday: ?string,
  city: ?string,
  country: ?string,
  emails: string[],
  firstname: ?string,
  lastname: ?string,
  gender: null | 1 | 2,
  homepage: ?string,
  jobtitle: ?string,
  language: ?string,
  mood: ?string,
  phoneHome: ?string,
  phoneMobile: ?string,
  phoneOffice: ?string,
  province: ?string,
  richMood: ?string,
  username: string, // e.g.: "live:italki.tracker"
  namespace?: string,
  status?: {
    code: number, // 40411 == Requested username not found
    text: string,
  },
};

export type UserProfile = {
  about: ?string,
  avatarUrl: ?string,
  birthday: ?string,
  city: ?string,
  countryCode: ?string,
  emails: string[],
  firstName: ?string,
  lastName: ?string,
  gender: 'Unspecified' | 'Male' | 'Female',
  homePage: ?string,
  jobTitle: ?string,
  languageCode: ?string,
  mood: ?string,
  phoneHome: ?string,
  phoneMobile: ?string,
  phoneOffice: ?string,
  province: ?string,
  richMood: ?string,
  username: string,
  namespace: ?string,
};

function formatUserProfile(json: UserProfileJson): UserProfile {
  const genders = ['Unspecified', 'Male', 'Female'];

  if (json.status) {
    throw Error(json.status.text);
  }

  return {
    about: json.about,
    avatarUrl: json.avatarUrl,
    birthday: json.birthday,
    city: json.city,
    countryCode: json.country ? json.country.toUpperCase() : null,
    emails: json.emails,
    firstName: json.firstname,
    lastName: json.lastname,
    gender: json.gender === null ? genders[0] : genders[json.gender],
    homePage: json.homepage,
    jobTitle: json.jobtitle,
    languageCode: json.language ? json.language.toUpperCase() : null,
    mood: json.mood,
    phoneHome: json.phoneHome,
    phoneMobile: json.phoneMobile,
    phoneOffice: json.phoneOffice,
    province: json.province,
    richMood: json.richMood,
    username: json.username,
    namespace: json.namespace || null,
  };
}

export default formatUserProfile;
