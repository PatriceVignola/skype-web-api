# Skype API

[![Circle CI Status](https://circleci.com/gh/PatriceVignola/skype-web-api.svg?style=shield)](https://circleci.com/gh/PatriceVignola/skype-web-api) [![Coverage Status](https://coveralls.io/repos/github/PatriceVignola/skype-web-api/badge.svg?branch=master)](https://coveralls.io/github/PatriceVignola/skype-web-api?branch=master) [![npm version](https://badge.fury.io/js/skype-web-api.svg)](https://badge.fury.io/js/skype-web-api) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![jest](https://facebook.github.io/jest/img/jest-badge.svg)](https://github.com/facebook/jest)

An unofficial Skype API for JavaScript.

# Getting Started

## Install with npm

```sh
$ npm i skype-web-api
```

## Install with yarn

```sh
$ yarn add skype-web-api
```

## Include the package

```js
import SkypeWebApi from 'skype-web-api';
```

# Usage

### `SkypeWebApi()`

Initialize a new `SkypeWebApi` object with an empty session.

```js
const skypeApi = new SkypeWebApi();
```

### `login(username: string, password: string): Tokens`

Login with the Skype credentials of a user.

```js
const tokens = skypeApi.login('SkypeUsernameOrEmail', 'SkypePassword');
```

This function returns a `Tokens` object defined as the following flow type:

```js
type Tokens = {
  skypeToken: {
    value: string,
    epochMillisecondsExpiration: number,
  },
  registrationToken: {
    value: string,
    epochMillisecondsExpiration: number,
  },
};
```

`Tokens` are useful if you're working on a stateless application (e.g. website backend) and want to resume an existing session without requiring the user to login every time. To load a session from existing `Tokens`, refer to the constructor call below. Tokens are valid for 24 hours.

### `SkypeWebApi(tokens?: Tokens)`

Loads an existing user session from a `Tokens` object (defined above).

```js
const tokens = skypeApi.login('SkypeUsernameOrEmail', 'SkypePassword');
const skypeApi = new SkypeWebApi(tokens);
```

`Tokens` expire after 24 hours, after which the user has au authenticate again via the `login()` function.

### `getMyUserProfile(): UserProfile`

Fetches the `UserProfile` of the currently logged-in user.

```js
const myUserProfile = skypeApi.getMyUserProfile();
```

This function returns a user profile defined as the following flow type:

```js
type UserProfile = {
  about: ?string,
  avatarUrl: ?string,
  birthday: ?string,
  city: ?string,
  countryCode: ?string
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
  username: ?string,
  namespace: ?string,
};
```

### `getContacts(): Contact[]`

Fetches all the currently logged-in user's contacts.

```js
const contacts = skypeApi.getContacts();
```

This function returns a `Contact` defined as the following flow type:

```js
type Contact = {
  profile: UserProfile,
  blocked: boolean,
  suggested: boolean,
  relationshipHistory: ?({
    type: string,
    subType: ?string,
    dateTime: string,
  }[]),
  displayName: string,
  mri: string,
};
```

### `getUserProfile(username: string): UserProfile`

Fetches the full `UserProfile` of a contact from his username (possibly retrieved from an earlier `getContacts()` call).

```js
const username = 'ContactUsername';
const userProfile = skypeApi.getUserProfile(username);
```

Like `getMyUserProfile()`, this function returns a single `UserProfile`.

### `getUserProfiles(usernames: string[]): UserProfile[]`

Fetches the full `UserProfile` of many contacts instead of repeatedly calling `getUserProfile()`.

```js
const contactUsernames = [
  "Username1",
  "Username2",
  "Username3",
];
const contactProfiles = skypeApi.getUserProfiles(contactUsernames);
```

This function returns an array of `UserProfile`.

### `sendMessage(text: string, recipientMri: string)`

Sends a message from the current user to one of his contact. `recipientMri` is the Windows Live ID of the contact with one of the following formats: `<number>:live:<username` or `<number>:<email>`. You can get the MRI of a contact with the `getContacts()` function.

```js
skypeApi.sendMessage('Hello World', '8:live:bob');
```

### `sendFile(fileBuffer: Buffer, fileName: string, recipientMri: string): number`

Sends a file from the current user to one of his contact. `recipientMri` is the Windows Live ID of the contact with one of the following formats: `<number>:live:<username` or `<number>:<email>`. You can get the MRI of a contact with the `getContacts()` function. `Buffer` is a standard Node.js buffer obtained by reading a file from the disk.

```js
import fs from 'fs';
const buffer = fs.readFileSync('path/to/the/file');
skypeApi.sendFile(buffer, 'FileName.pdf', '8:live:bob');
```

The function returns the arrival timestamp of the file in milliseconds since epoch.

### `getMessages(contactMri: string): Message[]`

Fetches the messages exchanged by the logged-in user and one of his contacts. `contactMri` is the Windows Live ID of the contact with one of the following formats: `<number>:live:<username` or `<number>:<email>.

```js
const messages = skypeApi.getMessages('8:live:bob');
```

The function returns an array of `Message`, defined by the following flow type:

```js
type Message = {
  id: number,
  arrivalDateTime: string,
  composeDateTime: string,
  content: string,
  senderMri: string,
};
```
