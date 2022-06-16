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

export type ValidateTokenArguments = {
  token: string;
}

export type ValidateTokenAPIResponse = {
  isValid: boolean;
}

export type ValidateTokenResponse = {
  address: string;
  clientID: string;
  issuedAt: number;
  expiresAt: number;
  issuer: string;
}

export type DecodedToken = {
  type: string;
  client_id: string;
  aud: string[];
  iat: number;
  exp: number;
  iss: string;
  sub: string;
};
