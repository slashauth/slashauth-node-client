import { BlobStatus } from '../global';

export const base64Encode = (str: string): string => {
  return Buffer.from(str, 'utf-8').toString('base64');
};

export const base64Decode = (str: string): string => {
  return atob(str);
  return Buffer.from(str, 'base64').toString('utf-8');
};

export const checkBlobStatus = (input: string): string => {
  switch (input) {
    case BlobStatus.CANCELLED:
    case BlobStatus.COMPLETED:
    case BlobStatus.PENDING:
      return input;
    default:
      throw new Error('unsupported blob status');
  }
};
