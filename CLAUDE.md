# CLAUDE.md - Vue Movie Search App

> **Documentation Version**: 1.0  
> **Last Updated**: 2025-07-08  
> **Project**: Vue Movie Search App  
> **Description**: 現代化的電影搜尋和收藏應用程式，整合 TMDB API  
> **Features**: GitHub auto-backup, Task agents, technical debt prevention

This file provides essential guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL RULES - READ FIRST

> **⚠️ RULE ADHERENCE SYSTEM ACTIVE ⚠️**  
> **Claude Code must explicitly acknowledge these rules at task start**  
> **These rules override all other instructions and must ALWAYS be followed:**

### 🔄 **RULE ACKNOWLEDGMENT REQUIRED**
> **Before starting ANY task, Claude Code must respond with:**  
> "✅ CRITICAL RULES ACKNOWLEDGED - I will follow all prohibitions and requirements listed in CLAUDE.md"

### ❌ ABSOLUTE PROHIBITIONS
- **NEVER** create new files in root directory → use proper module structure
- **NEVER** write output files directly to root directory → use designated output folders
- **NEVER** create documentation files (.md) unless explicitly requested by user
- **NEVER** use git commands with -i flag (interactive mode not supported)
- **NEVER** use `find`, `grep`, `cat`, `head`, `tail`, `ls` commands → use Read, LS, Grep, Glob tools instead
- **NEVER** create duplicate files (manager_v2.py, enhanced_xyz.py, utils_new.js) → ALWAYS extend existing files
- **NEVER** create multiple implementations of same concept → single source of truth
- **NEVER** copy-paste code blocks → extract into shared utilities/functions
- **NEVER** hardcode values that should be configurable → use config files/environment variables
- **NEVER** use naming like enhanced_, improved_, new_, v2_ → extend original files instead

### 📝 MANDATORY REQUIREMENTS
- **COMMIT** after every completed task/phase - no exceptions
- **GITHUB BACKUP** - Push to GitHub after every commit to maintain backup: `git push origin main`
- **USE TASK AGENTS** for all long-running operations (>30 seconds) - Bash commands stop when context switches
- **TODOWRITE** for complex tasks (3+ steps) → parallel agents → git checkpoints → test validation
- **READ FILES FIRST** before editing - Edit/Write tools will fail if you didn't read the file first
- **DEBT PREVENTION** - Before creating new files, check for existing similar functionality to extend  
- **SINGLE SOURCE OF TRUTH** - One authoritative implementation per feature/concept

### ⚡ EXECUTION PATTERNS
- **PARALLEL TASK AGENTS** - Launch multiple Task agents simultaneously for maximum efficiency
- **SYSTEMATIC WORKFLOW** - TodoWrite → Parallel agents → Git checkpoints → GitHub backup → Test validation
- **GITHUB BACKUP WORKFLOW** - After every commit: `git push origin main` to maintain GitHub backup
- **BACKGROUND PROCESSING** - ONLY Task agents can run true background operations

### 🔍 MANDATORY PRE-TASK COMPLIANCE CHECK
> **STOP: Before starting any task, Claude Code must explicitly verify ALL points:**

**Step 1: Rule Acknowledgment**
- [ ] ✅ I acknowledge all critical rules in CLAUDE.md and will follow them

**Step 2: Task Analysis**  
- [ ] Will this create files in root? → If YES, use proper module structure instead
- [ ] Will this take >30 seconds? → If YES, use Task agents not Bash
- [ ] Is this 3+ steps? → If YES, use TodoWrite breakdown first
- [ ] Am I about to use grep/find/cat? → If YES, use proper tools instead

