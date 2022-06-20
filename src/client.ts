import * as rm from 'typed-rest-client';
import { Config, PROD_ENDPOINT } from './config';
import {
  AddRoleRequirementOrganizationArguments,
  AddWalletToRoleOrganizationArguments,
  DecodedToken,
  DeleteRoleFromWalletOrganizationArguments,
  DeleteRoleRequirementOrganizationArguments,
  HasRoleAPIResponse,
  HasRoleArguments,
  CreateOrganizationAPIResponse,
  PostOrganizationArguments,
  RoleRequirementAPIResponse,
  ValidateTokenAPIResponse,
  ValidateTokenArguments,
  ValidateTokenResponse,
  WalletRoleAPIResponse,
  HasOrgRoleArguments,
} from './global';
import { signQuery, signBody } from './query';
import { base64Decode } from './utils/strings';

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
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      input: {
        address,
        role: encodedRole,
        encoded: 'true',
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

  async hasOrgRole({
    organizationID,
    address,
    role,
  }: HasOrgRoleArguments): Promise<rm.IRestResponse<HasRoleAPIResponse>> {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      input: {
        address,
        role: encodedRole,
        encoded: 'true',
      },
      secret: this.client_secret,
    });

    return this.apiClient.get<HasRoleAPIResponse>(
      `/s/${this.client_id}/${organizationID}/has_role`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }

  async validateToken({
    token,
  }: ValidateTokenArguments): Promise<ValidateTokenResponse> {
    try {
      const resp = this.apiClient.get<ValidateTokenAPIResponse>(
        `/validate_token`,
        {
          queryParameters: {
            params: {
              client_id: this.client_id,
              token,
            },
          },
        }
      );

      if (!resp) {
        throw new Error('token is not valid');
      }

      const encodedClaims = token.split('.')[1];

      if (!encodedClaims) {
        throw new SyntaxError('malformed token');
      }

      const decodedClaims = JSON.parse(
        base64Decode(encodedClaims)
      ) as DecodedToken;

      return {
        address: decodedClaims.sub,
        clientID: decodedClaims.client_id,
        issuedAt: decodedClaims.iat,
        expiresAt: decodedClaims.exp,
        issuer: decodedClaims.iss,
        walletType: decodedClaims.wallet_type,
      };
    } catch (err) {
      throw err;
    }
  }

  async createOrganization({
    adminAddress,
    name,
    description,
  }: PostOrganizationArguments): Promise<
    rm.IRestResponse<CreateOrganizationAPIResponse>
  > {
    const body = signBody({
      input: {
        adminAddress,
        name,
        description: description || '',
      },
      secret: this.client_secret,
    });

    return await this.apiClient.create<CreateOrganizationAPIResponse>(
      `/s/${this.client_id}/organizations`,
      body
    );
  }

  async addRoleRequirementForOrganization({
    organizationID,
    contract,
    contractType,
    quantity,
    chainID,
    tokenTypeID,
    role,
    accessToken,
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
        accessToken,
      },
      secret: this.client_secret,
    });

    return await this.apiClient.create<RoleRequirementAPIResponse>(
      `/s/${this.client_id}/${organizationID}/role_requirement`,
      body
    );
  }

  async addWalletToRoleForOrganization({
    organizationID,
    wallet,
    role,
    accessToken,
  }: AddWalletToRoleOrganizationArguments): Promise<
    rm.IRestResponse<WalletRoleAPIResponse>
  > {
    const body = signBody({
      input: {
        wallet,
        role,
        accessToken,
      },
      secret: this.client_secret,
    });

    return await this.apiClient.create<WalletRoleAPIResponse>(
      `/s/${this.client_id}/${organizationID}/wallet_role`,
      body
    );
  }

  async deleteRoleRequirementForOrganization({
    organizationID,
    roleID,
    accessToken,
  }: DeleteRoleRequirementOrganizationArguments): Promise<
    rm.IRestResponse<RoleRequirementAPIResponse>
  > {
    const urlParams = signQuery({
      input: {
        roleID,
        accessToken,
      },
      secret: this.client_secret,
    });

    return await this.apiClient.del<RoleRequirementAPIResponse>(
      `/s/${this.client_id}/${organizationID}/role_requirement`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }

  async deleteRoleFromWalletForOrganization({
    organizationID,
    wallet,
    role,
    accessToken,
  }: DeleteRoleFromWalletOrganizationArguments): Promise<
    rm.IRestResponse<WalletRoleAPIResponse>
  > {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      input: {
        wallet,
        role: encodedRole,
        accessToken,
      },
      secret: this.client_secret,
    });

    return await this.apiClient.del<WalletRoleAPIResponse>(
      `/s/${this.client_id}/${organizationID}/wallet_role`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }
}
