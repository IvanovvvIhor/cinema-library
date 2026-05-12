const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket } 
});

/**
 * Головний сенсор системи досягнень
 */
const checkAchievements = async (userId, triggerType) => {
    console.log(`[ACHIEVEMENT ENGINE] Scanning for user ${userId}, trigger: ${triggerType}`);

    try {
        // 1. Отримуємо всі досягнення-еталони з бази
        const { data: allAchievements } = await supabase.from('achievements').select('*');
        // 2. Отримуємо вже розблоковані досягнення юзера, щоб не дублювати
        const { data: unlocked } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId);
        const unlockedIds = unlocked.map(u => u.achievement_id);

        if (triggerType === 'COLLECTION_UPDATE') {
            await checkCollectionAchievements(userId, allAchievements, unlockedIds);
        }

        if (triggerType === 'REVIEW_POSTED') {
            await checkCriticAchievements(userId, allAchievements, unlockedIds);
        }

    } catch (err) {
        console.error("[ACHIEVEMENT ENGINE ERROR]", err.message);
    }
};

/**
 * Перевірка пасхалок та колекцій (режисери, культове кіно)
 */
async function checkCollectionAchievements(userId, allAchievements, unlockedIds) {
    // Отримуємо всі ID фільмів, які юзер переглянув (зі списку 'Watched')
    const { data: watchedItems } = await supabase
        .from('list_items')
        .select('movie_id, lists!inner(name, user_id)')
        .eq('lists.user_id', userId)
        .eq('lists.name', 'Watched');

    const watchedMovieIds = watchedItems.map(item => Number(item.movie_id));

    // Фільтруємо ачівки, які мають список фільмів у метаданих і ще не розблоковані
    const collectionTasks = allAchievements.filter(a => 
        a.metadata && a.metadata.movies && !unlockedIds.includes(a.id)
    );

    for (const task of collectionTasks) {
        const requiredMovies = task.metadata.movies; // Наприклад [680, 273248, 466272]
        
        // Перевіряємо, чи є ВСІ потрібні ID у списку переглянутих
        const hasAll = requiredMovies.every(id => watchedMovieIds.includes(Number(id)));

        if (hasAll) {
            await unlockAchievement(userId, task.id, task.name);
        }
    }
}

/**
 * Перевірка досягнень критика (кількість рецензій)
 */
async function checkCriticAchievements(userId, allAchievements, unlockedIds) {
    const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    const criticTasks = allAchievements.filter(a => 
        a.category === 'critic_skills' && a.metadata.requirement && !unlockedIds.includes(a.id)
    );

    for (const task of criticTasks) {
        // Витягуємо число з рядка умови, наприклад "reviews_count >= 1"
        const match = task.metadata.requirement.match(/>=\s*(\d+)/);
        if (match) {
            const requiredCount = parseInt(match[1]);
            if (count >= requiredCount) {
                await unlockAchievement(userId, task.id, task.name);
            }
        }
    }
}

/**
 * Запис у базу про розблокування
 */
async function unlockAchievement(userId, achievementId, name) {
    const { error } = await supabase
        .from('user_achievements')
        .upsert([{ user_id: userId, achievement_id: achievementId }], { onConflict: 'user_id, achievement_id' });

    if (!error) {
        console.log(`[ACHIEVEMENT UNLOCKED] User ${userId} earned: ${name}`);
        // Тут можна додати логіку нарахування XP за ачівку (+100 XP наприклад)
    }
}

module.exports = { checkAchievements };