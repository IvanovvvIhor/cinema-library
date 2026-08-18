const supabase = require('../config/supabase');
const { awardXP } = require('./xp.service');
const { checkAchievements } = require('../achievementsEngine');

const getPublicLists = async () => {
    const { data, error } = await supabase.from('lists').select('*, profiles(username, avatar), list_items(*)').eq('is_public', true).order('likes', { ascending: false });
    if (error) throw error;
    return data;
};

const getUserLists = async (userId) => {
    const { data, error } = await supabase.from('lists').select('*, list_items(*)').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

const getListById = async (id) => {
    const { data, error } = await supabase.from('lists').select('*, profiles (username, avatar), list_items (*)').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Sector not found');
    return data;
};

const createList = async (userId, listData) => {
    const { data, error } = await supabase.from('lists').insert([{ ...listData, user_id: userId }]).select();
    if (error) throw error;
    await awardXP(userId, 30);
    return data[0];
};

const addListItem = async (userId, listId, itemData) => {
    const { movie_id, poster_path } = itemData;
    await supabase.from('list_items').upsert([{ ...itemData, list_id: listId }], { onConflict: 'list_id, movie_id' });
    
    const { data: list } = await supabase.from('lists').select('poster_url').eq('id', listId).single();
    if (list && !list.poster_url) {
        await supabase.from('lists').update({ poster_url: poster_path }).eq('id', listId);
    }
    
    await awardXP(userId, 10);
    await checkAchievements(userId, 'COLLECTION_UPDATE');
    return { message: 'Asset deployed' };
};

const removeWatchlistItem = async (userId, movieId) => {
    const { data: lists } = await supabase.from('lists').select('id').eq('user_id', userId);
    const listIds = lists.map(l => l.id);
    await supabase.from('list_items').delete().eq('movie_id', movieId).in('list_id', listIds);
    return { message: 'Purged' };
};

const updateListPoster = async (userId, listId, poster_url) => {
    const { data, error } = await supabase.from('lists').update({ poster_url }).eq('id', listId).eq('user_id', userId).select();
    if (error) throw error;
    return data[0];
};

const voteOnList = async (userId, listId, type) => {
    const { data: list, error: fetchError } = await supabase.from('lists').select('*').eq('id', listId).single();
    if (fetchError || !list) throw new Error('Sector not found');

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
    }).eq('id', listId).select();

    if (updateError) throw updateError;
    return updated[0];
};

module.exports = { getPublicLists, getUserLists, getListById, createList, addListItem, removeWatchlistItem, updateListPoster, voteOnList };