const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Налаштування поштового клієнта (на прикладі Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Твоя пошта (напр., cinema.library.bot@gmail.com)
        pass: process.env.EMAIL_PASS  // Спеціальний "App Password" від Google
    }
});

module.exports = {
    transporter,
}
