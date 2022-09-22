import { ObjectMap } from './utils';

export type HasRoleArguments = {
  address: string;
  role: string;
};

export type HasRoleTokenArguments = {
  token: string;
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
