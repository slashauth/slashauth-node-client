import {
  FileRecord,
  GetFileByIDArguments,
  CRUDFileResponse,
  GetPresignedURLForFileArguments,
  GetPresignedURLForFileResponse,
  PresignedURLForFile,
  ListFilesArguments,
  ListFilesResponse,
  CreateFileArguments,
  UpdateFileArguments,
  DeleteFileArguments,
  CreateBlobUploadArguments,
  CreateBlobUploadResponse,
  CreatedBlobData,
  UpdateBlobUploadStatusArguments,
  UpdateBlobUploadStatusResponse,
  UpdatedBlobData,
  AddFileArguments,
  BlobStatus,
} from '@slashauth/types';
import axios from 'axios';
import { WrappedClient, SlashauthResponse } from '../client';
import { signQuery, signBody } from '../utils/query';
import { checkBlobStatus } from '../utils/strings';
import { getBaseURL } from '../utils/url';

import { Controller } from './controller';

const transformResponse =
  <I, O>(responseMapper: (data: I | null) => SlashauthResponse<O>['0']) =>
  ([data, ...res]: SlashauthResponse<I>): SlashauthResponse<O> =>
    [responseMapper(data), ...res];

export class FileController extends Controller {
  constructor(
    client_id: string,
    client_secret: string,
    apiClient: WrappedClient
  ) {
    super(client_id, client_secret, apiClient);
  }

  async getFileByID({
    id,
    organizationID,
  }: GetFileByIDArguments): Promise<SlashauthResponse<FileRecord>> {
    const input: { [key: string]: string } = {};

    if (organizationID) {
      input.organizationID = organizationID;
    }

    const urlParams = signQuery({
      input,
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}`;

    return this.apiClient
      .get<CRUDFileResponse>(url, {
        queryParameters: {
          params: urlParams,
        },
      })
      .then(
        transformResponse<CRUDFileResponse, FileRecord>(
          (res) => res && res.data
        )
      );
  }

  async getPresignedURL({
    id,
    organizationID,
  }: GetPresignedURLForFileArguments): Promise<
    SlashauthResponse<PresignedURLForFile>
  > {
    const input: { [key: string]: string } = {};

    if (organizationID) {
      input.organizationID = organizationID;
    }

    const urlParams = signQuery({
      input,
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}/url`;

    return this.apiClient
      .get<GetPresignedURLForFileResponse>(url, {
        queryParameters: { params: urlParams },
      })
      .then(
        transformResponse<GetPresignedURLForFileResponse, PresignedURLForFile>(
          (res) => res && res.data.url
        )
      );
  }

  async listFiles({
    organizationID,
    cursor,
  }: ListFilesArguments): Promise<SlashauthResponse<FileRecord[]>> {
    const input: { [key: string]: string } = {};

    if (organizationID) {
      input.organizationID = organizationID;
    }
    if (cursor) {
      input.cursor = cursor;
    }

    const urlParams = signQuery({
      input,
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files`;

    return this.apiClient
      .get<ListFilesResponse>(url, { queryParameters: { params: urlParams } })
      .then((response) => {
        const [data, metadata, err] = response;

        return [
          transformResponse<ListFilesResponse, FileRecord[]>(
            (res) => res && res.data
          )(response)[0],
          { ...metadata, hasMore: data?.hasMore, cursor: data?.cursor },
          err,
        ];
      });
  }

  async addFile({
    organizationID,
    userID,
    name,
    description,
    rolesRequired,
    mimeType,
    file,
  }: AddFileArguments): Promise<SlashauthResponse<FileRecord>> {
    const [blobUpload] = await this.createBlobUpload({
      organizationID,
      wallet: userID,
      mimeType,
      fileSize: file.length, // TODO: Change this
    });

    if (!blobUpload) {
      throw new Error('Failed to upload file');
    }

    const { signedUrl: uploadURL, id } = blobUpload;

    await axios({
      method: 'PUT',
      url: uploadURL,
      data: file,
      headers: {
        'Content-Type': mimeType,
      },
    });

    await this.updateBlobUploadStatus({
      id,
      organizationID,
      status: BlobStatus.COMPLETED,
    });

    return this.createFile({
      organizationID,
      blobID: id,
      wallet: userID,
      name,
      description,
      rolesRequired,
    });
  }

  async updateFile({
    id,
    organizationID,
    name,
    description,
    rolesRequired,
  }: UpdateFileArguments): Promise<SlashauthResponse<FileRecord>> {
    const body = signBody({
      input: {
        name,
        description,
        rolesRequired,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}`;

    return await this.apiClient
      .update<CRUDFileResponse>(url, body)
      .then(
        transformResponse<CRUDFileResponse, FileRecord>(
          (res) => res && res.data
        )
      );
  }

  async deleteFile({
    id,
    organizationID,
  }: DeleteFileArguments): Promise<SlashauthResponse<FileRecord>> {
    const urlParams = signQuery({
      input: {}, // TODO: Does this need to exist?
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}`;

    return await this.apiClient
      .del<CRUDFileResponse>(url, {
        queryParameters: {
          params: urlParams,
        },
      })
      .then(
        transformResponse<CRUDFileResponse, FileRecord>(
          (res) => res && res.data
        )
      );
  }

  private async createFile({
    organizationID,
    blobID,
    wallet,
    name,
    description,
    rolesRequired,
  }: CreateFileArguments): Promise<SlashauthResponse<FileRecord>> {
    const body = signBody({
      input: {
        blobID,
        wallet,
        name,
        description,
        rolesRequired,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files`;

    return await this.apiClient
      .create<CRUDFileResponse>(url, body)
      .then(
        transformResponse<CRUDFileResponse, FileRecord>(
          (res) => res && res.data
        )
      );
  }

  // BLOBS
  private async createBlobUpload({
    organizationID,
    wallet,
    mimeType,
    fileSize,
  }: CreateBlobUploadArguments): Promise<SlashauthResponse<CreatedBlobData>> {
    const body = signBody({
      input: {
        wallet,
        mimeType,
        fileSize,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/blobs`;

    return await this.apiClient
      .create<CreateBlobUploadResponse>(url, body)
      .then(
        transformResponse<CreateBlobUploadResponse, CreatedBlobData>(
          (res) => res && res.data
        )
      );
  }

  private async updateBlobUploadStatus({
    id,
    organizationID,
    status,
  }: UpdateBlobUploadStatusArguments): Promise<
    SlashauthResponse<UpdatedBlobData>
  > {
    const statusString = checkBlobStatus(status);
    const body = signBody({
      input: {
        status: statusString,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/blobs/${id}`;

    return await this.apiClient
      .update<UpdateBlobUploadStatusResponse>(url, body)
      .then(
        transformResponse<UpdateBlobUploadStatusResponse, UpdatedBlobData>(
          (res) => res && res.data
        )
      );
  }
}
