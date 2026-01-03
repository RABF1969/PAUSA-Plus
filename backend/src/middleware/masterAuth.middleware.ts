
import { Request, Response, NextFunction } from 'express';

export const masterAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['x-master-token'];

  // Check if token exists and matches the environment variable
  if (!token || token !== process.env.ALFABIZ_MASTER_TOKEN) {
    res.status(401).json({
      error: 'Unauthorized: Invalid or missing Master Token'
    });
    return;
  }

  next();
};
