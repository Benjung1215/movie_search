# 🎬 Vue Movie Search App

<div align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.4.0-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/Vite-5.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</div>

<div align="center">
  <h3>🎯 現代化的電影搜尋和收藏應用程式</h3>
  <p>整合 TMDB API，提供完整的電影資訊查詢、收藏管理和個人化體驗</p>
</div>

## ✨ 特色功能

### 🔍 智能搜尋系統
- **即時搜尋**：輸入即時顯示結果，支援防抖動
- **進階篩選**：類型、年份、評分多重篩選
- **搜尋歷史**：自動記錄搜尋記錄，快速重複搜尋
- **熱門推薦**：首頁展示熱門電影和即將上映

### 📱 優雅的使用者介面
- **響應式設計**：完美適配手機、平板、桌面
- **深色主題**：電影院風格的深色界面
- **流暢動畫**：Vue Transition 動畫效果
- **載入狀態**：骨架動畫和載入指示器

### 🎭 完整電影資訊
- **詳細資訊**：電影簡介、上映日期、評分、時長
- **演員陣容**：主要演員和導演資訊
- **預告片**：內嵌預告片播放
- **相似推薦**：基於類型和評分的推薦系統

### 💾 個人化功能
- **收藏清單**：一鍵收藏喜愛電影
- **觀看清單**：管理待看和已看電影
- **個人評分**：為觀看過的電影評分
- **本地儲存**：資料持久化保存

## 🛠️ 開發者指南

### 🚀 開始開發
1. **閱讀 CLAUDE.md**：包含重要的開發規則和指引
2. **遵循開發流程**：任務前檢查清單和提交規範
3. **使用正確架構**：在 `src/main/vue/` 下建立組件
4. **定期提交**：每完成一項任務後提交程式碼

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

## 🔧 技術堆疊

### 🚀 前端框架
- **Vue 3.4.0** - 使用 Composition API 和 `<script setup>` 語法
- **Vite 5.0.0** - 快速建置工具，支援 HMR 和 Tree-shaking
- **TypeScript Ready** - 完整的型別定義支援

### 🎨 UI/UX
- **Tailwind CSS 3.4.0** - 原子化 CSS 框架
- **PostCSS** - CSS 後處理器，支援 Nested 和 Autoprefixer
- **Vue Transition** - 流暢的頁面切換動畫

### 🗂️ 狀態管理與路由
- **Pinia** - Vue 3 官方狀態管理工具
- **Vue Router 4** - 支援懶載入和動態路由
- **VueUse** - 實用的 Vue 組合式函數庫

### 📡 資料處理
- **TanStack Query Vue** - 強大的伺服器狀態管理
- **TMDB API** - 電影資料庫 API 整合
- **Firebase** - 使用者認證和資料儲存

### 🧪 測試環境
- **Vitest** - 快速的單元測試框架
- **Vue Test Utils** - Vue 組件測試工具
- **jsdom** - 瀏覽器環境模擬

### 🔨 開發工具
- **ESLint** - 程式碼品質檢查
- **Prettier** - 程式碼格式化
- **Git Hooks** - 自動化程式碼檢查

## 🎯 核心功能

<table>
  <tr>
    <td width="50%">
      <h3>🔍 智能搜尋</h3>
      <ul>
        <li>即時搜尋結果</li>
        <li>防抖動機制</li>
        <li>進階篩選器</li>
        <li>搜尋歷史記錄</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🎬 電影資訊</h3>
      <ul>
        <li>詳細電影資料</li>
        <li>演員陣容</li>
        <li>預告片播放</li>
        <li>相似電影推薦</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>💾 個人化</h3>
      <ul>
        <li>收藏清單管理</li>
        <li>觀看清單</li>
        <li>個人評分系統</li>
        <li>本地儲存</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📱 使用者體驗</h3>
      <ul>
        <li>響應式設計</li>
        <li>深色主題</li>
        <li>流暢動畫</li>
        <li>載入狀態</li>
      </ul>
    </td>
  </tr>
</table>

## 🚀 快速開始

### 📋 系統需求
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 或 **yarn** >= 1.22.0

### 🛠️ 安裝步驟

1. **Clone 專案**
   ```bash
   git clone https://github.com/Benjung1215/movie_search.git
   cd movie-search
   ```

2. **安裝依賴**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **設定環境變數**
   
   建立 `.env` 檔案在專案根目錄：
   ```bash
   # TMDB API 設定
   VITE_TMDB_API_KEY=your_api_key_here
   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
   VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/
   
   # Firebase 設定 (可選)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   ```

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   應用程式將在 `http://localhost:3000` 開啟

### 🔑 取得 TMDB API Key

