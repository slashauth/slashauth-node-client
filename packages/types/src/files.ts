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

export type GetFileByIDArguments = {
  id: string;
  organizationID?: string;
};

export type GetPresignedURLForFileArguments = {
  id: string;
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

export type AddFileArguments = {
  organizationID?: string;
  userID: string;
  name: string;
  description?: string;
  rolesRequired: string[];
  mimeType: string;
  file: File;
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
  id: string;
  organizationID?: string;
  name?: string;
  description?: string;
  rolesRequired?: string[];
};

export type DeleteFileArguments = {
  id: string;
  organizationID?: string;
};
