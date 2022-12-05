import * as rm from 'typed-rest-client';
import { Config, PROD_ENDPOINT } from './config';
import { OrganizationController } from './controllers/organization';
import { UserController } from './controllers/user';
import { FileController } from './controllers/file';
import { AppController } from './controllers/app';

export class SlashauthClient {
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
    const identifier = `node-rest-client_${additional.version || '1.0.0'}`;
    const apiClient = new rm.RestClient(
      identifier,
      additional.endpoint || PROD_ENDPOINT
    );

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
