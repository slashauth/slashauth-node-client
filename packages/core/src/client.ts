import * as rm from 'typed-rest-client';
import { Config, PROD_ENDPOINT } from './config';
import {
  AddRoleRequirementOrganizationArguments,
  DecodedToken,
  DeleteRoleRequirementOrganizationArguments,
  HasRoleAPIResponse,
  HasRoleArguments,
  UpsertOrganizationAPIResponse,
  PostOrganizationArguments,
  RoleRequirementAPIResponse,
  ValidateTokenAPIResponse,
  ValidateTokenArguments,
  ValidateTokenResponse,
  HasOrgRoleArguments,
  PutOrganizationArguments,
  GetOrgMembershipsForUserArguments,
  GetOrgMembershipsForUserAPIResponse,
  GetAppResponse,
  GetAppRoleMetadataArguments,
  AppRoleMetadataResponse,
  UpdateAppRoleMetadataArguments,
  GetUsersArguments,
  GetUsersResponse,
  PutUserMetadataArguments,
  GetUserByIDArguments,
  GetFileByIDArguments,
  ListFilesResponse,
  ListFilesArguments,
  CreateBlobUploadArguments,
  CreateBlobUploadResponse,
  UpdateBlobUploadStatusArguments,
  UpdateBlobUploadStatusResponse,
  CRUDFileResponse,
  CreateFileArguments,
  UpdateFileArguments,
  DeleteFileArguments,
  GetPresignedURLForFileArguments,
  GetPresignedURLForFileResponse,
  HasRoleTokenArguments,
  UserResponse,
  CreateUserArguments,
  AssignedRoleAPIResponse,
  RemoveAssignedRoleFromUserArguments,
  AddAssignedRoleToUserArguments,
} from '@slashauth/types';
import { signQuery, signBody } from './query';
import { base64Decode, checkBlobStatus } from './utils/strings';
import { getBaseURL } from './utils/url';

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

  async getApp(): Promise<rm.IRestResponse<GetAppResponse>> {
    return this.apiClient.get<GetAppResponse>(`/s/${this.client_id}`);
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

  async hasRoleToken({
    token,
    role,
  }: HasRoleTokenArguments): Promise<rm.IRestResponse<HasRoleAPIResponse>> {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = {
      role: encodedRole,
      encoded: 'true',
    };

    return this.apiClient.get<HasRoleAPIResponse>(
      `/p/${this.client_id}/has_role`,
      {
        additionalHeaders: {
          Authorization: `Bearer ${token}`,
        },
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
      `/s/${this.client_id}/organizations/${organizationID}/has_role`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }

  async getOrgMembershipsForUser({
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

  async addRoleRequirementForOrganization({
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

  async addAssignedRoleToUser({
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

    let url: string;
    if (organizationID) {
      url = `/s/${this.client_id}/organizations/${organizationID}/users/${userID}/assigned_role`;
    } else {
      url = `/s/${this.client_id}/users/${userID}/assigned_role`;
    }

    return await this.apiClient.create<AssignedRoleAPIResponse>(url, body);
  }

  async removeAssignedRoleFromUser({
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

    let url: string;
    if (organizationID) {
      url = `/s/${this.client_id}/organizations/${organizationID}/users/${userID}/assigned_role`;
    } else {
      url = `/s/${this.client_id}/users/${userID}/assigned_role`;
    }

    return await this.apiClient.del<AssignedRoleAPIResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  async deleteRoleRequirementForOrganization({
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

  // RoleMetadata
  async getAppRoleMetadata({
    role,
  }: GetAppRoleMetadataArguments): Promise<
    rm.IRestResponse<AppRoleMetadataResponse>
  > {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      input: {
        role: encodedRole,
        encoded: 'true',
      },
      secret: this.client_secret,
    });

    return this.apiClient.get<AppRoleMetadataResponse>(
      `/s/${this.client_id}/role_metadata`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }

  async updateAppRoleMetadata({
    role,
    metadata,
  }: UpdateAppRoleMetadataArguments): Promise<
    rm.IRestResponse<AppRoleMetadataResponse>
  > {
    const body = signBody({
      input: {
        roleLevel: role,
        metadata,
      },
      secret: this.client_secret,
    });

    return await this.apiClient.replace<AppRoleMetadataResponse>(
      `/s/${this.client_id}/role_metadata`,
      body
    );
  }

  // Users
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

    let url: string;
    if (organizationID) {
      url = `/s/${this.client_id}/organizations/${organizationID}/users/${userID}`;
    } else {
      url = `/s/${this.client_id}/users/${userID}`;
    }

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

    let url: string;
    if (organizationID) {
      url = `/s/${this.client_id}/organizations/${organizationID}/users`;
    } else {
      url = `/s/${this.client_id}/users`;
    }

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

    let url: string;
    if (organizationID) {
      url = `/s/${this.client_id}/organizations/${organizationID}/users/${userID}`;
    } else {
      url = `/s/${this.client_id}/users/${userID}`;
    }

    return await this.apiClient.replace<UserResponse>(url, body);
  }

  // FILES
  async getFileByID({
    id,
    organizationID,
  }: GetFileByIDArguments): Promise<rm.IRestResponse<CRUDFileResponse>> {
    const input: { [key: string]: string } = {};

    if (organizationID) {
      input.organizationID = organizationID;
    }

    const urlParams = signQuery({
      input,
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}`;

    return this.apiClient.get<CRUDFileResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  async getPresignedURLForFile({
    id,
    organizationID,
  }: GetPresignedURLForFileArguments): Promise<
    rm.IRestResponse<GetPresignedURLForFileResponse>
  > {
    const input: { [key: string]: string } = {};

    if (organizationID) {
      input.organizationID = organizationID;
    }

    const urlParams = signQuery({
      input,
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}/url`;

    return this.apiClient.get<GetPresignedURLForFileResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  async listFiles({
    organizationID,
    cursor,
  }: ListFilesArguments): Promise<rm.IRestResponse<ListFilesResponse>> {
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

    const url = `${getBaseURL(this.client_id, organizationID)}/files`;

    return this.apiClient.get<ListFilesResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  async createFile({
    organizationID,
    blobID,
    wallet,
    name,
    description,
    rolesRequired,
  }: CreateFileArguments): Promise<rm.IRestResponse<CRUDFileResponse>> {
    const body = signBody({
      input: {
        blobID,
        wallet,
        name,
        description,
        rolesRequired,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files`;

    return await this.apiClient.create<CRUDFileResponse>(url, body);
  }

  async updateFile({
    id,
    organizationID,
    name,
    description,
    rolesRequired,
  }: UpdateFileArguments): Promise<rm.IRestResponse<CRUDFileResponse>> {
    const body = signBody({
      input: {
        name,
        description,
        rolesRequired,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}`;

    return await this.apiClient.update<CRUDFileResponse>(url, body);
  }

  async deleteFile({
    id,
    organizationID,
  }: DeleteFileArguments): Promise<rm.IRestResponse<CRUDFileResponse>> {
    const urlParams = signQuery({
      input: {}, // TODO: Does this need to exist?
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}`;

    return await this.apiClient.del<CRUDFileResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  // BLOBS
  async createBlobUpload({
    organizationID,
    wallet,
    mimeType,
    fileSize,
  }: CreateBlobUploadArguments): Promise<
    rm.IRestResponse<CreateBlobUploadResponse>
  > {
    const body = signBody({
      input: {
        wallet,
        mimeType,
        fileSize,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/blobs`;

    return await this.apiClient.create<CreateBlobUploadResponse>(url, body);
  }

  async updateBlobUploadStatus({
    id,
    organizationID,
    status,
  }: UpdateBlobUploadStatusArguments): Promise<
    rm.IRestResponse<UpdateBlobUploadStatusResponse>
  > {
    const statusString = checkBlobStatus(status);
    const body = signBody({
      input: {
        status: statusString,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/blobs/${id}`;

    return await this.apiClient.update<UpdateBlobUploadStatusResponse>(
      url,
      body
    );
  }
}
