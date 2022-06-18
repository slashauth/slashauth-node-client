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

export type HasRoleArguments = {
  address: string;
  role: string;
};

export type HasRoleAPIResponse = {
  hasRole: boolean;
};

export type ValidateTokenArguments = {
  token: string;
};

export type ValidateTokenAPIResponse = {
  isValid: boolean;
};

export type ValidateTokenResponse = {
  address: string;
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

export type PostOrganizationArguments = {
  name: string;
  description?: string;
};

export type CreateOrganizationAPIResponse = {
  organizationID: string;
  clientID: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type AddRoleRequirementOrganizationArguments = {
  organizationID: string;
  contract: string;
  contractType: string;
  quantity: number;
  chainID: string;
  tokenTypeID?: number;
  role: string;
  accessToken: string;
};

export type AddWalletToRoleOrganizationArguments = {
  organizationID: string;
  wallet: string;
  role: string;
  accessToken: string;
};

export type DeleteRoleRequirementOrganizationArguments = {
  organizationID: string;
  roleID: string;
  accessToken: string;
};

export type DeleteRoleFromWalletOrganizationArguments = {
  organizationID: string;
  wallet: string;
  role: string;
  accessToken: string;
};

export type RoleRequirementAPIResponse = {
  id: string;
  roleLevel: string;
  contract: string;
  contractType: string;
  quantity: number;
  chainID: string;
  tokenTypeID?: number;
};

export type WalletRoleAPIResponse = {
  wallet: string;
  roleLevels: string[];
};
