export type ValidateTokenArguments = {
  token: string;
};

export type ValidateTokenAPIResponse = {
  isValid: boolean;
};

export type ValidateTokenResponse = {
  userID?: string;
  address?: string;
  clientID: string;
  issuedAt: number;
  expiresAt: number;
  issuer: string;
  walletType: string;
};

export type DecodedToken = {
  type: string;
  client_id: string;
  aud: string[];
  iat: number;
  exp: number;
  iss: string;
  sub: string;
  wallet_type: string;
};
