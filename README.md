# Vue Movie Search App

現代化的電影搜尋和收藏應用程式，整合 TMDB API

## Quick Start

1. **Read CLAUDE.md first** - Contains essential rules for Claude Code
2. Follow the pre-task compliance checklist before starting any work
3. Use proper module structure under `src/main/vue/`
4. Commit after every completed task

## Project Structure

```
vue-movie-search/
├── CLAUDE.md              # Essential rules for Claude Code
├── README.md              # Project documentation
├── package.json           # Vue 3 dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── src/
│   ├── main/
│   │   ├── vue/           # Vue 3 components and pages
│   │   │   ├── components/
│   │   │   │   ├── ui/           # Base UI components
│   │   │   │   ├── movie/        # Movie-related components
│   │   │   │   └── layout/       # Layout components
│   │   │   ├── views/            # Page components
│   │   │   ├── composables/      # Composition functions
│   │   │   ├── stores/           # Pinia state management
│   │   │   └── router/           # Vue Router
│   │   └── resources/
│   │       ├── config/           # Environment variables
│   │       └── assets/           # Static assets
│   └── test/                     # Test files
├── docs/                         # Documentation
└── output/                       # Output files
```

## Tech Stack

- **Vue 3** + JavaScript + Composition API
- **Vite** 建置工具
- **Tailwind CSS** + Headless UI Vue
- **Vue Router 4** + Pinia
- **TanStack Query Vue** + VueUse
- **TMDB API** 整合

## Core Features

1. **電影搜尋系統**
   - 即時搜尋 + 防抖動
   - 進階篩選 (類型、年份、評分)
   - 搜尋歷史記錄

2. **電影展示**
   - 響應式卡片佈局
   - 無限滾動分頁
   - 載入骨架動畫

3. **電影詳情頁**
   - 完整電影資訊
   - 演員陣容展示
   - 預告片播放
   - 相似電影推薦

4. **個人化功能**
   - 收藏清單管理
   - 觀看清單 (待看/已看)
   - 個人評分系統
   - 本地儲存持久化

5. **UI/UX 特色**
   - 深色電影院主題
   - 金色主色調 (#f59e0b)
   - Vue Transition 動畫
   - 完全響應式設計

## Development Guidelines

- **Always search first** before creating new files
- **Extend existing** functionality rather than duplicating  
- **Use Task agents** for operations >30 seconds
- **Single source of truth** for all functionality
- **Language-agnostic structure** - works with Vue 3 JavaScript
- **Scalable** - start simple, grow as needed

## Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Run tests: `npm run test`

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_TMDB_API_KEY=your_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```