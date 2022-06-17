import * as rm from 'typed-rest-client';
import { Config, PROD_ENDPOINT } from './config';
import {
  DecodedToken,
  HasRoleAPIResponse,
  HasRoleArguments,
  ValidateTokenAPIResponse,
  ValidateTokenArguments,
  ValidateTokenResponse,
} from './global';
import { signQuery } from './query';

export class SlashauthClient {
  identifier: string;
  apiClient: rm.RestClient;

  client_id: string;
  client_secret: string;

  constructor(
    client_id: string,
    client_secret: string,
    additional: Partial<Config>
  ) {
    this.identifier = `node-rest-client_${additional.version || '1.0.0'}`;
    this.apiClient = new rm.RestClient(
      this.identifier,
      additional.endpoint || PROD_ENDPOINT
    );

    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  async hasRole({
    address,
    role,
  }: HasRoleArguments): Promise<rm.IRestResponse<HasRoleAPIResponse>> {
    const encodedRole = Buffer.from(role, 'utf8').toString('base64');

    const urlParams = signQuery({
      query: {
        address,
        role: encodedRole,
        encoded: 'true',
      },
      secret: this.client_secret,
    });

    return this.apiClient.get<HasRoleAPIResponse>(
      `/s/${this.client_id}/has_role`,
      {
        queryParameters: {
          params: urlParams,
        },
      }
    );
  }

  async validateToken({
    token,
  }: ValidateTokenArguments): Promise<ValidateTokenResponse> {
    try {
      const resp = this.apiClient.get<ValidateTokenAPIResponse>(
        `/validate_token`,
        {
          queryParameters: {
            params: {
              client_id: this.client_id,
              token,
            },
          },
        }
      );

      if (!resp) {
        throw new Error('token is not valid');
      }

      const encodedClaims = token.split('.')[1];

      if (!encodedClaims) {
        throw new SyntaxError('malformed token');
      }

      const decodedClaims = JSON.parse(atob(encodedClaims)) as DecodedToken;

      return {
        address: decodedClaims.sub,
        clientID: decodedClaims.client_id,
        issuedAt: decodedClaims.iat,
        expiresAt: decodedClaims.exp,
        issuer: decodedClaims.iss,
        walletType: decodedClaims.wallet_type,
      };
    } catch (err) {
      throw err;
    }
  }
}
