
import AppError from '../helper/AppError.js';
import { ROLES } from '../constants/roles.js';
import { verifyToken } from '../helper/jwtHelper.js';

export const roleAuth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        throw new AppError('Authentication required', 401);
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        throw new AppError('Invalid token', 401);
      }

      const userRole = decoded.role || 'GUEST';
      
      if (!allowedRoles.includes(userRole)) {
        throw new AppError('Access denied. Insufficient permissions.', 403);
      }

      // Add user info to request
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Pre-defined middleware for common role combinations
export const auth = {
  all: roleAuth([ROLES.ADMIN, ROLES.OWNER, ROLES.TENANT]),
  adminOnly: roleAuth([ROLES.ADMIN]),
  ownerAndAdmin: roleAuth([ROLES.ADMIN, ROLES.OWNER]),
  tenantAndAdmin: roleAuth([ROLES.ADMIN, ROLES.TENANT]),
  ownerOnly: roleAuth([ROLES.OWNER]),
  tenantOnly: roleAuth([ROLES.TENANT])
};
