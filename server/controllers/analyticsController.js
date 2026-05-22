const getUserAnalytics = async (req, res) => {
    try {
        // Отримуємо ID користувача (з токена або параметрів)
        const userId = req.user.id; 

        // 1. Отримуємо всі рецензії користувача
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating, created_at')
            .eq('user_id', userId);

        if (reviewsError) throw reviewsError;

        // --- БІЗНЕС-ЛОГІКА: АГРЕГАЦІЯ ДАНИХ ---

        // Об'єкт для розподілу оцінок (від 1 до 10)
        const ratingDistribution = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0 };
        let sumRating = 0;

        // Об'єкт для хронології активності
        const activityTimeline = {};

        reviews.forEach(review => {
            // Агрегація 1: Розподіл оцінок
            // Округлюємо оцінку, якщо вона дробова (напр., 8.6 -> 9)
            const roundedRating = Math.round(review.rating);
            if (ratingDistribution[roundedRating] !== undefined) {
                ratingDistribution[roundedRating]++;
            }
            sumRating += review.rating;

            // Агрегація 2: Хронологія активності (формат YYYY-MM)
            // Беремо перші 7 символів з дати: "2026-05-12..." -> "2026-05"
            const monthYear = new Date(review.created_at).toISOString().slice(0, 7);
            activityTimeline[monthYear] = (activityTimeline[monthYear] || 0) + 1;
        });

        // Агрегація 3: Середній бал
        const averageRating = reviews.length > 0 
            ? (sumRating / reviews.length).toFixed(1) 
            : 0;

        // 2. (Опціонально) Отримуємо сумарний час перегляду з list_items
        // Оскільки у твоєму JSON list_items є поле runtime
        /*
        const { data: listItems } = await supabase
            .from('list_items')
            .select('runtime, list!inner(user_id)')
            .eq('list.user_id', userId);
            
        const totalRuntimeMinutes = listItems?.reduce((acc, item) => acc + (item.runtime || 0), 0) || 0;
        */

        // Формуємо фінальну відповідь для фронтенду
        return res.status(200).json({
            totalReviews: reviews.length,
            averageRating: Number(averageRating),
            ratingDistribution,
            timeline: activityTimeline
            // totalWatchTime: totalRuntimeMinutes // розкоментуй, якщо додаси запит вище
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        return res.status(500).json({ error: 'Помилка генерації аналітики' });
    }
};

module.exports = { getUserAnalytics };