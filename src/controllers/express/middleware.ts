import * as express from 'express';
import { SlashauthClient } from '../../client';
import { parseToken } from '../../utils/token';

declare global {
  namespace Express {
    interface Request {
      address?: string;
      userID?: string;
      isAuthed?: boolean;
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

      const tokenResp = await this.client.validateToken({
        token,
      });

      req.address = tokenResp.address;
      req.isAuthed = true;
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
      const hasRoleResp = await this.client.hasRoleToken({
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
