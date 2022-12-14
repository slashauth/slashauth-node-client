import {
  GetInfoResponse,
  GetRoleRestrictedDataArguments,
  RoleRestrictedDataAPIResponse,
  RoleRestrictedData,
  UpdateRoleRestrictedDataArguments,
  App,
} from '@slashauth/types';
import { WrappedClient, SlashauthResponse } from '../client';
import { signQuery, signBody } from '../utils/query';
import { Controller } from './controller';

const transformResponse =
  <I, O>(responseMapper: (data: I | null) => SlashauthResponse<O>['0']) =>
  ([data, ...res]: SlashauthResponse<I>): SlashauthResponse<O> =>
    [responseMapper(data), ...res];

export class AppController extends Controller {
  constructor(
    client_id: string,
    client_secret: string,
    apiClient: WrappedClient
  ) {
    super(client_id, client_secret, apiClient);
  }

  async getInfo(): Promise<SlashauthResponse<App>> {
    return this.apiClient
      .get<GetInfoResponse>(`/s/${this.client_id}`)
      .then(transformResponse<GetInfoResponse, App>((res) => res && res.data));
  }

  async getRoleRestrictedData({
    role,
  }: GetRoleRestrictedDataArguments): Promise<
    SlashauthResponse<RoleRestrictedData>
  > {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      input: {
        role: encodedRole,
        encoded: 'true',
      },
      secret: this.client_secret,
    });

    return this.apiClient
      .get<RoleRestrictedDataAPIResponse>(
        `/s/${this.client_id}/role_metadata`,
        {
          queryParameters: {
            params: urlParams,
          },
        }
      )
      .then(transformResponse((res) => res && res.data));
  }

  async updateRoleRestrictedData({
    role,
    metadata,
  }: UpdateRoleRestrictedDataArguments): Promise<
    SlashauthResponse<RoleRestrictedData>
  > {
    const body = signBody({
      input: {
        role,
        metadata,
      },
      secret: this.client_secret,
    });

    return await this.apiClient
      .replace<RoleRestrictedDataAPIResponse>(
        `/s/${this.client_id}/role_metadata`,
        body
      )
      .then(transformResponse((res) => res && res.data));
  }
}
