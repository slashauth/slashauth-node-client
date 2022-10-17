import {
  GetInfoResponse,
  GetRoleRestrictedDataArguments,
  RoleRestrictedDataAPIResponse,
  UpdateRoleRestrictedDataArguments,
} from '@slashauth/types';
import { WrappedClient, SlashauthResponse } from '../client';
import { signQuery, signBody } from '../utils/query';
import { Controller } from './controller';

export class AppController extends Controller {
  constructor(
    client_id: string,
    client_secret: string,
    apiClient: WrappedClient
  ) {
    super(client_id, client_secret, apiClient);
  }

  async getInfo(): Promise<SlashauthResponse<GetInfoResponse>> {
    return this.apiClient.get<GetInfoResponse>(`/s/${this.client_id}`);
  }

  async getRoleRestrictedData({
    role,
  }: GetRoleRestrictedDataArguments): Promise<
    SlashauthResponse<RoleRestrictedDataAPIResponse>
  > {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      input: {
        role: encodedRole,
        encoded: 'true',
      },
      secret: this.client_secret,
    });

    return this.apiClient.get<RoleRestrictedDataAPIResponse>(
      `/s/${this.client_id}/role_metadata`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }

  async updateRoleRestrictedData({
    role,
    metadata,
  }: UpdateRoleRestrictedDataArguments): Promise<
    SlashauthResponse<RoleRestrictedDataAPIResponse>
  > {
    const body = signBody({
      input: {
        role,
        metadata,
      },
      secret: this.client_secret,
    });

    return await this.apiClient.replace<RoleRestrictedDataAPIResponse>(
      `/s/${this.client_id}/role_metadata`,
      body
    );
  }
}
