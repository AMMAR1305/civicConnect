const jwt = require('jsonwebtoken');

exports.protect = (req, res, next)  => { 
    try {
        // Check if authorization header exists
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // Extract and trim token to remove any whitespace
        const token = authHeader.split(' ')[1].trim();
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }   
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Set req.user with decoded token data
        next();
    }   
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid token.', error: error.message });
    }
};

