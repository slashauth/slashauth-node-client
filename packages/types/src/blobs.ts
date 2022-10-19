export enum BlobStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type CreateBlobUploadArguments = {
  organizationID?: string;
  wallet: string;
  mimeType: string;
  fileSize: number;
};

export type CreateBlobUploadResponse = {
  data: CreatedBlobData;
};

export type CreatedBlobData = {
  id: string;
  signedUrl: string;
};

export type UpdateBlobUploadStatusArguments = {
  id: string;
  organizationID?: string;
  status: BlobStatus;
};

export type UpdateBlobUploadStatusResponse = {
  data: UpdatedBlobData;
};

export type UpdatedBlobData = {
  id: string;
  status: string;
};
