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

        const { data } = await this.client.user.validateToken({
          token,
        });

        if (data) {
          req.slashauth = {
            wallet: data.wallet,
            userID: data.userID,
            isAuthed: true,
            clientID: data.clientID,
            getWalletAddress: data.getWalletAddress,
          };
        }
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
      const { data } = await this.client.user.hasRoleToken({
        role,
        token,
      });

      if (data?.hasRole) {
        next();
        return;
      }

      return res.status(403).json({ error: `User does not meet role ${role}` });
    };
  };
}
