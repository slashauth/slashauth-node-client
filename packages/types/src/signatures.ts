export type GetQueryStringSignatureOptions = {
  input: { [key: string]: string };
  secret: string;
  nonce?: string;
};

export type PostBodySignatureOptions = {
  input: { [key: string]: any };
  secret: string;
  nonce?: string;
};
