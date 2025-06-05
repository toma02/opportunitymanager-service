const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // console.log(req);
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    // console.log(token);
    if (!token) return res.status(401).json({ error: 'Invalid token format' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
