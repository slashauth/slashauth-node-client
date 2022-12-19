import * as rm from 'typed-rest-client';
import { Config, PROD_ENDPOINT } from './config';
import { OrganizationController } from './controllers/organization';
import { UserController } from './controllers/user';
import { FileController } from './controllers/file';
import { AppController } from './controllers/app';

type ErrorMessage = string;

type PageInfo = {
  cursor?: string;
  hasMore: boolean;
};

type Metadata = {
  error: ErrorMessage | null;
  headers: Object;
  statusCode: number;
};

export type SlashauthResponse<ResponseData> = {
  data?: ResponseData;
} & Metadata;

export type SlashauthResponseWithPagination<ResponseData> = {
  data?: {
    data: ResponseData | PageInfo | null;
    pageInfo: PageInfo;
  };
} & Metadata;

type TypeOfClassMethod<T, M extends keyof T> = T[M] extends Function
  ? T[M]
  : never;

export interface WrappedClient {
  get<T>(
    ...args: Parameters<TypeOfClassMethod<rm.RestClient, 'get'>>
  ): Promise<SlashauthResponse<T>>;
  create<T>(
    ...args: Parameters<TypeOfClassMethod<rm.RestClient, 'create'>>
  ): Promise<SlashauthResponse<T>>;
  replace<T>(
    ...args: Parameters<TypeOfClassMethod<rm.RestClient, 'replace'>>
  ): Promise<SlashauthResponse<T>>;
  del<T>(
    ...args: Parameters<TypeOfClassMethod<rm.RestClient, 'del'>>
  ): Promise<SlashauthResponse<T>>;
  update<T>(
    ...args: Parameters<TypeOfClassMethod<rm.RestClient, 'update'>>
  ): Promise<SlashauthResponse<T>>;
}

export class SlashauthClient {
  // Controllers
  app: AppController;
  user: UserController;
  organization: OrganizationController;
  file: FileController;

  constructor(
    client_id: string,
    client_secret: string,
    additional: Partial<Config>
  ) {
    const identifier = `node-rest-client_${additional.version || '1.0.0'}`;
    const rawApiClient = new rm.RestClient(
      identifier,
      additional.endpoint || PROD_ENDPOINT
    );

    const wrapMethod =
      <M>(fn: (...args: any[]) => Promise<rm.IRestResponse<any>>) =>
      <T>(...args: any[]): Promise<SlashauthResponse<T>> =>
        fn.apply(rawApiClient, args).then(
          (res) => {
            return {
              data: res.result,
              error: null,
              headers: res.headers,
              statusCode: res.statusCode,
            };
          },
          (err) => {
            return {
              data: undefined,
              error: err.result.error,
              headers: err['responseHeaders'],
              statusCode: err['statusCode'],
            };
          }
        );

    const apiClient = {
      get: wrapMethod(rawApiClient.get),
      create: wrapMethod(rawApiClient.create),
      replace: wrapMethod(rawApiClient.replace),
      del: wrapMethod(rawApiClient.del),
      update: wrapMethod(rawApiClient.update),
    } as WrappedClient;

    this.app = new AppController(client_id, client_secret, apiClient);
    this.user = new UserController(client_id, client_secret, apiClient);
    this.organization = new OrganizationController(
      client_id,
      client_secret,
      apiClient
    );
    this.file = new FileController(client_id, client_secret, apiClient);
  }
}
