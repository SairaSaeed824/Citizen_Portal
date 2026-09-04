# Citizen Portal — UI/UX Design System & Architecture Guide

> **Version:** 2.0 | **Last Updated:** September 2026
> **Stack:** React 18 + Vite · Tailwind CSS v4 · FastAPI · MongoDB · Redis

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Frontend Component Map](#2-frontend-component-map)
3. [Color System & Theme Design](#3-color-system--theme-design)
4. [Dark / Light Mode Strategy](#4-dark--light-mode-strategy)
5. [Typography System](#5-typography-system)
6. [Icon System — Lucide React](#6-icon-system--lucide-react)
7. [Animation Guidelines](#7-animation-guidelines)
8. [Component Design Patterns](#8-component-design-patterns)
9. [Dialogue & Modal System](#9-dialogue--modal-system)
10. [Screen-by-Screen Flowcharts](#10-screen-by-screen-flowcharts)
11. [User Interaction Flow](#11-user-interaction-flow)
12. [Data Flow Architecture](#12-data-flow-architecture)
13. [Responsive Design](#13-responsive-design)
14. [UI Improvement Roadmap](#14-ui-improvement-roadmap)

---

## 1. System Architecture

### 1.1 Full-Stack Diagram

```
CITIZEN OPPORTUNITIES PORTAL — Full-Stack Architecture
======================================================

  +-------------------------------------------------------------+
  |           FRONTEND LAYER  (Vite + React 18)                |
  |  Navbar | HeroSection | ChatbotScreen | Modal | Footer     |
  |  Tailwind CSS v4  .  Lucide Icons  .  i18n (EN/UR) . RTL  |
  +----------------------------+--------------------------------+
                               | HTTPS / REST (Axios)
  +----------------------------v--------------------------------+
  |           BACKEND LAYER  (Python FastAPI)                  |
  |                                                            |
  |  [Auth/RBAC JWT]  [Public API /opps]  [Admin API]         |
  |  [AI Chatbot Svc] [Recommender Engine][Eligibility Calc]  |
  +---------+-----------------------------------+--------------+
            |                                   |
  +---------v----------+          +-------------v-----------+
  |   Upstash Redis    |          |    MongoDB Atlas         |
  | Cache/Sessions/RL  |          | Primary Document DB      |
  +--------------------+          +-------------------------++
                                               ^
                                  +------------+----------+
                                  |   Scraper Engine      |
                                  | BS4 + Selenium        |
                                  | HEC|NJP|BNIP|SMEDA   |
                                  | NAVTTC|Youth Affairs  |
                                  +-----------------------+
```

### 1.2 Frontend Source Tree

```
frontend/src/
├── main.jsx                  App Bootstrap (React root mount)
├── App.jsx                   Root layout + global state hub
│   ├── State: darkMode       Persisted to localStorage
│   ├── State: lang (en/ur)   RTL/LTR switching
│   ├── State: currentScreen  SPA screen router
│   └── State: selectedOpportunity  Modal trigger
├── components/               Pure UI Components (presentational)
│   ├── DisclaimerBanner.jsx  Non-govt aggregator strip
│   ├── Navbar.jsx            Sticky nav + theme + lang toggles
│   ├── HeroSection.jsx       Search bar + province filter
│   ├── CivicStatsDashboard.jsx  Animated 4-tile stats
│   ├── CategoryNav.jsx       Horizontal scrolling category tabs
│   ├── OpportunityCard.jsx   Listing card with hover elevation
│   ├── OpportunityDetailModal.jsx  Full detail overlay modal
│   ├── SmallBanners.jsx      Featured flagship scheme banners
│   └── Footer.jsx            Site links + branding
├── screens/                  Page-level containers (logic-heavy)
│   ├── HomeScreen.jsx        Main directory with filtering
│   ├── SubmitOpportunityScreen.jsx  Community submission form
│   └── ChatbotScreen.jsx     AI assistant conversation UI
├── services/
│   └── opportunitiesService.js  All Axios calls to FastAPI
├── i18n/
│   └── translations.js       EN + UR string dictionaries
└── data/                     Static/seed data
```

---

## 2. Frontend Component Map

### 2.1 Component Hierarchy Tree

```
App.jsx (Root Shell)
│
├── DisclaimerBanner          [STRIP] Non-govt disclaimer, always on top
├── Navbar                    [STICKY] Top navigation header
│   ├── OfficialTopStrip      Dark green header band
│   │   ├── DarkModeToggle    Sun/Moon + label
│   │   └── LanguageToggle    EN / UR switcher
│   ├── LogoBranding          SVG crescent logo + portal title
│   ├── NavLinks (desktop)    Home | Submit | Chatbot
│   └── MobileDrawer          Hamburger slide-down menu
│
├── main [conditional screen render based on currentScreen]
│   ├── HomeScreen            [PAGE] Primary discovery interface
│   │   ├── HeroSection       Full-width Pakistan green search banner
│   │   │   ├── SearchInput   Keyword field + Search icon
│   │   │   ├── ProvinceSelect Dropdown region filter
│   │   │   ├── SearchButton  Submit trigger
│   │   │   └── QuickTags     Popular keyword chips
│   │   ├── CivicStatsDashboard  4 animated metric tiles
│   │   ├── CategoryNav       Scrollable filter tabs
│   │   ├── DirectorySection  Results area
│   │   │   ├── ControlsToolbar  Province + Sort + Clear
│   │   │   ├── LoadingState  Loader2 spinner
│   │   │   ├── EmptyState    FolderOpen icon + CTA
│   │   │   └── OpportunityCard x N  Grid cards
│   │   └── SmallBanners      4 featured initiative banners
│   ├── SubmitOpportunityScreen  [PAGE] Community form
│   └── ChatbotScreen         [PAGE] AI conversation
│       ├── HeaderBar         Back + live status pill
│       ├── MessagesList      Scrollable chat thread
│       │   ├── BotMessage    Avatar + bubble + related cards
│       │   ├── UserMessage   Avatar + green bubble
│       │   └── TypingIndicator  3-dot bounce animation
│       ├── QuickChips        Suggested prompt buttons
│       └── InputArea         Text input + Send button
│
├── FloatingChatbotFAB        [FIXED] Bottom-right floating button
│   ├── PulseRing             animate-ping availability dot
│   └── BotIcon               Lucide Bot (w-7 h-7)
│
├── OpportunityDetailModal    [OVERLAY] Full-detail dialog
│   ├── GreenHeaderBand       Pakistan green header
│   │   ├── CategoryBadge     Category pill
│   │   ├── VerifiedBadge     ShieldCheck verified pill
│   │   ├── Title             H3 white on green
│   │   └── Meta              Organization + Province
│   ├── DescriptionSection    About the program block
│   ├── KeyInfoGrid           Dynamic 2-col field cards
│   ├── OfficialNotice        AlertCircle gateway notice
│   └── ActionBar             Close | Share | Apply Now
│
└── Footer                    [STATIC] Bottom site footer
```

### 2.2 App.jsx Global State Flow

```
App.jsx (Global State Hub)
    │
    ├─── darkMode ──────────────────► Navbar (icon switch)
    │        │                         body classList: 'dark'
    │        └──────────────────────► localStorage 'theme'
    │
    ├─── lang (en/ur) ──────────────► Navbar (label update)
    │        │                         document.lang attribute
    │        └──────────────────────► body classList: 'font-urdu'
    │
    ├─── currentScreen ─────────────► main (conditional render)
    │        └─── 'home' | 'submit' | 'chatbot'
    │
    └─── selectedOpportunity ───────► OpportunityDetailModal
             ├── null   → modal unmounted
             └── Object → modal renders with data
```

---

## 3. Color System & Theme Design

### 3.1 Primary Palette — Pakistan Green Identity

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| Primary | `#00401A` | `#00401A` | Buttons, active nav, CTA |
| Primary Hover | `#055825` | `#047857` | Button hover |
| Brand Green | `#046a38` | `#059669` | Gradient endpoints |
| Light Green | `#d1fae5` emerald-100 | `#022c22` emerald-950 | Badge backgrounds |
| Accent | `#10b981` emerald-500 | `#34d399` emerald-400 | Pings, highlights |
| Border | `#a7f3d0` emerald-200 | `#064e3b` emerald-900 | Card borders |

### 3.2 Neutral Palette

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| Page BG | `#f8fafc` slate-50 | `#020617` slate-950 | Page background |
| Card BG | `#ffffff` | `#0f172a` slate-900 | Card surfaces |
| Elevated | `#f1f5f9` slate-100 | `#1e293b` slate-800 | Inputs, chips |
| Text Primary | `#1e293b` slate-800 | `#f1f5f9` slate-100 | Body copy |
| Text Muted | `#64748b` slate-500 | `#94a3b8` slate-400 | Captions |
| Border | `#e2e8f0` slate-200 | `#1e293b` slate-800 | Dividers |

### 3.3 Semantic Colors

| Status | Color | Hex | Usage |
|---|---|---|---|
| Danger / Closing Soon | rose-600 | `#e11d48` | Deadline urgency |
| Success / Verified | emerald-600 | `#059669` | Verified badges |
| Warning / Caution | amber-600 | `#d97706` | Disclaimer banners |
| Info / Active | sky-600 | `#0284c7` | Status indicators |

### 3.4 Hero Gradient CSS

```css
.pakistan-hero-bg {
  background: linear-gradient(135deg,
    #003615 0%,   /* Deep forest green */
    #004d1f 40%,  /* Pakistan flag green */
    #046a38 75%,  /* Mid emerald */
    #057a3b 100%  /* Lighter emerald */
  );
}
.pakistan-hero-bg-dark {
  background: linear-gradient(135deg,
    #001f0c 0%,   /* Near-black deep green */
    #003314 45%,  /* Dark forest */
    #024a25 80%,  /* Dark emerald */
    #035c2e 100%
  );
}
```

### 3.5 Glassmorphism — Navbar

```css
background: rgba(255, 255, 255, 0.95);  /* Light */
background: rgba(15, 23, 42, 0.95);     /* Dark (slate-900) */
backdrop-filter: blur(12px);
border-bottom: 1px solid; /* emerald-100 / slate-800 */
```

---

## 4. Dark / Light Mode Strategy

### 4.1 Theme Architecture Flow

```
User clicks Sun/Moon
        │
        ▼
setDarkMode(!darkMode)
        │
        ▼  [useEffect]
darkMode === true?
  YES ─► classList.add('dark') + localStorage 'dark'
  NO  ─► classList.remove('dark') + localStorage 'light'
        │
        ▼
All Tailwind dark: variants toggle globally
transition-colors 200ms smooth blend
        │
        ▼
Icon: Moon ↔ Sun   Label: "Dark" ↔ "Light"
Toast: "Switched to Dark Mode" (recommended)
```

### 4.2 Toggle Locations

| Location | Component | Visibility | Control |
|---|---|---|---|
| Top green strip | Navbar | Desktop | Sun/Moon + text label |
| Mobile header | Navbar | Mobile only | Sun/Moon icon |
| Recommended | Persistent pill | Always | iOS-style sliding pill |

### 4.3 Color Transition Mapping

```
Light ──────────────────────────────────► Dark
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backgrounds:
  slate-50  ──► slate-950    (page)
  white     ──► slate-900    (cards, modals)
  slate-100 ──► slate-800    (inputs, chips)

Text:
  slate-800 ──► slate-100    (primary)
  slate-500 ──► slate-400    (muted/caption)

Borders:
  slate-200 ──► slate-800    (dividers)
  emerald-100──► slate-800   (nav borders)

Buttons:
  #00401A   ──► emerald-600  (primary CTA)
  slate-100 ──► slate-800    (secondary)
```

### 4.4 UX Fix — Resolving User Confusion

```
PROBLEM: Small icon alone gives insufficient feedback.
Users in mixed-light environments can't tell their current mode.

CURRENT (subtle):
  [Moon icon]  — just an icon, no state label

ENHANCED (clear):
  ┌─────────────────────────────┐
  │  [🌙]  Dark Mode            │  ← active state pill
  │  Currently in DARK mode     │  ← micro-label below
  └─────────────────────────────┘

  ┌─────────────────────────────┐
  │  [☀]  Light Mode            │  ← active state pill
  │  Currently in LIGHT mode    │
  └─────────────────────────────┘
```

**Implementation Checklist:**
- [ ] Add `aria-pressed="true/false"` to toggle
- [ ] Always show label (remove `hidden sm:inline`)
- [ ] Animate with iOS-style sliding pill
- [ ] Toast notification on switch

---

## 5. Typography System

### 5.1 Font Stack

| Context | Font | Weights | Usage |
|---|---|---|---|
| English UI | Plus Jakarta Sans → Inter → system-ui | 400–800 | All English text |
| Urdu UI | Noto Nastaliq Urdu → serif | 400–700 | Urdu text + RTL |

### 5.2 Type Scale

| Level | Class | Size | Weight | Usage |
|---|---|---|---|---|
| Display | `.text-4xl` | 36px | 800 | Hero Urdu heading |
| H1 | `.text-2xl` | 24px | 700 | Modal titles |
| H2 | `.text-xl` | 20px | 700 | Screen headings |
| H3 | `.text-base` | 16px | 700 | Sub-section labels |
| Body | `.text-sm` | 14px | 400–500 | Body content |
| Small | `.text-xs` | 12px | 400–600 | Captions, badges |
| Micro | `.text-[10px]` | 10px | 600–800 | Tags, timestamps |

### 5.3 Google Fonts Snippet

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
```

---

## 6. Icon System — Lucide React

### 6.1 Complete Icon Inventory

| Icon | File | Purpose | Size |
|---|---|---|---|
| `Bot` | FAB, ChatbotScreen | AI assistant identity | w-7 h-7 |
| `Sun` / `Moon` | Navbar | Theme toggle | w-3.5 h-3.5 |
| `Globe` | Navbar | Language toggle | w-3.5 h-3.5 |
| `Menu` / `X` | Navbar | Mobile hamburger | w-5 h-5 |
| `ShieldCheck` | Navbar, Modal | Verified badge | w-3.5 h-3.5 |
| `Search` | HeroSection | Search input | w-4 h-4 |
| `MapPin` | Hero, Card | Province location | w-3.5 h-3.5 |
| `Briefcase` | OpportunityCard | Jobs category | w-3 h-3 |
| `GraduationCap` | OpportunityCard | Scholarships | w-3 h-3 |
| `Landmark` | OpportunityCard | Loans | w-3 h-3 |
| `Sparkles` | OpportunityCard | Training | w-3 h-3 |
| `Building2` | OpportunityCard | Internships | w-3 h-3 |
| `Calendar` | OpportunityCard | Deadline date | w-3.5 h-3.5 |
| `Clock` | OpportunityCard | Duration | w-3.5 h-3.5 |
| `Coins` | OpportunityCard | Stipend | w-3.5 h-3.5 |
| `BookOpen` | OpportunityCard | Degree level | w-3.5 h-3.5 |
| `UserCheck` | OpportunityCard | Vacancies | w-3.5 h-3.5 |
| `ExternalLink` | Cards, Modal | Apply link | w-3 h-3 |
| `ArrowUpRight` | SmallBanners | Banner CTA | w-4 h-4 |
| `Loader2` | HomeScreen | Loading spinner | w-8 h-8 |
| `FolderOpen` | HomeScreen | Empty state | w-10 h-10 |
| `RotateCcw` | HomeScreen | Clear filters | w-3.5 h-3.5 |
| `Share2` / `Check` | Modal | Share/copy | w-3.5 h-3.5 |
| `FileText` | Modal | Description header | w-4 h-4 |
| `AlertCircle` | Modal | Gateway notice | w-4 h-4 |
| `Send` | ChatbotScreen | Send message | w-3.5 h-3.5 |
| `ArrowLeft` | ChatbotScreen | Back button | w-4 h-4 |
| `Trash2` | ChatbotScreen | Clear chat | w-4 h-4 |
| `Copy` | ChatbotScreen | Copy message | w-3 h-3 |
| `RefreshCw` | ChatbotScreen | Loading/retry | w-4 h-4 |
| `ChevronRight` | ChatbotScreen | Related opp | w-4 h-4 |
| `User` | ChatbotScreen | User avatar | w-4 h-4 |

### 6.2 Category Color Enhancement

```
CURRENT: All badges → same emerald color (no differentiation)

ENHANCED: Per-category semantic identity

  job         → amber-500    bg-amber-50   / dark: amber-950
  scholarship → blue-500     bg-blue-50    / dark: blue-950
  loan        → violet-500   bg-violet-50  / dark: violet-950
  training    → emerald-500  bg-emerald-50 / dark: emerald-950
  internship  → sky-500      bg-sky-50     / dark: sky-950

Before (job):  bg-emerald-50 text-[#00401A] border-emerald-200
After  (job):  bg-amber-50 text-amber-800 border-amber-200
               dark:bg-amber-950/60 dark:text-amber-300
```

---

## 7. Animation Guidelines

### 7.1 Current Animation Inventory (9 Animations)

| Animation | Class | Trigger | Duration | Location |
|---|---|---|---|---|
| Fade + Slide Up | `.animate-fade-in-up` | Mount | 0.4s | Cards, empty state |
| FAB Float | `.animate-chatbot-float` | Idle | 2.8s ∞ | Floating chat button |
| Pulse Ring | `animate-ping` | Idle | 1s ∞ | FAB dot, navbar dot |
| Loading Spin | `animate-spin` | Loading | continuous | Loader2 icon |
| Typing Bounce | `animate-bounce` | AI typing | 1s ∞ | 3-dot indicator |
| Card Elevation | `.pak-card:hover` | Hover | 0.28s | Opportunity cards |
| Button Glow | `.btn-apply-glow:hover` | Hover | 0.2s | Apply Now |
| Icon Scale | `group-hover:scale-105` | Hover | 0.2s | Logo, stat icons |
| Image Zoom | `group-hover:scale-108` | Hover | 0.5s | SmallBanner images |

### 7.2 Current Keyframe Definitions

```css
/* 1. Fade In + Slide Up */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0);    }
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 2. Chatbot FAB Breathing Float */
@keyframes float-pulse {
  0%, 100% {
    transform: translateY(0px) scale(1);
    box-shadow: 0 10px 25px -3px rgba(0,64,26,0.4), 0 0 0 0 rgba(16,185,129,0.5);
  }
  50% {
    transform: translateY(-6px) scale(1.05);
    box-shadow: 0 20px 30px -5px rgba(0,64,26,0.5), 0 0 0 8px rgba(16,185,129,0);
  }
}
.animate-chatbot-float { animation: float-pulse 2.8s ease-in-out infinite; }

/* 3. Card Hover Elevation */
.pak-card { transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.pak-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px -8px rgba(0,64,26,0.14), 0 4px 12px -2px rgba(0,0,0,0.05);
}
.dark .pak-card:hover {
  box-shadow: 0 16px 32px -8px rgba(16,185,129,0.15), 0 4px 12px -2px rgba(0,0,0,0.4);
  border-color: #059669;
}

/* 4. Apply Button Physics */
.btn-apply-glow:hover  { box-shadow: 0 6px 18px 0 rgba(0,64,26,0.4); transform: translateY(-1.5px); }
.btn-apply-glow:active { transform: translateY(0.5px); }
```

### 7.3 Recommended New Animations

```css
/* 5. Staggered Card Grid Entrance */
@keyframes slideInCard {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1);       }
}
.card-stagger-1 { animation: slideInCard 0.4s 0.00s cubic-bezier(0.16,1,0.3,1) both; }
.card-stagger-2 { animation: slideInCard 0.4s 0.06s cubic-bezier(0.16,1,0.3,1) both; }
.card-stagger-3 { animation: slideInCard 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both; }
.card-stagger-4 { animation: slideInCard 0.4s 0.18s cubic-bezier(0.16,1,0.3,1) both; }

/* 6. Skeleton Shimmer Loading */
@keyframes shimmer {
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%);
  background-size: 2000px 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 0.5rem;
}
.dark .skeleton {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 2000px 100%;
}

/* 7. Category Tab Underline Slide */
@keyframes tabSlide {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
.tab-active-bar { animation: tabSlide 0.2s ease-out; transform-origin: left; }

/* 8. Modal Spring Entrance */
@keyframes modalSpringIn {
  from { opacity: 0; transform: scale(0.93) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0);       }
}
.modal-spring-in { animation: modalSpringIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }

/* 9. Toast Slide-in from Right */
@keyframes toastSlideIn {
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
.toast-slide-in { animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }

/* 10. Stat Reveal on Scroll */
@keyframes countReveal {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.stat-reveal { animation: countReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }

/* Accessibility — Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition-duration: 0.01ms !important; }
}
```

### 7.4 Animation Design Rules

| Category | Rule |
|---|---|
| Micro-interactions | 100–200ms — hover, click feedback |
| State transitions | 200–400ms — filter changes |
| Entrance animations | 300–500ms — cards, modals, toasts |
| Ambient idle loops | 2–4s — FAB float, pulse ring |
| Entry easing | `cubic-bezier(0.16, 1, 0.3, 1)` spring feel |
| Exit easing | `cubic-bezier(0.4, 0, 1, 1)` quick out |
| Hover easing | `cubic-bezier(0.4, 0, 0.2, 1)` standard |
| Grid stagger | Max 60ms delay between items |
| Properties | Transform + opacity ONLY — never layout props |
| Avoid | Width/height animation, abrupt jumps, >3 simultaneous |

---

## 8. Component Design Patterns

### 8.1 OpportunityCard Anatomy

```
┌─────────────────────────────────────────────┐
│  [Category Badge]          [New] / [Hot]    │  ← badge row
│  Opportunity Title (2 lines max)            │  ← H4 line-clamp-2
│  Issuing Organization Name                  │  ← muted, truncated
│                                             │
│  📍 Punjab, Pakistan                        │  ← location
│  💰 PKR 15,000/month                        │  ← dynamic highlight
│  📅 Closes in 3 days  (rose-600 urgent)    │  ← deadline
│  ─────────────────────────────────────────  │  ← divider
│  [ View Details ]       [ Apply Now → ]    │  ← actions
└─────────────────────────────────────────────┘
Hover: translateY(-4px) + shadow elevation + emerald border
```

### 8.2 Skeleton Loading Card

```
┌─────────────────────────────────────────────┐
│  [▓▓▓▓▓▓▓▓▓▓▓]      [▓▓▓▓▓]              │  ← badge skeleton
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]                 │  ← title skeleton
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]                         │  ← org skeleton
│  [▓▓▓▓▓▓]   [▓▓▓▓▓▓▓▓▓▓]                 │  ← meta rows
│  [▓▓▓▓]     [▓▓▓▓▓▓▓▓▓▓]                 │
│  ─────────────────────────────────────────  │
│  [▓▓▓▓▓▓▓▓]      [▓▓▓▓▓▓▓]               │  ← button skeletons
└─────────────────────────────────────────────┘
All shimmer with linear-gradient animation — zero layout shift
```

### 8.3 Enhanced Empty State

```
┌────────────────────────────────────────┐
│        [Search Icon — 48px]            │
│   No opportunities match your search  │
│   Try different keywords or filters   │
│   [ Clear Filters ]   [ Browse All ]  │
│   Quick: [Jobs]  [Scholarships]  [IT] │
└────────────────────────────────────────┘
```

---

## 9. Dialogue & Modal System

### 9.1 OpportunityDetailModal Anatomy

```
┌──────────────────────────────────────── [×] ─┐
│  ███████ PAKISTAN GREEN HEADER ████████      │
│  [Category Pill]  [✓ Verified Govt]          │
│  Opportunity Full Title (H3, white, bold)     │
│  [🏛 Organization]    [📍 Province]           │
├───────────────────────────────────────────────┤
│  [📄] About the Program                       │
│  ┌──────────────────────────────────────┐    │
│  │ Description text here...             │    │
│  └──────────────────────────────────────┘    │
│  [✦] Key Information                          │
│  ┌────────────────┐  ┌────────────────┐      │
│  │ Closing Date   │  │ Eligibility    │      │
│  │ May 31, 2026   │  │ Bachelor's+    │      │
│  └────────────────┘  └────────────────┘      │
│  ┌────────────────┐  ┌────────────────┐      │
│  │ Province       │  │ Stipend        │      │
│  │ Punjab         │  │ PKR 15,000/mo  │      │
│  └────────────────┘  └────────────────┘      │
│  [ℹ] Direct Application Gateway              │
│  ┌──────────────────────────────────────┐    │
│  │ Redirects to official portal.        │    │
│  │ Verify before submitting documents.  │    │
│  └──────────────────────────────────────┘    │
├───────────────────────────────────────────────┤
│  [← Back]   [🔗 Share]       [Apply Now →]   │
└───────────────────────────────────────────────┘
```

### 9.2 Modal Animation Lifecycle

```
User clicks "View Details"
        │
        ▼
setSelectedOpportunity(opportunity)
        │
        ▼
Backdrop: opacity 0 → 1  (200ms ease-in)
        │   [20ms stagger]
        ▼
Modal: scale(0.93) + Y12px → scale(1.0)  (300ms spring)
        │
Content visible: description, key info grid, notice
        │
User exits (× / Back / backdrop):
        │
        ▼
Modal scale-out: 1.0 → 0.93  (200ms)
Backdrop fade:   1 → 0       (200ms, simultaneous)
        │
        ▼
setSelectedOpportunity(null) — modal unmounts
```

### 9.3 Toast Patterns

```
Theme Switch (top-right, 2.5s auto-dismiss):
  ┌──────────────────────────────┐
  │  [☀] Switched to Light Mode  │  ← .toast-slide-in
  └──────────────────────────────┘

Link Copied (2s):
  ┌──────────────────────────────┐
  │  [✓] Link copied!            │
  └──────────────────────────────┘

Form Success (4s):
  ┌──────────────────────────────┐
  │  [✓] Opportunity submitted!  │
  │  Review within 48 hours.     │
  └──────────────────────────────┘
```

---

## 10. Screen-by-Screen Flowcharts

### 10.1 HomeScreen — Data & Render Flow

```
HomeScreen mounts
      │
      ├── useEffect #1 [once]: loadMetadata()
      │       ├── getProvinces()      ──► setProvinces([...])
      │       └── getCategoryStats()  ──► setCategoryStats([...])
      │
      └── useEffect #2 [deps: category, province, keyword, sortBy]
              │
              ├── setLoading(true)
              ├── getOpportunities(filters)
              │         │
              │         ▼
              │    FastAPI Backend
              │         ├── Redis HIT?  ──► JSON (< 5ms)
              │         └── Redis MISS? ──► MongoDB → cache → return
              │
              ├── setOpportunities(data)
              └── setLoading(false)

RENDER TREE:
  loading = true  ──► <LoadingState /> (skeleton cards)
  loading = false:
    length === 0  ──► <EmptyState />
    length > 0    ──► <OpportunityCard × N /> (staggered)
```

### 10.2 Filter & Sort Flow

```
User action            State change          Effect
──────────────────────────────────────────────────────
Type keyword      ──► setKeyword(v)        ]
Province select   ──► setSelectedProvince  ] useEffect #2
Category tab      ──► setSelectedCategory  ] re-fires →
Sort dropdown     ──► setSortBy(v)         ] fetchFiltered()

[Clear Filters]   ──► all states reset to defaults
```

### 10.3 ChatbotScreen — Message Flow

```
User types / clicks quick chip
        │
        ▼
handleSendMessage(query)
  ├── Push UserMessage to messages[]
  ├── Clear inputQuery
  └── setIsLoading(true)
        │
        ▼
POST /api/v1/chatbot/ask
        │
   ┌────┴────┐
SUCCESS    ERROR
   │           │
   ▼           ▼
Add BotMsg  Add ErrorMsg (bilingual)
+ related   
  opps[]
   │
   ▼
setIsLoading(false) + scrollToBottom()

[3-dot bounce indicator shown during loading]
```

### 10.4 Modal Lifecycle

```
Card click ──► onSelectOpportunity(opp)
              ──► App.jsx: setSelectedOpportunity(opp)
                                  │
                                  ▼
                    Modal renders (backdrop + spring-in)
                                  │
                   ┌──────────────┼──────────────┐
                   │              │               │
              [Apply Now]     [Share]        [× / Back]
                   │              │               │
                   ▼              ▼               ▼
             window.open()  clipboard +    setSelectedOpportunity(null)
             (new tab)      toast          modal unmounts
```

### 10.5 Dark/Light Mode Flow

```
Click toggle ──► setDarkMode(!darkMode) ──► useEffect
                        │
            ┌───────────┴───────────┐
           dark                    light
            │                      │
  classList.add('dark')   classList.remove('dark')
  localStorage 'dark'     localStorage 'light'
            │                      │
            └───────────┬──────────┘
                        │
             All dark: variants toggle
             200ms transition-colors blend
             Icon/label switch
             Toast notification (recommended)
```

### 10.6 Language Toggle Flow

```
Click Globe ──► setLang('ur' | 'en')
                        │
                        ▼
  const t = translations[lang]  [all strings resolve to new locale]
                        │
         ┌──────────────┴──────────────┐
        'ur'                          'en'
         │                             │
  body.classList.add('font-urdu')   body.classList.remove('font-urdu')
  document.lang = 'ur'              document.lang = 'en'
  .urdu-text → Noto Nastaliq        Standard LTR layout
  RTL direction active
```

---

## 11. User Interaction Flow

### 11.1 Primary Citizen Journey

```
ENTRY
  │
  ▼
[ Home Screen loads ]
  │
  ├── DisclaimerBanner: "Non-governmental aggregator"
  ├── Navbar: branding + theme + language controls
  ├── Hero: Urdu heading + search + province
  ├── Stats: 1250+ opps | 48+ depts | PKR 15B | Free
  ├── CategoryNav: All|Jobs|Scholarship|Loans|Training|Internship
  └── Opportunity Cards Grid

USER ACTIONS:
  ├── [A] Keyword search  ──► real-time filter
  ├── [B] Category tab    ──► category filter
  ├── [C] Province select ──► regional filter
  └── [D] Sort dropdown   ──► sorted results

Click Card ──► Modal Opens
  │
  ├── [Apply Now] ──► Official portal (new tab)
  └── [Close]     ──► Return to grid (state preserved)
```

### 11.2 Chatbot Journey

```
Floating Bot FAB (visible on Home + Submit)
        │
        ▼
Click FAB ──► currentScreen = 'chatbot' + scrollToTop()
        │
ChatbotScreen:
  Welcome message (EN or UR)
  Quick chips: [Laptop] [Scholarship] [Loans] [IT Certs]
        │
        ▼
User asks question ──► AI responds
        │
        └── Related opportunity cards ──► Click ──► Modal
```

---

## 12. Data Flow Architecture

### 12.1 Frontend → Backend API

```
React Component
      │
      ▼
opportunitiesService.js (Axios)
      │
      ▼
GET /api/v1/opportunities
    ?category=scholarship&province=Punjab&keyword=laptop&sortBy=closing_soon
      │
      ▼
FastAPI Route Handler
      │
      ├── Redis check (key = hash of params)
      │       HIT  ──► JSON (< 5ms)
      │       MISS ──► MongoDB query
      │
      ▼
MongoDB Atlas
  ├── Compound index: { category, province, closing_date }
  ├── Text index: { title, description, organization }
  └── Filter: status='active', closing_date >= today
      │
      ▼
Cache in Redis (TTL: 3600s) ──► return JSON
```

### 12.2 Scraper Pipeline

```
APScheduler Cron (Daily/Weekly per source)
      │
      ▼
Source scrapers:
  HEC    ── BeautifulSoup4 (static HTML)
  NJP    ── Selenium WebDriver (JS-rendered)
  BNIP   ── BeautifulSoup4
  SMEDA  ── BeautifulSoup4
  NAVTTC ── Selenium WebDriver
  Youth  ── BeautifulSoup4
      │
      ▼
Pydantic v2 Validation:
  ✓ apply_link: valid HTTPS
  ✓ closing_date: future date
  ✓ title: 10–300 chars
  ✓ No duplicate (hash check)
      │
      ▼
MongoDB upsert + Redis cache invalidate
      │
      ▼
Expiry Worker (hourly): closing_date < now → status='expired'
```

---

## 13. Responsive Design

### 13.1 Breakpoints

| Prefix | Width | Target |
|---|---|---|
| (default) | 0px | Mobile (320px–639px) |
| `sm:` | 640px | Large phone / tablet portrait |
| `md:` | 768px | Tablet landscape |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Wide desktop |

### 13.2 Grid Behavior

| Component | Mobile | sm | lg |
|---|---|---|---|
| OpportunityCard Grid | 1 col | 2 cols | 4 cols |
| SmallBanners | 1 col | 2 cols | 4 cols |
| CivicStatsDashboard | 2 cols (2×2) | 2 cols | 4 cols (1 row) |
| KeyInfoGrid (modal) | 1 col | 2 cols | 2 cols |

### 13.3 Navbar Responsive

```
Mobile (< 768px):
  [Logo]  ──────────────────  [🌙] [UR] [☰]
  Hamburger → slide-down drawer with nav links

Desktop (≥ 768px):
  [Logo + Title]  ── spacer ──  [Home] [Submit] [Chatbot]
  Theme + Lang in top official green strip
```

### 13.4 Hero Search Responsive

```
Mobile:   Stacked (each element full width)
Desktop:  Horizontal flex row
  [Search flex-1] [Province w-48] [Button auto]
```

---

## 14. UI Improvement Roadmap

### 14.1 High Priority

| # | Area | Issue | Fix |
|---|---|---|---|
| 1 | Dark/Light Toggle | Too subtle, unclear state | Pill toggle + always-visible label |
| 2 | Category Badges | All same emerald | Per-category semantic color system |
| 3 | Loading State | Basic spinner | Skeleton shimmer (match card layout) |
| 4 | Card Entrance | All at once | Staggered 60ms delay per card |
| 5 | Toast Feedback | No state feedback | Slide-in toasts for all actions |
| 6 | Modal Animation | Basic Tailwind | Custom spring-in scale + backdrop |
| 7 | Chatbot FAB | No tooltip | "Chat with AI Assistant" on hover |
| 8 | Empty State | Plain icon | Quick-link chips + better illustration |

### 14.2 Medium Priority

| # | Area | Enhancement |
|---|---|---|
| 9 | CategoryNav | Active tab underline slide animation |
| 10 | Stats Dashboard | Count-up animation on scroll into view |
| 11 | SmallBanners | Parallax image shift on hover |
| 12 | Search Input | Focus ring glow + icon animation |
| 13 | Apply Button | Ripple click effect |
| 14 | Cards | Bookmark/save icon top-right |

### 14.3 Future Enhancements

| # | Area | Description |
|---|---|---|
| 15 | Eligibility Quiz | Step wizard: age → education → province → match % |
| 16 | Live Countdown | "2 days 14 hours left" real-time deadline |
| 17 | Share Sheet | WhatsApp, Facebook, LinkedIn, Twitter |
| 18 | Mobile Filter | Full-screen filter drawer on mobile |
| 19 | Alert Banner | "5 new opportunities today!" slide-down |
| 20 | Onboarding Tour | First-visit feature highlight tooltips |

---

## Appendix A — CSS Variables

```css
:root {
  --green-primary:     #00401A;
  --green-hover:       #055825;
  --green-emerald:     #047857;
  --radius-card:       1rem;
  --radius-modal:      1.5rem;
  --radius-btn:        0.75rem;
  --shadow-card:       0 1px 3px rgba(0,0,0,0.05);
  --shadow-hover:      0 16px 32px -8px rgba(0,64,26,0.14);
  --shadow-modal:      0 25px 50px -12px rgba(0,0,0,0.25);
  --t-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
  --t-base:   200ms cubic-bezier(0.4, 0, 0.2, 1);
  --t-spring: 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Appendix B — Animation Quick Reference

| Type | Class | Effect |
|---|---|---|
| Entrance | `.animate-fade-in-up` | Fade + Y slide on mount |
| Entrance | `.card-stagger-1..4` | Staggered grid item slide |
| Entrance | `.modal-spring-in` | Modal spring scale + fade |
| Hover | `.pak-card` | Elevation lift |
| Hover | `.btn-apply-glow` | Shadow + Y lift |
| Idle | `.animate-chatbot-float` | FAB breathing loop |
| Idle | `animate-ping` | Live status dot pulse |
| Idle | `animate-bounce` | Chatbot typing dots |
| Loading | `animate-spin` | Spinner rotation |
| Loading | `.skeleton` | Shimmer loading state |
| Notification | `.toast-slide-in` | Slide from right |
| Theme | `transition-colors duration-200` | Dark/light blend |

---

*Single source of truth for all Citizen Portal UI/UX design decisions.*
*Reference this document before adding new components, animations, or color tokens.*
