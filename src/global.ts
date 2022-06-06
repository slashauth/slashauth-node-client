export type GetQueryStringSignatureOptions = {
  query: { [key: string]: string };
  secret: string;
  nonce?: string;
};

export type HasRoleArguments = {
  address: string;
  role: string;
};

export type HasRoleAPIResponse = {
  hasRole: boolean;
};
