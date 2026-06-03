const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Генеруємо токен, який живе 7 днів
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d', 
    });
};

module.exports = { generateToken };