import { SlashauthClient } from '@slashauth/node-client';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { parseToken } from './utils/token';

export type AuthedNextApiRequest = {
  address?: string;
  userID?: string;
  isAuthed?: boolean;
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

      const tokenResp = await this.client.validateToken({
        token,
      });

      req.address = tokenResp.address;
      req.isAuthed = true;
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

      const hasRoleResp = await this.client.hasRoleToken({
        role,
        token,
      });

      if (hasRoleResp.result && hasRoleResp.result.hasRole !== undefined) {
        return hasRoleResp.result.hasRole;
      }

      throw new Error('hasRole did not properly return');
    } catch (err) {
      throw err;
    }
  };
}
