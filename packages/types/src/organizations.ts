import { ChainId } from './enums';

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
  name?: string;
  description: string;
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
  chainID: ChainId;
  tokenTypeID?: number;
  role: string;
};

export type DeleteRoleRequirementOrganizationArguments = {
  organizationID: string;
  roleID: string;
};
