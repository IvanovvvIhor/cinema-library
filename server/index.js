const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const supabase = require('./config/supabase');

// Імпорт роутерів
const authRoutes = require('./routes/auth.routes');
const movieRoutes = require('./routes/movie.routes');
const reviewRoutes = require('./routes/review.routes');
const listRoutes = require('./routes/list.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({ 
    origin: function (origin, callback) {
        if (!origin || 
            origin === 'http://localhost:5173' || 
            origin === 'https://cinema-library-five.vercel.app' || 
            /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS Policy Blocked This Request'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie']
}));

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (['https://cinema-library-five.vercel.app', 'http://localhost:5173'].includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization, Cookie');
    next();
});

// Підключення маршрутів
app.get('/', (req, res) => {
    res.send('Атлант на зв’язку! Система прогресії активована.');
});

app.use('/api', authRoutes); // /register, /login, /logout
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/lists', listRoutes);
// Маршрут profile включає в себе /profile, /profile/achievements, /profile/analytics
app.use('/api/profile', profileRoutes);

// Маршрут-пульс для зовнішнього моніторингу
app.get('/api/health', async (req, res) => {
    try {
        // Беремо всього 1 запис, щоб база даних "прокинулась", але не навантажувалась
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;

        res.status(200).json({ status: 'active', database: 'connected' });
    } catch (err) {
        console.error('[HEALTH CHECK ERROR]', err.message);
        res.status(500).json({ status: 'error', details: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Reactor running on ${PORT}`));