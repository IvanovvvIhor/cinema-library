const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.cookies.token; // Беремо токен з кук

    if (!token) {
        return res.status(401).json({ error: 'Немає доступу, залогіньтесь' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Додаємо id юзера в об'єкт запиту
        next(); // Йдемо далі до контролера
    } catch (error) {
        res.status(410).json({ error: 'Токен недійсний' });
    }
};

module.exports = { protect };