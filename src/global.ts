type MaybeStringInput = {
  input?: string;
};

export enum BlobStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

type ObjectMap = {
  [key: string]: any;
};

export type UserRecord = {
  clientID: string;
  organizationID?: string;
  wallet: string;
  nickname?: string;
  roles: string[];
  metadata?: ObjectMap;
  createdAt: string;
  updatedAt: string;
};

export type FileRecord = {
  id: string;
  blobID: string;
  clientID: string;
  organizationID?: string;
  wallet: string;
  name: string;
  description?: string;
  rolesRequired: string[];
  createdAt: string;
  updatedAt: string;
};

export type GetQueryStringSignatureOptions = {
  input: { [key: string]: string };
  secret: string;
  nonce?: string;
};

export type PostBodySignatureOptions = {
  input: { [key: string]: any };
  secret: string;
  nonce?: string;
};

export type GetAppResponse = {
  data: {
    clientID: string;
    name: string;
    description?: string;
  };
};

export type HasRoleArguments = {
  address: string;
  role: string;
};

export type HasOrgRoleArguments = {
  organizationID: string;
  address: string;
  role: string;
};

export type HasRoleAPIResponse = {
  hasRole: boolean;
};

export type GetOrgMembershipsForUserArguments = {
  userID: string;
};

export type GetOrgMembershipsForUserAPIResponse = {
  data: [
    {
      clientID: string;
      organizationID: string;
      userID: string;
      roles: string[];
    }
  ];
};

export type ValidateTokenArguments = {
  token: string;
};

export type ValidateTokenAPIResponse = {
  isValid: boolean;
};

export type ValidateTokenResponse = {
  address: string;
  clientID: string;
  issuedAt: number;
  expiresAt: number;
  issuer: string;
  walletType: string;
};

export type DecodedToken = {
  type: string;
  client_id: string;
  aud: string[];
  iat: number;
  exp: number;
  iss: string;
  sub: string;
  wallet_type: string;
};

export type PostOrganizationArguments = {
  name: string;
  description?: string;
  accessToken: string;
};

export type PutOrganizationArguments = {
  organizationID: string;
  name: MaybeStringInput;
  description?: MaybeStringInput;
  accessToken: string;
};

export type UpsertOrganizationAPIResponse = {
  organizationID: string;
  clientID: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type AddRoleRequirementOrganizationArguments = {
  organizationID: string;
  contract: string;
  contractType: string;
  quantity: number;
  chainID: string;
  tokenTypeID?: number;
  role: string;
  accessToken: string;
};

export type AddWalletToRoleOrganizationArguments = {
  organizationID: string;
  wallet: string;
  role: string;
  accessToken: string;
};

export type DeleteRoleRequirementOrganizationArguments = {
  organizationID: string;
  roleID: string;
  accessToken: string;
};

export type DeleteRoleFromWalletOrganizationArguments = {
  organizationID: string;
  wallet: string;
  role: string;
  accessToken: string;
};

export type RoleRequirementAPIResponse = {
  id: string;
  roleLevel: string;
  contract: string;
  contractType: string;
  quantity: number;
  chainID: string;
  tokenTypeID?: number;
};

export type WalletRoleAPIResponse = {
  wallet: string;
  roleLevels: string[];
};

export type GetAppRoleMetadataArguments = {
  role: string;
};

export type UpdateAppRoleMetadataArguments = {
  role: string;
  metadata: ObjectMap;
};

export type AppRoleMetadataResponse = {
  data: ObjectMap;
};

export type GetUserByIDArguments = {
  userID: string;
  organizationID?: string;
};

export type GetUserByIDResponse = {
  data: UserRecord;
};

export type GetUsersArguments = {
  organizationID?: string;
  cursor?: string;
};

export type GetUsersResponse = {
  data: UserRecord[];
  hasMore: boolean;
  cursor?: string;
};

export type PutUserMetadataArguments = {
  userID: string;
  nickname?: string;
  metadata?: ObjectMap;
  organizationID?: string;
};

export type PutUserMetadataResponse = {
  data: UserRecord;
};

export type GetFileByIDArguments = {
  fileID: string;
  organizationID?: string;
};

export type GetPresignedURLForFileArguments = {
  fileID: string;
  organizationID?: string;
};

export type GetPresignedURLForFileResponse = {
  data: {
    url: string;
  };
};

export type ListFilesArguments = {
  organizationID?: string;
  cursor?: string;
};

export type ListFilesResponse = {
  data: FileRecord[];
  hasMore: boolean;
  cursor?: string;
};

export type CreateFileArguments = {
  organizationID?: string;
  blobID: string;
  wallet: string;
  name: string;
  description?: string;
  rolesRequired: string[];
};

export type CRUDFileResponse = {
  data: FileRecord;
};

export type UpdateFileArguments = {
  organizationID?: string;
  fileID: string;
  name?: MaybeStringInput;
  description?: MaybeStringInput;
  rolesRequired?: string[];
};

export type DeleteFileArguments = {
  organizationID?: string;
  fileID: string;
};

export type CreateBlobUploadArguments = {
  organizationID?: string;
  wallet: string;
  mimeType: string;
  fileSize: number;
};

export type CreateBlobUploadResponse = {
  data: {
    id: string;
    signedURL: string;
  };
};

export type UpdateBlobUploadStatusArguments = {
  organizationID?: string;
  blobID: string;
  status: BlobStatus;
};

export type UpdateBlobUploadStatusResponse = {
  data: {
    id: string;
    status: string;
  };
};
