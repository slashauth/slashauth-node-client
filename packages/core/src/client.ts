import * as rm from 'typed-rest-client';
import { Config, PROD_ENDPOINT } from './config';
import { OrganizationController } from './controllers/organization';
import { UserController } from './controllers/user';
import { FileController } from './controllers/file';
import { AppController } from './controllers/app';

export class SlashauthClient {
  identifier: string;
  apiClient: rm.RestClient;

  client_id: string;
  client_secret: string;

  // Controllers
  app: AppController;
  user: UserController;
  organization: OrganizationController;
  file: FileController;

  constructor(
    client_id: string,
    client_secret: string,
    additional: Partial<Config>
  ) {
    this.identifier = `node-rest-client_${additional.version || '1.0.0'}`;
    const apiClient = new rm.RestClient(
      this.identifier,
      additional.endpoint || PROD_ENDPOINT
    );

    this.client_id = client_id;
    this.client_secret = client_secret;
    this.apiClient = apiClient;
    this.app = new AppController(client_id, client_secret, apiClient);
    this.user = new UserController(client_id, client_secret, apiClient);
    this.organization = new OrganizationController(
      client_id,
      client_secret,
      apiClient
    );
    this.file = new FileController(client_id, client_secret, apiClient);
  }
}
