import * as rm from 'typed-rest-client';
import { Config, PROD_ENDPOINT } from './config';
import { HasRoleAPIResponse, HasRoleArguments } from './global';
import { signQuery } from './query';

export class SlashauthClient {
  identifier: string;
  apiClient: rm.RestClient;

  client_id: string;
  client_secret: string;

  constructor(
    client_id: string,
    client_secret: string,
    additional: Partial<Config>
  ) {
    this.identifier = `node-rest-client_${additional.version || '1.0.0'}`;
    this.apiClient = new rm.RestClient(
      this.identifier,
      additional.endpoint || PROD_ENDPOINT
    );

    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  async hasRole({
    address,
    role,
  }: HasRoleArguments): Promise<rm.IRestResponse<HasRoleAPIResponse>> {
    const urlParams = signQuery({
      query: {
        address,
        role,
      },
      secret: this.client_secret,
    });

    return this.apiClient.get<HasRoleAPIResponse>(
      `/s/${this.client_id}/has_role`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }
}
