const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { protect } = require('./middleware/authMiddleware');
const WebSocket = require('ws'); 
const cookieParser = require('cookie-parser');
const { checkAchievements } = require('./achievementsEngine');
require('dotenv').config();
const axios = require('axios');


const { hashPassword, comparePasswords } = require('./utils/passwordUtils');
const { generateToken } = require('./utils/tokenUtils');

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({ 
    origin: function (origin, callback) {
        if (!origin 
            || origin === 'http://localhost:5173' 
            || origin === 'https://cinema-library-five.vercel.app'
            || /^http:\/\/192\.168\.\d+\.\d+:5173$/.test(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie']
}));


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: { persistSession: false },
  db: { schema: 'public' },
  realtime: { transport: WebSocket } 
});

const PORT = process.env.PORT || 5000;

// #region ГЕЙМІФІКАЦІЯ: ATLAS XP ENGINE
/**
 * Єдина функція для досвіду та рангів.
 */
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
                language: 'uk-UA', // Або бери з req.query
                page: req.query.page || 1
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'TMDB Liaison failed' });
    }
});


// #region АВТЕНТИФІКАЦІЯ
app.post('/api/register', async (req, res) => {
    const { username, email, password, age, gender, avatar } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Заповніть основні поля!' });

    try {
        const hashedPassword = await hashPassword(password);
        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .insert([{ 
                username, email, password_hash: hashedPassword,
                age: age ? Number(age) : null, gender, avatar,
                xp: 100, level: 1, rank: 'Civilian'
            }])
            .select().single();

        if (userError) {
            if (userError.code === '23505') return res.status(409).json({ error: 'User already exists' });
            throw userError;
        }

        const token = generateToken(userData.id);
        
        // Зберігаємо в кукі (для ПК) та віддаємо токен (для мобілок)
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 86400000 });

        const defaultLists = [
            { user_id: userData.id, name: 'Watchlist', description: 'Initial target acquisition', is_system: true, is_public: false },
            { user_id: userData.id, name: 'Watched', description: 'Archived successful operations', is_system: true, is_public: false },
            { user_id: userData.id, name: 'Favorites', description: 'High-priority masterpieces', is_system: true, is_public: false }
        ];
        await supabase.from('lists').insert(defaultLists);

        res.status(201).json({ message: 'Success', user: userData, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data: user, error } = await supabase.from('profiles').select('*').eq('email', email).single();
        if (error || !user || !(await comparePasswords(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id);
        
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 86400000 });

        res.json({
            user: { 
                id: user.id, username: user.username, email: user.email,
                avatar: user.avatar, xp: user.xp, level: user.level, rank: user.rank,
                age: user.age, gender: user.gender
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// #endregion


// #region РЕЦЕНЗІЇ
app.post('/api/reviews', protect, async (req, res) => {
    // 1. Додаємо movie_poster в деструктуризацію body
    const { movie_id, movie_title, movie_poster, content, rating } = req.body;
    const user_id = req.user.id;

    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{ 
                user_id, 
                movie_id, 
                movie_title, 
                movie_poster, // 2. Записуємо постер в базу
                content, 
                rating 
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
            .select(`
                *,
                profiles:user_id (username, avatar)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const flattenedData = data.map(review => ({
            ...review,
            // Тут movie_poster вже буде всередині завдяки "*"
            username: review.profiles?.username || 'Unknown Strategist',
            avatar: review.profiles?.avatar || null
        }));

        res.json(flattenedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// #endregion

// #region СПИСКИ (ВІДНОВЛЕНО ТА ВИПРАВЛЕНО)

// 1. ОТРИМАТИ ПУБЛІЧНІ СПИСКИ (Раніше викликав 500)
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

// 2. ОТРИМАТИ СПИСКИ ЮЗЕРА (Раніше викликав 404)
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

// 3. ОТРИМАТИ КОНКРЕТНИЙ СПИСОК
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

// 4. ОНОВИТИ ОБКЛАДИНКУ СПИСКУ (PUT /api/lists/:id)
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
        console.error("[COVER UPDATE ERROR]", error.message);
        res.status(500).json({ error: error.message });
    }
});
// #endregion


// #region ГОЛОСУВАННЯ
app.post('/api/lists/:id/vote', protect, async (req, res) => {
    const { id } = req.params;
    // 1. Жорстко перетворюємо ID юзера на число
    const userId = Number(req.user.id); 
    const { type } = req.body;

    try {
        const { data: list, error: fetchError } = await supabase.from('lists').select('*').eq('id', id).single();
        if (fetchError || !list) return res.status(404).json({ error: 'Sector not found' });

        // 2. Витягуємо масиви, перетворюємо ВСЕ на числа і використовуємо Set, щоб вбити будь-які дублікати!
        let liked_by = [...new Set((list.liked_by || []).map(Number))];
        let disliked_by = [...new Set((list.disliked_by || []).map(Number))];

        // 3. Здорова логіка YouTube (можна відмінити або переключити, але не дублювати)
        if (type === 'like') {
            if (liked_by.includes(userId)) {
                // Якщо вже лайкав - знімаємо лайк (toggle)
                liked_by = liked_by.filter(i => i !== userId);
            } else {
                // Якщо не лайкав - ставимо лайк і прибираємо дизлайк
                liked_by.push(userId);
                disliked_by = disliked_by.filter(i => i !== userId);
            }
        } else if (type === 'dislike') {
            if (disliked_by.includes(userId)) {
                // Якщо вже дизлайкав - знімаємо дизлайк
                disliked_by = disliked_by.filter(i => i !== userId);
            } else {
                // Якщо не дизлайкав - ставимо дизлайк і прибираємо лайк
                disliked_by.push(userId);
                liked_by = liked_by.filter(i => i !== userId);
            }
        }

        // 4. Оновлюємо базу даних
        const { data: updated, error: updateError } = await supabase.from('lists').update({ 
            liked_by, 
            disliked_by, 
            likes: liked_by.length, 
            dislikes: disliked_by.length 
        }).eq('id', id).select();

        if (updateError) {
            console.error("[DB VOTE UPDATE ERROR]", updateError);
            throw updateError;
        }

        res.json(updated[0]);
    } catch (err) {
        console.error("[VOTE ERROR]", err.message);
        res.status(500).json({ error: err.message });
    }
});
// #endregion


// #region МАРШРУТ ДОСЯГНЕНЬ (Виправлення 404)
app.get('/api/achievements', protect, async (req, res) => {
    try {
        // 1. Отримуємо всі можливі досягнення з довідника
        const { data: allAchievements, error: achError } = await supabase
            .from('achievements')
            .select('*');

        if (achError) throw achError;

        // 2. Отримуємо досягнення, які вже розблокував саме цей юзер
        const { data: unlocked, error: unlockError } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .eq('user_id', req.user.id);

        if (unlockError) throw unlockError;

        // 3. Зшиваємо дані для фронтенду
        const response = allAchievements.map(ach => ({
            ...ach,
            is_unlocked: unlocked.some(u => u.achievement_id === ach.id),
            unlocked_at: unlocked.find(u => u.achievement_id === ach.id)?.unlocked_at || null
        }));

        res.json(response);
    } catch (error) {
        console.error("[ACHIEVEMENTS FETCH ERROR]", error.message);
        res.status(500).json({ error: 'Failed to retrieve strategic achievements' });
    }
});
// #endregion

// #region ПРОФІЛЬ (Виправлення 404 на /api/profile)
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
        console.error("[PROFILE FETCH ERROR]", error.message);
        res.status(500).json({ error: 'Failed to retrieve profile data' });
    }
});
// #endregion


// #region ОНОВЛЕННЯ ПРОФІЛЮ (Виправлення 404 на PUT /api/profile)
app.put('/api/profile', protect, async (req, res) => {
    const { username, age, gender, avatar } = req.body;
    const userId = req.user.id;

    try {
        console.log(`[STRATEGIC UPDATE] Updating profile for user: ${userId}`);

        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                username, 
                age: Number(age), 
                gender, 
                avatar 
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error("[DB UPDATE ERROR]", error.message);
            return res.status(400).json({ error: error.message });
        }

        // Повертаємо оновленого юзера у форматі, який очікує твій фронтенд
        res.json({
            message: 'Profile updated successfully',
            user: data
        });
    } catch (error) {
        console.error("[SERVER CRASH] Profile update failed:", error.message);
        res.status(500).json({ error: 'Internal server error during profile update' });
    }
});
// #endregion

app.post('/api/logout', (req, res) => {
    res.clearCookie('token', { 
        httpOnly: true, 
        sameSite: 'none', 
        secure: true
    });
    res.json({ message: 'Session terminated. Token purged.' });
});

app.get('/api/movies/proxy', async (req, res) => {
    const token = process.env.VITE_TMDB_READ_ACCESS_TOKEN || process.env.TMDB_TOKEN;
    
    try {
        const { endpoint, ...params } = req.query;
        if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });

        if (!token) {
            console.error('❌ Missing TMDB Token');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Робимо запит. params автоматично розгорне всі фільтри (жанри, сортування тощо)
        const response = await axios.get(`https://api.themoviedb.org/3${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token.trim()}`,
                accept: 'application/json'
            },
            params: params 
        });

        res.json(response.data);
    } catch (error) {
        console.error('🔴 PROXY ERROR:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'TMDB Liaison Failed',
            details: error.response?.data || error.message 
        });
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


app.listen(PORT, () => console.log(`🚀 Reactor running on ${PORT}`));