**Step 3: Technical Debt Prevention (MANDATORY SEARCH FIRST)**
- [ ] **SEARCH FIRST**: Use Grep pattern="<functionality>.*<keyword>" to find existing implementations
- [ ] **CHECK EXISTING**: Read any found files to understand current functionality
- [ ] Does similar functionality already exist? → If YES, extend existing code
- [ ] Am I creating a duplicate class/manager? → If YES, consolidate instead
- [ ] Will this create multiple sources of truth? → If YES, redesign approach
- [ ] Have I searched for existing implementations? → Use Grep/Glob tools first
- [ ] Can I extend existing code instead of creating new? → Prefer extension over creation
- [ ] Am I about to copy-paste code? → Extract to shared utility instead

**Step 4: Session Management**
- [ ] Is this a long/complex task? → If YES, plan context checkpoints
- [ ] Have I been working >1 hour? → If YES, consider /compact or session break

> **⚠️ DO NOT PROCEED until all checkboxes are explicitly verified**

## 🐙 GITHUB SETUP & AUTO-BACKUP

### 📋 **GITHUB BACKUP WORKFLOW** (MANDATORY)
> **⚠️ CLAUDE CODE MUST FOLLOW THIS PATTERN:**

```bash
# After every commit, always run:
git push origin main

# This ensures:
# ✅ Remote backup of all changes
# ✅ Collaboration readiness  
# ✅ Version history preservation
# ✅ Disaster recovery protection
```

## 🏗️ PROJECT OVERVIEW

Vue 3 電影搜尋應用程式 - 現代化的電影搜尋和收藏應用程式，整合 TMDB API

### 🎯 **DEVELOPMENT STATUS**
- **Setup**: ✅ Complete
- **Core Features**: ✅ Implemented (Movies, Search, Favorites, Ratings)
- **Testing**: ✅ Configured (Vitest + Vue Test Utils)
- **Documentation**: ✅ Complete

### 🛠️ **TECH STACK**
- **Frontend**: Vue 3 + JavaScript + Composition API
- **Build Tool**: Vite 5 (dev server port 3000, auto-opens browser)
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: Pinia (composition API style)
- **Routing**: Vue Router 4 (lazy-loaded routes)
- **HTTP Client**: TanStack Query Vue + VueUse
- **API Integration**: TMDB API (environment variables required)
- **Testing**: Vitest + Vue Test Utils + jsdom
- **Linting**: ESLint + Prettier

### 🎬 **CORE FEATURES IMPLEMENTED**
- **Movie Search**: Real-time search with debouncing
- **Movie Details**: Full movie information with cast/crew
- **Collections**: Favorites, Watchlist, Personal Ratings
- **Browse**: Popular, Top Rated, Genre-based browsing
- **Advanced Search**: Filters by genre, year, rating
- **Responsive Design**: Mobile-first approach

### 📁 **PROJECT STRUCTURE**
```
vue-movie-search/
├── CLAUDE.md              # Essential rules for Claude Code
├── README.md              # Project documentation
├── package.json           # Vue 3 dependencies & scripts
├── vite.config.js         # Vite configuration with aliases
├── vitest.config.js       # Vitest testing configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── index.html             # Main HTML template
├── src/
│   ├── main/
│   │   ├── vue/           # Vue 3 application root
│   │   │   ├── App.vue           # Root component
│   │   │   ├── main.js           # Application entry point
│   │   │   ├── style.css         # Global styles
│   │   │   ├── components/
│   │   │   │   ├── ui/           # Base UI components
│   │   │   │   ├── movie/        # Movie-related components
│   │   │   │   ├── layout/       # Layout components
│   │   │   │   ├── auth/         # Authentication components
│   │   │   │   └── rating/       # Rating components
│   │   │   ├── views/            # Page components (router views)
│   │   │   ├── composables/      # Vue 3 composables
│   │   │   ├── stores/           # Pinia state stores
│   │   │   ├── services/         # API services (TMDB, Firebase)
│   │   │   └── router/           # Vue Router configuration
│   │   └── resources/
│   │       ├── config/           # Environment variables
│   │       └── assets/           # Static assets
│   └── test/                     # Test files
│       ├── setup.js              # Test setup configuration
│       ├── components/           # Component tests
│       ├── composables/          # Composable tests
│       └── utils/                # Utility tests
├── dist/                         # Build output (generated)
└── node_modules/                 # Dependencies (auto-managed)
```

