import {
  GetFileByIDArguments,
  CRUDFileResponse,
  GetPresignedURLForFileArguments,
  GetPresignedURLForFileResponse,
  ListFilesArguments,
  ListFilesResponse,
  CreateFileArguments,
  UpdateFileArguments,
  DeleteFileArguments,
  CreateBlobUploadArguments,
  CreateBlobUploadResponse,
  UpdateBlobUploadStatusArguments,
  UpdateBlobUploadStatusResponse,
  AddFileArguments,
  BlobStatus,
} from '@slashauth/types';
import axios from 'axios';
import * as rm from 'typed-rest-client';
import { signQuery, signBody } from '../utils/query';
import { checkBlobStatus } from '../utils/strings';
import { getBaseURL } from '../utils/url';

import { Controller } from './controller';

export class FileController extends Controller {
  constructor(
    client_id: string,
    client_secret: string,
    apiClient: rm.RestClient
  ) {
    super(client_id, client_secret, apiClient);
  }

  async getFileByID({
    id,
    organizationID,
  }: GetFileByIDArguments): Promise<rm.IRestResponse<CRUDFileResponse>> {
    const input: { [key: string]: string } = {};

    if (organizationID) {
      input.organizationID = organizationID;
    }

    const urlParams = signQuery({
      input,
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}`;

    return this.apiClient.get<CRUDFileResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  async getPresignedURLForFile({
    id,
    organizationID,
  }: GetPresignedURLForFileArguments): Promise<
    rm.IRestResponse<GetPresignedURLForFileResponse>
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

    return this.apiClient.get<GetPresignedURLForFileResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  async listFiles({
    organizationID,
    cursor,
  }: ListFilesArguments): Promise<rm.IRestResponse<ListFilesResponse>> {
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

    return this.apiClient.get<ListFilesResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
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
  }: AddFileArguments): Promise<rm.IRestResponse<CRUDFileResponse>> {
    const blobUpload = await this.createBlobUpload({
      organizationID,
      wallet: userID,
      mimeType,
      fileSize: file.size,
    });

    if (!blobUpload?.result) {
      throw new Error('Failed to upload file');
    }

    const uploadURL = blobUpload.result.data.signedURL;
    await axios({
      method: 'PUT',
      url: uploadURL,
      data: file,
      headers: {
        'Content-Type': mimeType,
      },
    });

    await this.updateBlobUploadStatus({
      id: blobUpload.result.data.id,
      organizationID,
      status: BlobStatus.COMPLETED,
    });

    return this.createFile({
      organizationID,
      blobID: blobUpload.result.data.id,
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
  }: UpdateFileArguments): Promise<rm.IRestResponse<CRUDFileResponse>> {
    const body = signBody({
      input: {
        name,
        description,
        rolesRequired,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}`;

    return await this.apiClient.update<CRUDFileResponse>(url, body);
  }

  async deleteFile({
    id,
    organizationID,
  }: DeleteFileArguments): Promise<rm.IRestResponse<CRUDFileResponse>> {
    const urlParams = signQuery({
      input: {}, // TODO: Does this need to exist?
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/files/${id}`;

    return await this.apiClient.del<CRUDFileResponse>(url, {
      queryParameters: {
        params: urlParams,
      },
    });
  }

  private async createFile({
    organizationID,
    blobID,
    wallet,
    name,
    description,
    rolesRequired,
  }: CreateFileArguments): Promise<rm.IRestResponse<CRUDFileResponse>> {
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

    return await this.apiClient.create<CRUDFileResponse>(url, body);
  }

  // BLOBS
  private async createBlobUpload({
    organizationID,
    wallet,
    mimeType,
    fileSize,
  }: CreateBlobUploadArguments): Promise<
    rm.IRestResponse<CreateBlobUploadResponse>
  > {
    const body = signBody({
      input: {
        wallet,
        mimeType,
        fileSize,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/blobs`;

    return await this.apiClient.create<CreateBlobUploadResponse>(url, body);
  }

  private async updateBlobUploadStatus({
    id,
    organizationID,
    status,
  }: UpdateBlobUploadStatusArguments): Promise<
    rm.IRestResponse<UpdateBlobUploadStatusResponse>
  > {
    const statusString = checkBlobStatus(status);
    const body = signBody({
      input: {
        status: statusString,
      },
      secret: this.client_secret,
    });

    const url = `${getBaseURL(this.client_id, organizationID)}/blobs/${id}`;

    return await this.apiClient.update<UpdateBlobUploadStatusResponse>(
      url,
      body
    );
  }
}
