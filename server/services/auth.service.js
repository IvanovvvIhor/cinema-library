const supabase = require('../config/supabase');
const { hashPassword, comparePasswords } = require('../utils/passwordUtils');

const registerUser = async (userData) => {
    const { username, email, password, age, gender, avatar } = userData;
    const hashedPassword = await hashPassword(password);

    const { data: user, error: userError } = await supabase
        .from('profiles')
        .insert([{ 
            username, email, password_hash: hashedPassword,
            age: age ? Number(age) : null, gender, avatar,
            xp: 100, level: 1, rank: 'Civilian'
        }])
        .select().single();

    if (userError) throw userError;

    // Створення списків за замовчуванням
    const defaultLists = [
        { user_id: user.id, name: 'Watchlist', description: 'Initial target acquisition', is_system: true, is_public: false },
        { user_id: user.id, name: 'Watched', description: 'Archived successful operations', is_system: true, is_public: false },
        { user_id: user.id, name: 'Favorites', description: 'High-priority masterpieces', is_system: true, is_public: false }
    ];
    await supabase.from('lists').insert(defaultLists);

    return user;
};

const loginUser = async (email, password) => {
    const { data: user, error } = await supabase.from('profiles').select('*').eq('email', email).single();
    if (error || !user || !(await comparePasswords(password, user.password_hash))) {
        throw new Error('Invalid email or password');
    }
    return user;
};

module.exports = { registerUser, loginUser };