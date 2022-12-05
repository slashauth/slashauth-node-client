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
  data: {
    id: string;
    signedUrl: string;
  };
};

export type UpdateBlobUploadStatusArguments = {
  id: string;
  organizationID?: string;
  status: BlobStatus;
};

export type UpdateBlobUploadStatusResponse = {
  data: {
    id: string;
    status: string;
  };
};
