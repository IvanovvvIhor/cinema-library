const bcrypt = require('bcryptjs');

// Функція для створення секретного хешу
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); 
    return await bcrypt.hash(password, salt); 
};

// Функція для порівняння (знадобиться для логіну)
const comparePasswords = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePasswords };