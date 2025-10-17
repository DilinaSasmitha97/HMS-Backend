const jwt = require('jsonwebtoken');
const config = require('../config');

function authRole(requiredRole) {
  return (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch (_e) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

exports.requireAdmin = authRole('admin');
exports.requireDoctor = authRole('doctor');
exports.requirePatient = authRole('patient');

