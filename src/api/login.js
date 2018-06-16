/**
 * @prettier
 * @flow
 */

import generateSkypeToken from './generateSkypeToken';
import registerEndpoint from './registerEndpoint';

export type Tokens = {
  skypeToken: {
    value: string,
    epochMillisecondsExpiration: number,
  },
  registrationToken: {
    value: string,
    epochMillisecondsExpiration: number,
  },
};

async function login(username: string, password: string): Promise<Tokens> {
  const skypeToken = await generateSkypeToken(username, password);
  const registrationToken = await registerEndpoint(skypeToken.value);

  return {skypeToken, registrationToken};
}

export default login;
