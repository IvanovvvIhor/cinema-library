const supabase = require('../config/supabase');

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
            .update({ xp: newXp, level: newLevel, rank: currentRank })
            .eq('id', userId);

        console.log(`[XP ENGINE] User ${userId}: +${amount} XP. Level: ${newLevel}. Rank: ${currentRank}`);
    } catch (err) {
        console.error("[XP ENGINE ERROR]", err.message);
    }
};

module.exports = { awardXP };