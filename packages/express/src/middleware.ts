import { SlashauthClient } from '@slashauth/node-client';
import * as express from 'express';
import { parseToken } from './utils/token';

declare global {
  namespace Express {
    interface Request {
      slashauth: {
        wallet?: string;
        userID?: string;
        isAuthed?: boolean;
        clientID?: string;
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

  parseAuthToken = () => {
    return async (
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
          wallet: tokenResp.wallet,
          userID: tokenResp.userID,
          isAuthed: true,
          clientID: tokenResp.clientID,
          getWalletAddress: tokenResp.getWalletAddress,
        };
      } catch (err) {}

      next();
      return;
    };
  };

  hasRole = (role: string) => {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const authHeader = req.headers.authorization || '';
      const token = parseToken(authHeader);
      const [hasRole] = await this.client.user.hasRoleToken({
        role,
        token,
      });

      if (hasRole) {
        next();
        return;
      }

      return res.status(403).json({ error: `User does not meet role ${role}` });
    };
  };
}
