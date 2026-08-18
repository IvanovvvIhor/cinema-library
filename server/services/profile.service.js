const supabase = require('../config/supabase');

const getAchievements = async (userId) => {
    const { data: allAchievements, error: achError } = await supabase.from('achievements').select('*');
    if (achError) throw achError;

    const { data: unlocked, error: unlockError } = await supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', userId);
    if (unlockError) throw unlockError;

    return allAchievements.map(ach => ({
        ...ach,
        is_unlocked: unlocked.some(u => u.achievement_id === ach.id),
        unlocked_at: unlocked.find(u => u.achievement_id === ach.id)?.unlocked_at || null
    }));
};

const getProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('id, username, email, avatar, age, gender, xp, level, rank').eq('id', userId).single();
    if (error) throw error;
    return data;
};

const updateProfile = async (userId, profileData) => {
    const { username, age, gender, avatar } = profileData;
    const { data, error } = await supabase.from('profiles').update({ username, age: Number(age), gender, avatar }).eq('id', userId).select().single();
    if (error) throw error;
    return data;
};

const getAnalytics = async (userId) => {
    const { data: reviews, error } = await supabase.from('reviews').select('rating, created_at').eq('user_id', userId);
    if (error) throw error;

    const ratingDistribution = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0 };
    const timeline = {};
    let sumRating = 0;

    reviews.forEach(review => {
        const rating = Math.round(review.rating);
        if (ratingDistribution[rating] !== undefined) ratingDistribution[rating]++;
        sumRating += review.rating;

        const monthYear = new Date(review.created_at).toISOString().slice(0, 7);
        timeline[monthYear] = (timeline[monthYear] || 0) + 1;
    });

    const averageRating = reviews.length > 0 ? (sumRating / reviews.length).toFixed(1) : 0;

    return {
        totalReviews: reviews.length,
        averageRating: Number(averageRating),
        ratingDistribution,
        timeline
    };
};

module.exports = { getAchievements, getProfile, updateProfile, getAnalytics };