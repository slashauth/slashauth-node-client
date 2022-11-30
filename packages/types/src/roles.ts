import { ChainId } from './enums';
import { ObjectMap } from './utils';

type UserRoleType = {
  AssignedRole: 'ASSIGNED_ROLE';
  RoleRequirement: 'ROLE_REQUIREMENT';
  WalletRole: 'WALLET_ROLE';
};

export type HasRoleArguments = {
  userID: string;
  role: string;
  organizationID?: string;
};

export type HasRoleWalletArguments = {
  address: string;
  role: string;
  organizationID?: string;
};

export type HasRoleTokenArguments = {
  token: string;
  role: string;
  organizationID?: string;
};

export type HasRoleAPIResponse = {
  hasRole: boolean;
};

export type RoleRequirementAPIResponse = {
  id: string;
  role: string;
  contract: string;
  contractType: string;
  quantity: number;
  chainID: ChainId;
  tokenTypeID?: number;
};

export type AssignedRoleAPIResponse = {
  type: UserRoleType;
  level: {
    name: string;
    description?: string;
  };
};

export type GetRoleRestrictedDataArguments = {
  role: string;
};

export type UpdateRoleRestrictedDataArguments = {
  role: string;
  metadata: ObjectMap;
};

export type RoleRestrictedDataAPIResponse = {
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
