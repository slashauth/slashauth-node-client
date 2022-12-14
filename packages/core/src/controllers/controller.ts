import { WrappedClient } from '../client';

export class Controller {
  protected client_id: string;
  protected client_secret: string;
  protected apiClient: WrappedClient;

  constructor(
    client_id: string,
    client_secret: string,
    apiClient: WrappedClient
  ) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.apiClient = apiClient;
  }
}
