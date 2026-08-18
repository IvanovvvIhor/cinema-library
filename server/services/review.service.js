const supabase = require('../config/supabase');
const { awardXP } = require('./xp.service');
const { checkAchievements } = require('../achievementsEngine');

const createReview = async (userId, reviewData) => {
    const { movie_id, movie_title, movie_poster, content, rating } = reviewData;
    
    const { data, error } = await supabase
        .from('reviews')
        .insert([{ user_id: userId, movie_id, movie_title, movie_poster, content, rating }])
        .select();

    if (error) throw error;
    
    await awardXP(userId, 50);
    await checkAchievements(userId, 'REVIEW_POSTED');

    return data[0];
};

const getReviews = async () => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles:user_id (username, avatar)')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(review => ({
        ...review,
        username: review.profiles?.username || 'Unknown Strategist',
        avatar: review.profiles?.avatar || null
    }));
};

const deleteReview = async (userId, reviewId) => {
    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Рецензію успішно видалено' };
};

module.exports = { createReview, getReviews, deleteReview };