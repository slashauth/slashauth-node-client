import * as rm from 'typed-rest-client';
import { Config, PROD_ENDPOINT } from './config';
import { OrganizationController } from './controllers/organization';
import { UserController } from './controllers/user';
import { FileController } from './controllers/file';
import { AppController } from './controllers/app';

type ResponseMeta<T> = Omit<rm.IRestResponse<T>, 'result'>;
type ErrorMessage = any;

export type SlashauthResponse<ResponseData> = [
  ResponseData | null,
  ResponseMeta<ResponseData>,
  ErrorMessage | null
];

type TypeOfClassMethod<T, M extends keyof T> = T[M] extends Function
  ? T[M]
  : never;

const wrapMethod =
  <M>(fn: (...args: any[]) => Promise<rm.IRestResponse<any>>) =>
  <T>(...args: any[]): Promise<SlashauthResponse<T>> =>
    fn(...args).then(
      (res) => [
        res.result,
        { headers: res.headers, statusCode: res.statusCode },
        null,
      ],
      (err) => [
        null,
        { headers: err['responseHeaders'], statusCode: err['statusCode'] },
        err.message,
      ]
    );

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
