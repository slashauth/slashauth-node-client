export type ValidateTokenArguments = {
  token: string;
};

export type ValidateTokenAPIResponse = {
  isValid: TokenValidity;
};

type TokenValidity = boolean;

export type ValidateTokenResponse = {
  userID?: string;
  wallet?: string;
  clientID: string;
  issuedAt: number;
  expiresAt: number;
  issuer: string;
  type: string;
  getWalletAddress(): Promise<string | null>;
};

export type DecodedToken = {
  type: string;
  client_id: string;
  jti: string;
  sid: string;
  wallet: string;
  aud: string[];
  iat: number;
  exp: number;
  iss: string;
  sub: string;
};
