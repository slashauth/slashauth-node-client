import { SlashauthResponse } from '../client';

export const transformResponse =
  <T, U>(
    responseMapper: (data: T | undefined) => SlashauthResponse<U>['data']
  ) =>
  (resp: SlashauthResponse<T>): SlashauthResponse<U> => {
    return {
      data: responseMapper(resp.data),
      error: resp.error,
      headers: resp.headers,
      statusCode: resp.statusCode,
    };
  };
