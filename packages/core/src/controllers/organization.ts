import * as rm from 'typed-rest-client';
import {
  AddRoleRequirementOrganizationArguments,
  DeleteRoleRequirementOrganizationArguments,
  PostOrganizationArguments,
  PutOrganizationArguments,
  RoleRequirementAPIResponse,
  UpsertOrganizationAPIResponse,
} from '@slashauth/types';
import { signBody, signQuery } from '../utils/query';
import { Controller } from './controller';

export class OrganizationController extends Controller {
  constructor(
    client_id: string,
    client_secret: string,
    apiClient: rm.RestClient
  ) {
    super(client_id, client_secret, apiClient);
  }

  async createOrganization({
    name,
    description,
  }: PostOrganizationArguments): Promise<
    rm.IRestResponse<UpsertOrganizationAPIResponse>
  > {
    const body = signBody({
      input: {
        name,
        description: description || '',
      },
      secret: this.client_secret,
    });

    return await this.apiClient.create<UpsertOrganizationAPIResponse>(
      `/s/${this.client_id}/organizations`,
      body
    );
  }

  async updateOrganization({
    organizationID,
    name,
    description,
  }: PutOrganizationArguments): Promise<
    rm.IRestResponse<UpsertOrganizationAPIResponse>
  > {
    const body = signBody({
      input: {
        name,
        description: description || '',
      },
      secret: this.client_secret,
    });

    return await this.apiClient.replace<UpsertOrganizationAPIResponse>(
      `/s/${this.client_id}/organizations/${organizationID}`,
      body
    );
  }

  async addRoleRequirement({
    organizationID,
    contract,
    contractType,
    quantity,
    chainID,
    tokenTypeID,
    role,
  }: AddRoleRequirementOrganizationArguments): Promise<
    rm.IRestResponse<RoleRequirementAPIResponse>
  > {
    const body = signBody({
      input: {
        contract,
        contractType,
        quantity,
        chainID,
        tokenTypeID,
        role,
      },
      secret: this.client_secret,
    });

    return await this.apiClient.create<RoleRequirementAPIResponse>(
      `/s/${this.client_id}/organizations/${organizationID}/role_requirement`,
      body
    );
  }

  async deleteRoleRequirement({
    organizationID,
    roleID,
  }: DeleteRoleRequirementOrganizationArguments): Promise<
    rm.IRestResponse<RoleRequirementAPIResponse>
  > {
    const urlParams = signQuery({
      input: {
        roleID,
      },
      secret: this.client_secret,
    });

    return await this.apiClient.del<RoleRequirementAPIResponse>(
      `/s/${this.client_id}/organizations/${organizationID}/role_requirement`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }
}
