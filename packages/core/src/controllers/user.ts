import * as rm from 'typed-rest-client';
import {
  AddAssignedRoleToUserArguments,
  AssignedRoleAPIResponse,
  CreateUserArguments,
  DecodedToken,
  GetOrgMembershipsForUserAPIResponse,
  GetOrgMembershipsForUserArguments,
  GetUserByIDArguments,
  GetUsersArguments,
  GetUsersResponse,
  HasRoleAPIResponse,
  HasRoleArguments,
  HasRoleTokenArguments,
  HasRoleWalletArguments,
  PutUserMetadataArguments,
  RemoveAssignedRoleFromUserArguments,
  UserResponse,
  ValidateTokenAPIResponse,
  ValidateTokenArguments,
  ValidateTokenResponse,
} from '@slashauth/types';
import { signBody, signQuery } from '../utils/query';
import { base64Decode } from '../utils/strings';
import { Controller } from './controller';
import { getBaseURL } from '../utils/url';

// TODO: Need to add:
// - How do we add a user to an org?
export class UserController extends Controller {
  constructor(
    client_id: string,
    client_secret: string,
    apiClient: rm.RestClient
  ) {
    super(client_id, client_secret, apiClient);
  }

  async validateToken({
    token,
  }: ValidateTokenArguments): Promise<ValidateTokenResponse> {
    try {
      const resp = await this.apiClient.get<ValidateTokenAPIResponse>(
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

      if (!resp || !resp.statusCode || resp.statusCode !== 200) {
        throw new Error('token is not valid');
      }

      const encodedClaims = token.split('.')[1];

      if (!encodedClaims) {
        throw new SyntaxError('malformed token');
      }

      const decodedClaims = JSON.parse(
        base64Decode(encodedClaims)
      ) as DecodedToken;

      let isUserID: boolean = false;
      if (decodedClaims.sub.startsWith('user.')) {
        isUserID = true;
      }

      const getWalletAddress = async (): Promise<string | null> => {
        if (isUserID) {
          const user = await this.getUserByID({ userID: decodedClaims.sub });
          if (user.result?.data.wallet) {
            return user.result?.data.wallet;
          } else {
            return null;
          }
        } else {
          // We already have the wallet address, return.
          return decodedClaims.sub;
        }
      };

      return {
        userID: isUserID ? decodedClaims.sub : undefined,
        address: isUserID ? undefined : decodedClaims.sub,
        clientID: decodedClaims.client_id,
        issuedAt: decodedClaims.iat,
        expiresAt: decodedClaims.exp,
        issuer: decodedClaims.iss,
        walletType: decodedClaims.wallet_type,
        getWalletAddress,
      };
    } catch (err) {
      throw err;
    }
  }

  async hasRole({
    userID,
    role,
    organizationID,
  }: HasRoleArguments): Promise<rm.IRestResponse<HasRoleAPIResponse>> {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      input: {
        userID,
        role: encodedRole,
        encoded: 'true',
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/has_role`;

    return await this.apiClient.get<HasRoleAPIResponse>(url, {
      queryParameters: { params: urlParams },
    });
  }

  async hasRoleWallet({
    address,
    role,
    organizationID,
  }: HasRoleWalletArguments): Promise<rm.IRestResponse<HasRoleAPIResponse>> {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      input: {
        address,
        role: encodedRole,
        encoded: 'true',
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/has_role`;

    return await this.apiClient.get<HasRoleAPIResponse>(url, {
      queryParameters: { params: urlParams },
    });
  }

  async hasRoleToken({
    token,
    role,
    organizationID,
  }: HasRoleTokenArguments): Promise<rm.IRestResponse<HasRoleAPIResponse>> {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = {
      role: encodedRole,
      encoded: 'true',
    };

    let url: string;
    if (organizationID) {
      url = `/p/${this.client_id}/organizations/${organizationID}/has_role`;
    } else {
      url = `/p/${this.client_id}/has_role`;
    }

    return this.apiClient.get<HasRoleAPIResponse>(url, {
      additionalHeaders: {
        Authorization: `Bearer ${token}`,
      },
      queryParameters: {
        params: urlParams,
      },
    });
  }

  async getOrgMemberships({
    userID,
  }: GetOrgMembershipsForUserArguments): Promise<
    rm.IRestResponse<GetOrgMembershipsForUserAPIResponse>
  > {
    const urlParams = signQuery({
      input: {
        userID,
      },
      secret: this.client_secret,
    });

    return this.apiClient.get<GetOrgMembershipsForUserAPIResponse>(
      `/s/${this.client_id}/org_memberships`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }

  async getUserByID({
    userID,
    organizationID,
  }: GetUserByIDArguments): Promise<rm.IRestResponse<UserResponse>> {
    const input: { [key: string]: string } = {};

    if (organizationID) {
      input.organizationID = organizationID;
    }

    const urlParams = signQuery({
      input,
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/users/${userID}`;

    return this.apiClient.get<UserResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  async getUsers({
    organizationID,
    cursor,
  }: GetUsersArguments): Promise<rm.IRestResponse<GetUsersResponse>> {
    const input: { [key: string]: string } = {};

    if (organizationID) {
      input.organizationID = organizationID;
    }
    if (cursor) {
      input.cursor = cursor;
    }

    const urlParams = signQuery({
      input,
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/users`;

    return this.apiClient.get<GetUsersResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  async createUser({
    wallet,
    email,
    phoneNumber,
    nickname,
    metadata,
  }: CreateUserArguments): Promise<rm.IRestResponse<UserResponse>> {
    const body = signBody({
      input: {
        wallet,
        email,
        phoneNumber,
        nickname,
        metadata,
      },
      secret: this.client_secret,
    });

    const url = `/s/${this.client_id}/users`;

    return await this.apiClient.create<UserResponse>(url, body);
  }

  async updateUserMetadata({
    userID,
    nickname,
    metadata,
    organizationID,
  }: PutUserMetadataArguments): Promise<rm.IRestResponse<UserResponse>> {
    const body = signBody({
      input: {
        nickname,
        metadata,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/users/${userID}`;

    return await this.apiClient.replace<UserResponse>(url, body);
  }

  async addAssignedRole({
    userID,
    role,
    organizationID,
  }: AddAssignedRoleToUserArguments): Promise<
    rm.IRestResponse<AssignedRoleAPIResponse>
  > {
    const body = signBody({
      input: {
        role,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(
      this.client_id,
      organizationID
    )}/users/${userID}/assigned_role`;

    return await this.apiClient.create<AssignedRoleAPIResponse>(url, body);
  }

  async removeAssignedRole({
    userID,
    role,
    organizationID,
  }: RemoveAssignedRoleFromUserArguments): Promise<
    rm.IRestResponse<AssignedRoleAPIResponse>
  > {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      input: {
        role: encodedRole,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(
      this.client_id,
      organizationID
    )}/users/${userID}/assigned_role`;

    return await this.apiClient.del<AssignedRoleAPIResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }
}
