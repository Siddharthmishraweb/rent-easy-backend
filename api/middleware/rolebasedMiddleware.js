
import AppError from '../helper/AppError.js';

export const roleAuth = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role || 'GUEST';
      
      if (!allowedRoles.includes(userRole)) {
        throw new AppError('Unauthorized: Insufficient permissions', 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
