import { ObjectMap } from './utils';

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

export type GetUserByIDArguments = {
  userID: string;
  organizationID?: string;
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

export type CreateUserArguments = {
  wallet?: string;
  email?: string;
  nickname?: string;
  metadata?: ObjectMap;
};

export type PutUserMetadataArguments = {
  userID: string;
  nickname?: string;
  metadata?: ObjectMap;
  organizationID?: string;
};

export type UserResponse = {
  data: UserRecord;
};
