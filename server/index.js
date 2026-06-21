const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { protect } = require('./middleware/authMiddleware');
const WebSocket = require('ws'); 
const cookieParser = require('cookie-parser');
const { checkAchievements } = require('./achievementsEngine');
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY); 

const { hashPassword, comparePasswords } = require('./utils/passwordUtils');
const { generateToken } = require('./utils/tokenUtils');

const app = express();
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

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: { persistSession: false },
  db: { schema: 'public' },
  realtime: { transport: WebSocket } 
});

const PORT = process.env.PORT || 5000;

// #region ГЕЙМІФІКАЦІЯ: ATLAS XP ENGINE
const awardXP = async (userId, amount) => {
    try {
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', userId)
            .single();
            
        if (fetchError || !profile) return;

        const newXp = (profile.xp || 0) + amount;
        const newLevel = Math.floor(newXp / 500) + 1;

        let currentRank = 'Civilian';
        if (newLevel >= 5) currentRank = 'Analyst';
        if (newLevel >= 15) currentRank = 'Strategist';
        if (newLevel >= 30) currentRank = 'The Architect';

        await supabase.from('profiles')
            .update({ 
                xp: newXp, 
                level: newLevel,
                rank: currentRank 
            })
            .eq('id', userId);

        console.log(`[XP ENGINE] User ${userId}: +${amount} XP. Level: ${newLevel}. Rank: ${currentRank}`);
    } catch (err) {
        console.error("[XP ENGINE ERROR]", err.message);
    }
};
// #endregion

app.get('/', (req, res) => {
    res.send('Атлант на зв’язку! Система прогресії активована.');
});

app.get('/api/movies/trending', async (req, res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                accept: 'application/json'
            },
            params: {
                language: 'uk-UA', 
                page: req.query.page || 1
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'TMDB Liaison failed' });
    }
});

// #region АВТЕНТИФІКАЦІЯ ТА ВЕРИФІКАЦІЯ
app.post('/api/register', async (req, res) => {
    const { username, email, password, age, gender, avatar } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Заповніть основні поля!' });

    try {
        const hashedPassword = await hashPassword(password);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // 1. Запис у базу даних Supabase
        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .insert([{ 
                username, email, password_hash: hashedPassword,
                age: age ? Number(age) : null, gender, avatar,
                xp: 100, level: 1, rank: 'Civilian',
                is_verified: false,
                verification_token: verificationToken
            }])
            .select().single();

        if (userError) {
            if (userError.code === '23505') return res.status(409).json({ error: 'User already exists' });
            throw userError;
        }

        const defaultLists = [
            { user_id: userData.id, name: 'Watchlist', description: 'Initial target acquisition', is_system: true, is_public: false },
            { user_id: userData.id, name: 'Watched', description: 'Archived successful operations', is_system: true, is_public: false },
            { user_id: userData.id, name: 'Favorites', description: 'High-priority masterpieces', is_system: true, is_public: false }
        ];
        await supabase.from('lists').insert(defaultLists);

        const verifyUrl = `${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api/verify/${verificationToken}`;

        // ІНЖЕНЕРНИЙ ЧОРНИЙ ХІД: Виводимо лінк у логи сервера для швидкого тестування
        console.log(`[VERIFICATION LINK FOR ${email}]: ${verifyUrl}`);

        // 2. Ізольована відправка листа (через офіційний SDK)
        try {
            await resend.emails.send({
                from: 'Cinema Library <onboarding@resend.dev>',
                to: [email], // Знову ж таки, пройде тільки на твою пошту
                subject: 'Account Activation - Cinema Library',
                html: `
                    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; background-color: #111; color: #fff; border-radius: 10px;">
                        <h2 style="color: #e50914;">Welcome to Cinema Library, ${username}!</h2>
                        <p style="color: #ccc;">Your strategic clearance is almost granted. Please verify your email address to activate your account:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verifyUrl}" style="background-color: #e50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase;">Verify Account</a>
                        </div>
                        <p style="color: #888; font-size: 12px;">If you did not request this, please ignore this email.</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.warn(`[MAILER WARNING]: Resend blocked email to ${email}. Use the console link to verify.`);
        }

        // 3. Успішна відповідь незалежно від того, чи пропустив Resend лист
        res.status(201).json({ message: 'Registration successful. Please check your email (or server logs) to verify your account.' });
    } catch (error) {
        console.error("Registration Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

app.get('/api/verify/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const { data: user, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('verification_token', token)
            .single();

        if (error || !user) {
            return res.status(400).send('<h1 style="color: red; text-align: center; margin-top: 50px;">Invalid or expired verification link.</h1>');
        }

        await supabase
            .from('profiles')
            .update({ 
                is_verified: true, 
                verification_token: null 
            })
            .eq('id', user.id);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}?verified=true`);

    } catch (err) {
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data: user, error } = await supabase.from('profiles').select('*').eq('email', email).single();
        
        if (error || !user || !(await comparePasswords(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (user.is_verified === false) {
            return res.status(403).json({ error: 'Account not verified. Please check your email inbox.' });
        }

        const token = generateToken(user.id);
        
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
            maxAge: 86400000 
        });

        res.json({
            user: { 
                id: user.id, username: user.username, email: user.email,
                avatar: user.avatar, xp: user.xp, level: user.level, rank: user.rank,
                age: user.age, gender: user.gender
            },
            token: token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token', { 
        httpOnly: true, 
        sameSite: 'none', 
        secure: true
    });
    res.json({ message: 'Session terminated. Token purged.' });
});
// #endregion

// #region РЕЦЕНЗІЇ
app.post('/api/reviews', protect, async (req, res) => {
    const { movie_id, movie_title, movie_poster, content, rating } = req.body;
    const user_id = req.user.id;

    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{ 
                user_id, movie_id, movie_title, movie_poster, content, rating 
            }])
            .select();

        if (error) throw error;
        
        await awardXP(user_id, 50);
        await checkAchievements(req.user.id, 'REVIEW_POSTED');

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`*, profiles:user_id (username, avatar)`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const flattenedData = data.map(review => ({
            ...review,
            username: review.profiles?.username || 'Unknown Strategist',
            avatar: review.profiles?.avatar || null
        }));

        res.json(flattenedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/reviews/:id', protect, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;

        const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId);

        if (error) throw error;

        res.json({ message: 'Рецензію успішно видалено' });
    } catch {
        res.status(500).json({ error: 'Помилка при видаленні рецензії' });
    }
});
// #endregion

