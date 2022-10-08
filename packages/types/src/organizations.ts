import { MaybeStringInput } from './utils';

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

export type PostOrganizationArguments = {
  name: string;
  description?: string;
};

export type PutOrganizationArguments = {
  organizationID: string;
  name: MaybeStringInput;
  description?: MaybeStringInput;
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
};

export type DeleteRoleRequirementOrganizationArguments = {
  organizationID: string;
  roleID: string;
};
