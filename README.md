# Cinema Library — Веборієнтована система каталогізації та рецензування кіно

## 📌 Про проєкт
**Cinema Library** — це сучасна інформаційна система, розроблена як дипломний проєкт у **Олександрійському політехнічному фаховому коледжі**.Система призначена для пошуку кінематографічного контенту, ведення персональних списків перегляду та написання рецензій користувачами.

Головна особливість проєкту — інтеграція з всесвітньою базою даних фільмів через API та унікальний UI/UX дизайн з акцентом на візуальний досвід.

## 🛠 Стек технологій
Проєкт побудований на сучасному Full Stack стеку:
* **Frontend:** React + Vite + TypeScript.
* **API:** [The Movie Database (TMDB)](https://www.themoviedb.org/) для отримання актуальних даних про фільми.
* **Design:** Figma (індивідуальний стиль "Gothic Dark" та "Ivory Light").

## 🚀 Основний функціонал
* **Каталогізація:** Пошук та фільтрація фільмів за різними критеріями.
* **Рецензування:** Можливість залишати оцінки та текстові відгуки, які зберігаються в базі даних Supabase.
* **Персоналізація:** Створення власних списків перегляду (Watchlist).
* **Гейміфікація:** Система досягнень та статистики переглядів користувача.
* **Адаптивність:** Повна підтримка на десктопах, планшетах та мобільних пристроях.

```
Cinema library
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ images
│     ├─ icons
│     │  ├─ Search.png
│     │  └─ Search.svg
│     ├─ Logo.png
│     └─ Logo.svg
├─ README.md
├─ server
│  ├─ achievementsEngine.js
│  ├─ controllers
│  │  ├─ analyticsController.js
│  │  ├─ authController.js
│  │  └─ movieController.js
│  ├─ index.js
│  ├─ middleware
│  │  ├─ auth.js
│  │  └─ authMiddleware.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ authRoutes.js
│  │  └─ movieRoutes.js
│  └─ utils
│     ├─ passwordUtils.js
│     └─ tokenUtils.js
├─ src
│  ├─ api
│  │  └─ axios.ts
│  ├─ App.css
│  ├─ App.tsx
│  ├─ assets
│  ├─ cinema_library_achievements.json
│  ├─ components
│  │  ├─ AddToListPopover
│  │  │  ├─ AddToListPopover.tsx
│  │  │  └─ index.ts
│  │  ├─ AuthModal
│  │  │  ├─ AuthModal.tsx
│  │  │  └─ index.ts
│  │  ├─ BottomNav
│  │  │  ├─ BottomNav.tsx
│  │  │  └─ index.ts
│  │  ├─ CreateListModal
│  │  │  ├─ CreateListModal.tsx
│  │  │  └─ index.ts
│  │  ├─ EditProfileModal
│  │  │  ├─ EditProfileModal.tsx
│  │  │  └─ index.ts
│  │  ├─ MovieCard
│  │  │  ├─ index.ts
│  │  │  └─ MovieCard.tsx
│  │  ├─ MovieReviews
│  │  │  ├─ index.ts
│  │  │  └─ MovieReviews.tsx
│  │  ├─ PublicCollections
│  │  │  ├─ index.ts
│  │  │  └─ PublicCollections.tsx
│  │  ├─ ReviewForm
│  │  │  ├─ index.ts
│  │  │  └─ ReviewForm.tsx
│  │  └─ SideBar
│  │     ├─ index.ts
│  │     └─ SideBar.tsx
│  ├─ i18n.ts
│  ├─ images
│  │  ├─ icons
│  │  │  ├─ Search.png
│  │  │  └─ Search.svg
│  │  ├─ Logo.png
│  │  └─ Logo.svg
│  ├─ index.css
│  ├─ locales
│  │  ├─ en.json
│  │  └─ uk.json
│  ├─ main.tsx
│  ├─ output.css
│  ├─ pages
│  │  ├─ AnalyticsPage.tsx
│  │  ├─ CatalogPage.tsx
│  │  ├─ HomePage.tsx
│  │  ├─ MovieDetailsPage.tsx
│  │  ├─ ProfilePage.tsx
│  │  ├─ SettingsPage.tsx
│  │  ├─ WatchlistDetailPage.tsx
│  │  └─ WatchlistsHubPage.tsx
│  ├─ services
│  │  └─ api.ts
│  ├─ store
│  │  ├─ authSlice.ts
│  │  ├─ hooks.ts
│  │  ├─ store.ts
│  │  ├─ themeSlice.ts
│  │  └─ watchlistSlice.ts
│  └─ types
│     ├─ Movie.ts
│     ├─ User.ts
│     └─ Watchlist.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vercel.json
└─ vite.config.ts

```
```
Cinema library
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ images
│     ├─ icons
│     │  ├─ Search.png
│     │  └─ Search.svg
│     ├─ Logo.png
│     └─ Logo.svg
├─ README.md
├─ server
│  ├─ achievementsEngine.js
│  ├─ controllers
│  │  ├─ analyticsController.js
│  │  ├─ authController.js
│  │  └─ movieController.js
│  ├─ index.js
│  ├─ middleware
│  │  ├─ auth.js
│  │  └─ authMiddleware.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ authRoutes.js
│  │  └─ movieRoutes.js
│  └─ utils
│     ├─ passwordUtils.js
│     └─ tokenUtils.js
├─ src
│  ├─ api
│  │  └─ axios.ts
│  ├─ App.css
│  ├─ App.tsx
│  ├─ assets
│  ├─ cinema_library_achievements.json
│  ├─ components
│  │  ├─ AddToListPopover
│  │  │  ├─ AddToListPopover.tsx
│  │  │  └─ index.ts
│  │  ├─ AuthModal
│  │  │  ├─ AuthModal.tsx
│  │  │  └─ index.ts
│  │  ├─ BottomNav
│  │  │  ├─ BottomNav.tsx
│  │  │  └─ index.ts
│  │  ├─ CreateListModal
│  │  │  ├─ CreateListModal.tsx
│  │  │  └─ index.ts
│  │  ├─ EditProfileModal
│  │  │  ├─ EditProfileModal.tsx
│  │  │  └─ index.ts
│  │  ├─ MovieCard
│  │  │  ├─ index.ts
│  │  │  └─ MovieCard.tsx
│  │  ├─ MovieReviews
│  │  │  ├─ index.ts
│  │  │  └─ MovieReviews.tsx
│  │  ├─ PublicCollections
│  │  │  ├─ index.ts
│  │  │  └─ PublicCollections.tsx
│  │  ├─ ReviewForm
│  │  │  ├─ index.ts
│  │  │  └─ ReviewForm.tsx
│  │  └─ SideBar
│  │     ├─ index.ts
│  │     └─ SideBar.tsx
│  ├─ i18n.ts
│  ├─ images
│  │  ├─ icons
│  │  │  ├─ Search.png
│  │  │  └─ Search.svg
│  │  ├─ Logo.png
│  │  └─ Logo.svg
│  ├─ index.css
│  ├─ locales
│  │  ├─ en.json
│  │  └─ uk.json
│  ├─ main.tsx
│  ├─ output.css
│  ├─ pages
│  │  ├─ AnalyticsPage.tsx
│  │  ├─ CatalogPage.tsx
│  │  ├─ HomePage.tsx
│  │  ├─ MovieDetailsPage.tsx
│  │  ├─ ProfilePage.tsx
│  │  ├─ SettingsPage.tsx
│  │  ├─ WatchlistDetailPage.tsx
│  │  └─ WatchlistsHubPage.tsx
│  ├─ services
│  │  └─ api.ts
│  ├─ store
│  │  ├─ authSlice.ts
│  │  ├─ hooks.ts
│  │  ├─ store.ts
│  │  ├─ themeSlice.ts
│  │  └─ watchlistSlice.ts
│  └─ types
│     ├─ Movie.ts
│     ├─ User.ts
│     └─ Watchlist.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vercel.json
└─ vite.config.ts

```