// #region СПИСКИ
app.get('/api/lists/public', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('lists')
            .select('*, profiles(username, avatar), list_items(*)')
            .eq('is_public', true)
            .order('likes', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/lists', protect, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('lists')
            .select('*, list_items(*)')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/lists/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('lists')
            .select('*, profiles (username, avatar), list_items (*)')
            .eq('id', req.params.id)
            .maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Sector not found' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/lists', protect, async (req, res) => {
    try {
        const { data, error } = await supabase.from('lists').insert([{ ...req.body, user_id: req.user.id }]).select();
        if (error) throw error;
        await awardXP(req.user.id, 30);
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/lists/:listId/items', protect, async (req, res) => {
    const { listId } = req.params;
    const { movie_id, poster_path } = req.body;
    try {
        await supabase.from('list_items').upsert([{ ...req.body, list_id: listId }], { onConflict: 'list_id, movie_id' });
        const { data: list } = await supabase.from('lists').select('poster_url').eq('id', listId).single();
        if (list && !list.poster_url) {
            await supabase.from('lists').update({ poster_url: poster_path }).eq('id', listId);
        }
        await awardXP(req.user.id, 10);
        await checkAchievements(req.user.id, 'COLLECTION_UPDATE');
        res.status(201).json({ message: 'Asset deployed' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/watchlist/:movieId', protect, async (req, res) => {
    try {
        const { data: lists } = await supabase.from('lists').select('id').eq('user_id', req.user.id);
        const listIds = lists.map(l => l.id);
        await supabase.from('list_items').delete().eq('movie_id', req.params.movieId).in('list_id', listIds);
        res.json({ message: 'Purged' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/lists/:id', protect, async (req, res) => {
    const { poster_url } = req.body;
    try {
        const { data, error } = await supabase
            .from('lists')
            .update({ poster_url })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select();
            
        if (error) throw error;
        res.json({ message: 'Visual asset updated', list: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/lists/:id/vote', protect, async (req, res) => {
    const { id } = req.params;
    const userId = Number(req.user.id); 
    const { type } = req.body;

    try {
        const { data: list, error: fetchError } = await supabase.from('lists').select('*').eq('id', id).single();
        if (fetchError || !list) return res.status(404).json({ error: 'Sector not found' });

        let liked_by = [...new Set((list.liked_by || []).map(Number))];
        let disliked_by = [...new Set((list.disliked_by || []).map(Number))];

        if (type === 'like') {
            if (liked_by.includes(userId)) {
                liked_by = liked_by.filter(i => i !== userId);
            } else {
                liked_by.push(userId);
                disliked_by = disliked_by.filter(i => i !== userId);
            }
        } else if (type === 'dislike') {
            if (disliked_by.includes(userId)) {
                disliked_by = disliked_by.filter(i => i !== userId);
            } else {
                disliked_by.push(userId);
                liked_by = liked_by.filter(i => i !== userId);
            }
        }

        const { data: updated, error: updateError } = await supabase.from('lists').update({ 
            liked_by, disliked_by, likes: liked_by.length, dislikes: disliked_by.length 
        }).eq('id', id).select();

        if (updateError) throw updateError;
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// #endregion

// #region ПРОФІЛЬ ТА АНАЛІТИКА
app.get('/api/achievements', protect, async (req, res) => {
    try {
        const { data: allAchievements, error: achError } = await supabase.from('achievements').select('*');
        if (achError) throw achError;

        const { data: unlocked, error: unlockError } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .eq('user_id', req.user.id);
        if (unlockError) throw unlockError;

        const response = allAchievements.map(ach => ({
            ...ach,
            is_unlocked: unlocked.some(u => u.achievement_id === ach.id),
            unlocked_at: unlocked.find(u => u.achievement_id === ach.id)?.unlocked_at || null
        }));

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve strategic achievements' });
    }
});

app.get('/api/profile', protect, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, email, avatar, age, gender, xp, level, rank')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve profile data' });
    }
});

app.put('/api/profile', protect, async (req, res) => {
    const { username, age, gender, avatar } = req.body;
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ username, age: Number(age), gender, avatar })
            .eq('id', userId)
            .select()
            .single();

        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: 'Profile updated successfully', user: data });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error during profile update' });
    }
});

app.get('/api/analytics', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: reviews, error } = await supabase.from('reviews').select('rating, created_at').eq('user_id', userId);
        if (error) throw error;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
        const timeline = {};
        let sumRating = 0;

        reviews.forEach(review => {
            const rating = Math.round(review.rating);
            if (ratingDistribution[rating] !== undefined) ratingDistribution[rating]++;
            sumRating += review.rating;

            const monthYear = review.created_at.substring(0, 7);
            timeline[monthYear] = (timeline[monthYear] || 0) + 1;
        });

        const averageRating = reviews.length > 0 ? Number((sumRating / reviews.length).toFixed(1)) : 0;

        res.json({ totalReviews: reviews.length, averageRating, ratingDistribution, timeline });
    } catch (error) {
        res.status(500).json({ error: 'Failed to aggregate analytical data' });
    }
});
// #endregion

// #region PROXY
app.get('/api/movies/proxy', async (req, res) => {
    const token = process.env.VITE_TMDB_READ_ACCESS_TOKEN || process.env.TMDB_TOKEN;
    
    try {
        const { endpoint, ...params } = req.query;
        if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
        if (!token) return res.status(500).json({ error: 'Server configuration error' });

        const response = await axios.get(`https://api.themoviedb.org/3${endpoint}`, {
            headers: { Authorization: `Bearer ${token.trim()}`, accept: 'application/json' },
            params: params 
        });

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'TMDB Liaison Failed', details: error.response?.data || error.message });
    }
});

app.get('/api/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { language } = req.query;
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            headers: { Authorization: `Bearer ${process.env.VITE_TMDB_READ_ACCESS_TOKEN}` },
            params: { language, append_to_response: 'credits,videos' }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'TMDB Liaison Failed' });
    }
});
// #endregion

app.listen(PORT, () => console.log(`🚀 Reactor running on ${PORT}`));