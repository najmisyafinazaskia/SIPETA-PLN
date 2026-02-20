const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "No token provided." });

    const bearer = token.split(' ');
    const tokenVal = bearer[bearer.length - 1];

    jwt.verify(tokenVal, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized." });
        req.userId = decoded.id;
        next();
    });
};

module.exports = { verifyToken };
