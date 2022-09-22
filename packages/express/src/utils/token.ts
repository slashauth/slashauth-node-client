export const parseToken = (authHeader?: string): string => {
  if (authHeader) {
    const tokenParts = authHeader.trim().split(/\s+/);
    if (tokenParts.length === 2 && tokenParts[0].toLowerCase() === 'bearer') {
      return tokenParts[1];
    }
  }
  throw new Error('authHeader is not parsable');
};
