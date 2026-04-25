import { Request, Response, NextFunction } from 'express';

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // We check for X-Requested-With or X-CSRF-Token. 
    // This protects against CSRF because browsers don't allow custom headers in cross-origin 
    // requests without preflight (CORS) approval.
    if (!req.headers['x-requested-with'] && !req.headers['x-csrf-token']) {
      return res.status(403).json({ 
        success: false, 
        errorMessage: 'CSRF Protection: Missing required header (X-Requested-With or X-CSRF-Token)' 
      });
    }
  }
  next();
};
