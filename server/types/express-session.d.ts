import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    isAdmin: boolean;
    businessId?: number;
  }
}

// Extend Express Request interface to include businessId
declare global {
  namespace Express {
    interface Request {
      businessId?: number;
    }
  }
}