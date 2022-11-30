import * as rm from 'typed-rest-client';

export class Controller {
  client_id: string;
  client_secret: string;
  apiClient: rm.RestClient;

  constructor(
    client_id: string,
    client_secret: string,
    apiClient: rm.RestClient
  ) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.apiClient = apiClient;
  }
}
