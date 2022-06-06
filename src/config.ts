export const PROD_ENDPOINT = 'https://api.slashauth.xyz';

export type Config = {
  version: string;

  client_id: string;
  client_secret: string;

  endpoint: string;
};
