const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token = req.cookies.token;

    // Шукаємо токен в заголовку Authorization (Bearer)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ error: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token failed' });
    }
};

module.exports = { protect };