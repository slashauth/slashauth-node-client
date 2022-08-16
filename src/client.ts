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
  UpsertOrganizationAPIResponse,
  PostOrganizationArguments,
  RoleRequirementAPIResponse,
  ValidateTokenAPIResponse,
  ValidateTokenArguments,
  ValidateTokenResponse,
  WalletRoleAPIResponse,
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
  PutUserMetadataResponse,
  GetUserByIDArguments,
  GetUserByIDResponse,
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
} from './global';
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
    name,
    description,
    accessToken,
  }: PostOrganizationArguments): Promise<
    rm.IRestResponse<UpsertOrganizationAPIResponse>
  > {
    const body = signBody({
      input: {
        accessToken,
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
    accessToken,
  }: PutOrganizationArguments): Promise<
    rm.IRestResponse<UpsertOrganizationAPIResponse>
  > {
    const body = signBody({
      input: {
        accessToken,
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
      `/s/${this.client_id}/organizations/${organizationID}/role_requirement`,
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
      `/s/${this.client_id}/organizations/${organizationID}/wallet_role`,
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
      `/s/${this.client_id}/organizations/${organizationID}/role_requirement`,
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
      `/s/${this.client_id}/organizations/${organizationID}/wallet_role`,
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
  }: GetUserByIDArguments): Promise<rm.IRestResponse<GetUserByIDResponse>> {
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

    return this.apiClient.get<GetUserByIDResponse>(url, {
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

  async updateUserMetadata({
    userID,
    nickname,
    metadata,
    organizationID,
  }: PutUserMetadataArguments): Promise<
    rm.IRestResponse<PutUserMetadataResponse>
  > {
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

    return await this.apiClient.replace<PutUserMetadataResponse>(url, body);
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
