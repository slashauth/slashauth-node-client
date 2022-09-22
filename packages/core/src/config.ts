// export const PROD_ENDPOINT = 'https://api.slashauth.com';
export const PROD_ENDPOINT = 'http://localhost:8080';

export type Config = {
  version: string;

  client_id: string;
  client_secret: string;

  endpoint: string;
};
