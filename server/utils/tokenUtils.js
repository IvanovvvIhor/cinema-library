const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    // Створюємо токен, який зашифрований нашим секретом з .env
    // expiresIN: '1d' означає, що через добу юзеру доведеться залогінитись знову
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

module.exports = { generateToken };