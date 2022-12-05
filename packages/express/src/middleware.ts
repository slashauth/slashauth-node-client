import { SlashauthClient } from '@slashauth/node-client';
import * as express from 'express';
import { parseToken } from './utils/token';

declare global {
  namespace Express {
    interface Request {
      slashauth: {
        address?: string;
        userID?: string;
        isAuthed?: boolean;
        getWalletAddress(): Promise<string | null>;
      };
    }
  }
}

export class SlashauthMiddlewareExpress {
  client: SlashauthClient;

  constructor(client: SlashauthClient) {
    this.client = client;
  }

  validateCredentials = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = parseToken(authHeader);

      const tokenResp = await this.client.user.validateToken({
        token,
      });

      req.slashauth = {
        address: tokenResp.address,
        userID: tokenResp.userID,
        isAuthed: true,
        getWalletAddress: tokenResp.getWalletAddress,
      };
    } catch (err) {
      throw err;
    }

    next();
    return;
  };

  hasRole = (role: string) => {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const authHeader = req.headers.authorization || '';
      const token = parseToken(authHeader);
      const hasRoleResp = await this.client.user.hasRoleToken({
        role,
        token,
      });

      if (hasRoleResp.result && hasRoleResp.result.hasRole) {
        next();
        return;
      }

      return res.status(403).json({ error: `User does not meet role ${role}` });
    };
  };
}