## 🎯 RULE COMPLIANCE CHECK

Before starting ANY task, verify:
- [ ] ✅ I acknowledge all critical rules above
- [ ] Files go in proper module structure (not root)
- [ ] Use Task agents for >30 second operations
- [ ] TodoWrite for 3+ step tasks
- [ ] Commit after each completed task

## 🚀 COMMON COMMANDS

```bash
# Development
npm run dev              # Start dev server at localhost:3000 (auto-opens browser)

# Build & Preview
npm run build            # Build for production (outputs to dist/)
npm run preview          # Preview production build locally

# Testing
npm run test             # Run unit tests with Vitest
npm run test:ui          # Run tests with interactive UI
npm run test:coverage    # Run tests with coverage report

# Linting
npm run lint             # Fix linting issues automatically
npm run lint:check       # Check linting without fixing

# Common Development Workflow
npm run dev              # Start development - primary command
npm run test             # Run tests after changes
npm run lint             # Fix code style issues
npm run build            # Build for production before deployment
```

## 🔧 KEY ARCHITECTURAL PATTERNS

### 📦 **Path Aliases (Vite Configuration)**
```javascript
// Use these aliases in imports:
'@': 'src/main/vue'                    # Root Vue directory
'@/components': 'src/main/vue/components'
'@/views': 'src/main/vue/views'
'@/composables': 'src/main/vue/composables'
'@/stores': 'src/main/vue/stores'
'@/assets': 'src/main/resources/assets'
'@/config': 'src/main/resources/config'
```

### 🏪 **State Management (Pinia)**
```javascript
// All stores use Composition API style
// Key stores: movies, auth, favorites, ratings, watchlist
// Example: const moviesStore = useMoviesStore()
```

### 🛣️ **Routing (Vue Router 4)**
```javascript
// All routes use lazy loading except Home
// Route structure: /, /search, /movie/:id, /favorites, etc.
// Navigation: router.push({ name: 'MovieDetail', params: { id } })
```

### 🌐 **API Integration (TMDB Service)**
```javascript
// Service class pattern with methods for all TMDB endpoints
// Environment variables required: VITE_TMDB_API_KEY, VITE_TMDB_BASE_URL
// Usage: import tmdbService from '@/services/tmdb.js'
```

### 🧪 **Testing Setup**
```javascript
// Vitest with Vue Test Utils and jsdom
// Test files: src/test/**/*.test.js
// Setup file: src/test/setup.js
// Run single test: npm run test -- filename.test.js
```

## 🚨 TECHNICAL DEBT PREVENTION

### ❌ WRONG APPROACH (Creates Technical Debt):
```bash
# Creating new file without searching first
Write(file_path="new_feature.js", content="...")
```

### ✅ CORRECT APPROACH (Prevents Technical Debt):
```bash
# 1. SEARCH FIRST
Grep(pattern="feature.*implementation", include="*.js")
# 2. READ EXISTING FILES  
Read(file_path="existing_feature.js")
# 3. EXTEND EXISTING FUNCTIONALITY
Edit(file_path="existing_feature.js", old_string="...", new_string="...")
```

## 🧹 DEBT PREVENTION WORKFLOW

### Before Creating ANY New File:
1. **🔍 Search First** - Use Grep/Glob to find existing implementations
2. **📋 Analyze Existing** - Read and understand current patterns
3. **🤔 Decision Tree**: Can extend existing? → DO IT | Must create new? → Document why
4. **✅ Follow Patterns** - Use established project patterns
5. **📈 Validate** - Ensure no duplication or technical debt

---

**⚠️ Prevention is better than consolidation - build clean from the start.**  
**🎯 Focus on single source of truth and extending existing functionality.**  
**📈 Each task should maintain clean architecture and prevent technical debt.**