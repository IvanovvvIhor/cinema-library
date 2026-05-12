const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {

    const token = req.cookies.token; 

    if (!token) {
        console.warn('[AUTH ERROR] No token found in cookies');
        return res.status(401).json({ error: 'Немає доступу, залогіньтесь' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (error) {
        console.error('[AUTH ERROR] JWT Verification failed:', error.message);
        res.status(401).json({ error: 'Токен недійсний' });
    }
};

module.exports = { protect };