import { createHmac } from 'crypto';
import { GetQueryStringSignatureOptions } from './global';

export const signQuery = ({
  query,
  secret,
  nonce,
}: GetQueryStringSignatureOptions): { [key: string]: string } => {
  const params = new URLSearchParams();

  for (const k of Object.keys(query)) {
    params.append(k, query[k]);
  }

  if (params.get('nonce')) {
    params.delete('nonce');
  }

  if (nonce) {
    params.append('nonce', nonce);
  } else {
    params.append('nonce', `${Date.now()}`);
  }

  params.sort();

  const hmac = createHmac('sha256', secret);
  params.append('sig', hmac.update(params.toString()).digest('hex'));

  const response: { [k: string]: string } = {};

  for (const k of params.keys()) {
    response[k] = params.get(k) as string;
  }

  return response;
};
