import { SlashauthClient } from '@slashauth/node-client';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { parseToken } from './utils/token';

export type AuthedNextApiRequest = {
  slashauth: {
    wallet?: string;
    userID?: string;
    isAuthed?: boolean;
    clientID?: string;
    getWalletAddress(): Promise<string | null>;
  };
} & NextApiRequest;

type AuthedNextApiHandler<T = any> = (
  req: AuthedNextApiRequest,
  res: NextApiResponse<T>
) => void | Promise<void>;

export class SlashauthMiddlewareNext {
  client: SlashauthClient;

  constructor(client: SlashauthClient) {
    this.client = client;
  }

  authedRequest = (handler: AuthedNextApiHandler) => {
    return async (req: AuthedNextApiRequest, res: NextApiResponse<any>) => {
      try {
        await this.validateCredentials(req);
        return handler(req, res);
      } catch (err) {
        res.status(403).json('invalid token');
      }
    };
  };

  hasRoleRequest = (handler: NextApiHandler, role: string) => {
    return async (req: NextApiRequest, res: NextApiResponse<any>) => {
      try {
        const hasRole = await this.hasRole(req, role);
        if (hasRole) {
          return handler(req, res);
        } else {
          res.status(403).json('user does not have role');
          return;
        }
      } catch (err) {
        res.status(403).json('user does not have role');
      }
    };
  };

  private validateCredentials = async (
    req: AuthedNextApiRequest
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = parseToken(authHeader);

      const tokenResp = await this.client.user.validateToken({
        token,
      });

      if (tokenResp && tokenResp.data) {
        req.slashauth = {
          wallet: tokenResp.data.wallet,
          userID: tokenResp.data.userID,
          isAuthed: true,
          clientID: tokenResp.data.clientID,
          getWalletAddress: tokenResp.data.getWalletAddress,
        };
      }
    } catch (err) {
      throw err;
    }
  };

  private hasRole = async (
    req: NextApiRequest,
    role: string
  ): Promise<boolean> => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = parseToken(authHeader);

      const { data } = await this.client.user.hasRoleToken({
        role,
        token,
      });

      if (data) {
        return data.hasRole;
      }

      throw new Error('hasRole did not properly return');
    } catch (err) {
      throw err;
    }
  };
}
