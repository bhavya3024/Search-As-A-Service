const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.id // This will be available in req.user.userId
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;