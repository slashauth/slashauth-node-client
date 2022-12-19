import { SlashauthResponse } from '../client';

export const transformResponse =
  <I, O>(
    responseMapper: (data: I | undefined) => SlashauthResponse<O>['data']
  ) =>
  (resp: SlashauthResponse<I>): SlashauthResponse<O> => {
    return {
      data: responseMapper(resp.data),
      error: resp.error,
      headers: resp.headers,
      statusCode: resp.statusCode,
    };
  };
