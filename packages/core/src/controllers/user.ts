import {
  AddAssignedRoleToUserArguments,
  AssignedRoleAPIResponse,
  CreateUserArguments,
  DecodedToken,
  GetOrgMembershipsForUserAPIResponse,
  Membership,
  GetOrgMembershipsForUserArguments,
  GetUserByIDArguments,
  GetUsersArguments,
  GetUsersResponse,
  UserRecord,
  HasRoleAPIResponse,
  HasRole,
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
import { WrappedClient, SlashauthResponse } from '../client';
import { signBody, signQuery } from '../utils/query';
import { base64Decode } from '../utils/strings';
import { Controller } from './controller';
import { getBaseURL } from '../utils/url';

const transformResponse =
  <I, O>(responseMapper: (data: I | null) => SlashauthResponse<O>['0']) =>
  ([data, ...res]: SlashauthResponse<I>): SlashauthResponse<O> =>
    [responseMapper(data), ...res];
// TODO: Need to add:
// - How do we add a user to an org?
export class UserController extends Controller {
  constructor(
    client_id: string,
    client_secret: string,
    apiClient: WrappedClient
  ) {
    super(client_id, client_secret, apiClient);
  }

  async validateToken({
    token,
  }: ValidateTokenArguments): Promise<ValidateTokenResponse> {
    try {
      const [_, meta] = await this.apiClient.get<ValidateTokenAPIResponse>(
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

      if (!meta || meta.statusCode !== 200) {
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
          const [user] = await this.getUserByID({ userID: decodedClaims.sub });

          return user && user.wallet;
        } else {
          // We already have the wallet address, return.
          return decodedClaims.sub;
        }
      };

      return {
        type: decodedClaims.type,
        userID: isUserID ? decodedClaims.sub : undefined,
        wallet: isUserID ? decodedClaims.wallet : decodedClaims.sub,
        clientID: decodedClaims.client_id,
        issuedAt: decodedClaims.iat,
        expiresAt: decodedClaims.exp,
        issuer: decodedClaims.iss,
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
  }: HasRoleArguments): Promise<SlashauthResponse<HasRole>> {
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

    return await this.apiClient
      .get<HasRoleAPIResponse>(url, {
        queryParameters: { params: urlParams },
      })
      .then(transformResponse((res) => res && res.hasRole));
  }

  async hasRoleWallet({
    address,
    role,
    organizationID,
  }: HasRoleWalletArguments): Promise<SlashauthResponse<HasRole>> {
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

    return await this.apiClient
      .get<HasRoleAPIResponse>(url, {
        queryParameters: { params: urlParams },
      })
      .then(transformResponse((res) => res && res.hasRole));
  }

  async hasRoleToken({
    token,
    role,
    organizationID,
  }: HasRoleTokenArguments): Promise<SlashauthResponse<HasRole>> {
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

    return this.apiClient
      .get<HasRoleAPIResponse>(url, {
        additionalHeaders: {
          Authorization: `Bearer ${token}`,
        },
        queryParameters: {
          params: urlParams,
        },
      })
      .then(transformResponse((res) => res && res.hasRole));
  }

  async getOrgMemberships({
    userID,
  }: GetOrgMembershipsForUserArguments): Promise<
    SlashauthResponse<Membership[]>
  > {
    const urlParams = signQuery({
      input: {
        userID,
      },
      secret: this.client_secret,
    });

    return this.apiClient
      .get<GetOrgMembershipsForUserAPIResponse>(
        `/s/${this.client_id}/org_memberships`,
        {
          queryParameters: {
            params: urlParams,
          },
        }
      )
      .then(transformResponse((res) => res && res.data));
  }

  async getUserByID({
    userID,
    organizationID,
  }: GetUserByIDArguments): Promise<SlashauthResponse<UserRecord>> {
    const input: { [key: string]: string } = {};

    if (organizationID) {
      input.organizationID = organizationID;
    }

    const urlParams = signQuery({
      input,
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/users/${userID}`;

    return this.apiClient
      .get<UserResponse>(url, {
        queryParameters: {
          params: urlParams,
        },
      })
      .then(
        transformResponse<UserResponse, UserRecord>((res) => res && res.data)
      );
  }

  async getUsers({
    organizationID,
    cursor,
  }: GetUsersArguments): Promise<SlashauthResponse<UserRecord[]>> {
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

    return this.apiClient
      .get<GetUsersResponse>(url, {
        queryParameters: {
          params: urlParams,
        },
      })
      .then((response) => {
        const [data, metadata, err] = response;

        return [
          transformResponse<GetUsersResponse, UserRecord[]>(
            (res) => res && res.data
          )(response)[0],
          { ...metadata, hasMore: data?.hasMore, cursor: data?.cursor },
          err,
        ];
      });
  }

  async createUser({
    wallet,
    email,
    phoneNumber,
    nickname,
    metadata,
  }: CreateUserArguments): Promise<SlashauthResponse<UserRecord>> {
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

    return await this.apiClient
      .create<UserResponse>(url, body)
      .then(transformResponse((res) => res && res.data));
  }

  async updateUserMetadata({
    userID,
    nickname,
    metadata,
    organizationID,
  }: PutUserMetadataArguments): Promise<SlashauthResponse<UserRecord>> {
    const body = signBody({
      input: {
        nickname,
        metadata,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/users/${userID}`;

    return await this.apiClient
      .replace<UserResponse>(url, body)
      .then(transformResponse((res) => res && res.data));
  }

  async addAssignedRole({
    userID,
    role,
    organizationID,
  }: AddAssignedRoleToUserArguments): Promise<
    SlashauthResponse<AssignedRoleAPIResponse>
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
    SlashauthResponse<AssignedRoleAPIResponse>
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
