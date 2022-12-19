import { ObjectMap, PaginationMetadata } from './utils';

export type UserRecord = {
  id: string;
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

export type GetUsersResponse = UsersMetadata & {
  data: UserRecord[];
};

type UsersMetadata = PaginationMetadata;

export type CreateUserArguments = {
  wallet?: string;
  email?: string;
  phoneNumber?: string;
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