1. 前往 [TMDB 官網](https://www.themoviedb.org/)
2. 註冊或登入帳號
3. 進入 [API 設定頁面](https://www.themoviedb.org/settings/api)
4. 申請 API Key
5. 將 API Key 複製到 `.env` 檔案中

### 📦 可用指令

```bash
# 🛠️ 開發
npm run dev              # 啟動開發伺服器 (localhost:3000)
npm run build            # 建置生產版本
npm run preview          # 預覽生產版本

# 🧪 測試
npm run test             # 執行單元測試
npm run test:ui          # 執行測試 (互動式 UI)
npm run test:coverage    # 執行測試並生成覆蓋率報告

# 🔍 程式碼品質
npm run lint             # 自動修正 ESLint 錯誤
npm run lint:check       # 檢查 ESLint 錯誤 (不修正)
```

### 🌟 首次使用

1. **開啟應用程式**：`http://localhost:3000`
2. **搜尋電影**：在首頁搜尋列輸入電影名稱
3. **瀏覽電影**：點擊電影卡片查看詳細資訊
4. **收藏電影**：點擊愛心圖示收藏喜愛的電影
5. **個人化設定**：在個人檔案頁面管理收藏和評分

## 🚀 部署指南

### 📦 建置生產版本

```bash
# 建置應用程式
npm run build

# 預覽建置結果
npm run preview
```

### 🌐 部署到 Vercel

1. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **連接 Vercel**
   - 前往 [Vercel Dashboard](https://vercel.com/dashboard)
   - 選擇 "New Project"
   - 匯入 GitHub 儲存庫

3. **設定環境變數**
   在 Vercel 專案設定中新增：
   ```
   VITE_TMDB_API_KEY=your_api_key_here
   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
   VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/
   ```

4. **部署**
   Vercel 會自動建置和部署應用程式

### 🔧 其他部署選項

<details>
<summary>🔵 部署到 Netlify</summary>

1. 建置應用程式：`npm run build`
2. 將 `dist` 資料夾拖放到 Netlify
3. 在 Netlify 儀表板設定環境變數
4. 設定重新導向規則（SPA）

</details>

<details>
<summary>🟢 部署到 GitHub Pages</summary>

1. 安裝 gh-pages：`npm install --save-dev gh-pages`
2. 在 package.json 新增：
   ```json
   {
     "homepage": "https://username.github.io/vue-movie-search",
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```
3. 建置並部署：`npm run build && npm run deploy`

</details>

### 🔒 生產環境最佳化

- **啟用 HTTPS**：確保 API 請求安全
- **設定 CDN**：加速靜態資源載入
- **監控效能**：使用 Lighthouse 檢查效能
- **錯誤追蹤**：整合 Sentry 或類似服務

## 🛠️ 開發指南

### 📁 專案結構說明

```
src/main/vue/
├── components/          # 可重複使用的組件
│   ├── ui/             # 基礎 UI 組件
│   ├── movie/          # 電影相關組件
│   ├── layout/         # 佈局組件
│   └── auth/           # 認證組件
├── views/              # 頁面組件
├── stores/             # Pinia 狀態管理
├── composables/        # 組合式函數
├── services/           # API 服務
└── router/             # 路由配置
```

### 🎯 開發最佳實踐

- **組件命名**：使用 PascalCase（如：`MovieCard.vue`）
- **檔案組織**：依功能分組，避免過深的巢狀結構
- **狀態管理**：使用 Pinia 管理全域狀態
- **型別安全**：善用 TypeScript 提供型別檢查
- **效能優化**：使用 `v-memo` 和 `defineAsyncComponent`

### 🧪 測試策略

```bash
# 執行所有測試
npm run test

# 監視模式
npm run test:watch

# 覆蓋率報告
npm run test:coverage

# 執行特定測試
npm run test -- MovieCard.test.js
```

### 🔍 除錯技巧

- **Vue DevTools**：安裝瀏覽器擴充功能
- **網路除錯**：檢查 API 請求和回應
- **效能分析**：使用 Chrome DevTools
- **錯誤邊界**：實作錯誤處理機制

### 🐛 回報錯誤

如果您發現錯誤，請：
1. 檢查是否已有相同的 issue
2. 建立新的 issue 並包含：
   - 錯誤描述
   - 重現步驟
   - 預期行為
   - 螢幕截圖（如適用）
   - 環境資訊

### 💡 功能建議

有新的功能想法嗎？
1. 開啟 issue 討論功能
2. 說明功能的用途和好處
3. 提供設計或原型（如有）

### 📝 程式碼規範

- 使用 ESLint 和 Prettier
- 撰寫清楚的 commit 訊息
- 為新功能添加測試
- 更新相關文件


### 🙏 致謝

- [TMDB](https://www.themoviedb.org/) - 提供電影資料 API
- [Vue.js](https://vuejs.org/) - 優秀的前端框架
- [Tailwind CSS](https://tailwindcss.com/) - 實用的 CSS 框架
- [Vite](https://vitejs.dev/) - 快速的建置工具

### 📊 專案統計

- 🌟 如果這個專案對您有幫助，請給它一個星星！
- 🐛 發現問題？請建立 issue
- 💬 有問題？歡迎討論

### 🔗 相關連結

- [專案展示](https://movie-search-sooty-tau.vercel.app/)
- [API 文件](https://developers.themoviedb.org/3)

---

<div align="center">
  <p>使用 ❤️ 和 Vue.js 建立</p>
  <p>© 2025 Vue Movie Search App. All rights reserved.</p>
</div>