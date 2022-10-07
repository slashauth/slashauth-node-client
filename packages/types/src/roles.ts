import { ObjectMap } from './utils';

type UserRoleType = {
  AssignedRole: 'ASSIGNED_ROLE';
  RoleRequirement: 'ROLE_REQUIREMENT';
  WalletRole: 'WALLET_ROLE';
};

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

export type AssignedRoleAPIResponse = {
  type: UserRoleType;
  level: {
    name: string;
    description?: string;
  };
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

export type AddAssignedRoleToUserArguments = {
  userID: string;
  role: string;
  organizationID?: string;
};

export type RemoveAssignedRoleFromUserArguments = {
  userID: string;
  organizationID?: string;
  role: string;
};
