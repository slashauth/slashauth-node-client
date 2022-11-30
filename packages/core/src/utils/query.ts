import { createHmac } from 'crypto';
import {
  GetQueryStringSignatureOptions,
  PostBodySignatureOptions,
} from '@slashauth/types';

export const signQuery = ({
  input,
  secret,
  nonce,
}: GetQueryStringSignatureOptions): { [key: string]: string } => {
  const params = new URLSearchParams();

  for (const k of Object.keys(input)) {
    params.append(k, input[k]);
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

export const signBody = ({
  input,
  secret,
  nonce,
}: PostBodySignatureOptions): { [key: string]: string } => {
  const params: { [key: string]: string } = {};

  for (const k of Object.keys(input)) {
    if (k === 'nonce') {
      continue;
    }
    params[k] = input[k];
  }

  if (nonce) {
    params['nonce'] = nonce;
  } else {
    params['nonce'] = `${Date.now()}`;
  }

  const ordered = Object.keys(params)
    .sort()
    .reduce((obj: { [key: string]: string }, key: string) => {
      obj[key] = params[key];
      return obj;
    }, {});

  const hmac = createHmac('sha256', secret);
  params['sig'] = hmac.update(JSON.stringify(ordered)).digest('hex');

  return params;
};
