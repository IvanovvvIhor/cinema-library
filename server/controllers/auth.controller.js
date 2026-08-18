const authService = require('../services/auth.service');
const { generateToken } = require('../utils/tokenUtils');

const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Заповніть основні поля!' });

    try {
        const user = await authService.registerUser(req.body);
        const token = generateToken(user.id);
        
        res.cookie('token', token, { 
            httpOnly: true, secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 86400000 
        });

        res.status(201).json({ message: 'Success', user, token });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'User already exists' });
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authService.loginUser(email, password);
        const token = generateToken(user.id);
        
        res.cookie('token', token, { 
            httpOnly: true, secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 86400000 
        });

        res.json({
            user: { 
                id: user.id, username: user.username, email: user.email,
                avatar: user.avatar, xp: user.xp, level: user.level, rank: user.rank,
                age: user.age, gender: user.gender
            },
            token
        });
    } catch (error) {
        if (error.message === 'Invalid email or password') return res.status(401).json({ error: error.message });
        res.status(500).json({ error: error.message });
    }
};

const logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ message: 'Session terminated. Token purged.' });
};

module.exports = { register, login, logout };