# Meihua-i18n Project — Complete Documentation

## Overview
A bilingual (Chinese/English) divination web app with two main features:
1. **梅花易数 (Plum Blossom Divination)** — Number-based hexagram divination with AI interpretation
2. **紫微斗数 (Zi Wei Dou Shu)** — Birth chart destiny reading with AI consultation

**Tech Stack**: Next.js 14 (App Router) / React 18 / Supabase / Stripe / Anthropic Claude API
**Deployment**: Vercel (auto-deploy on push to `main`)
**Repo**: `github.com:weixin1016026283/meihua.git`

---

## File Structure

### Frontend Pages

#### `meihua-app/app/page.js` (~11,850 lines)
Main 梅花易数 divination page. Contains everything in one file:
- **i18n**: `i18n` object (zh/en) with all UI text, hexagram names, trigram data
- **Hexagram data**: All 64 hexagrams with Chinese names, meanings, English translations, oracles, commentaries
- **Trigram data**: 8 trigrams with elements, directions, body parts, meanings
- **Ti/Yong logic**: Determines which trigram is Ti (self) vs Yong (other) based on moving line position
- **Core algorithm** (`calc()` function, line ~8368):
  - User inputs: question + number (2-10 digits)
  - Splits digits in half, sums each half for upper/lower trigram numbers
  - Adds current shichen (時辰, 2-hour Chinese time block) for moving line
  - Calculates primary hexagram, changed hexagram, Ti/Yong relationship
- **Auto AI Reading** (`triggerAutoAiReading`, line ~8327):
  - Triggered automatically after divination
  - Calls `/api/meihua-chat` with hexagram data + user's question
  - Result displayed in dark gradient card at top of results
  - No timeout — waits for API to complete naturally
  - On network error, silently falls back to rule-based reading
- **Dual-card result UI**:
  - Dark AI card on top with: AI reply → inline input box + send button → 3 quick suggestion buttons → subscribe prompt
  - White hexagram analysis card below with rule-based `specificAdvice`
- **AI Chat Panel** (fixed bottom bar):
  - Collapsed: "继续追问AI大师" / "Ask AI a Follow-up Question"
  - Expanded: Full chat interface with history, examples, input
  - Past sessions shown in collapsible accordion
- **Free quota**: 3 per month, shared key `ai_count_${year}-${month}` in localStorage
- **Subscription**: Checked via `ai_unlocked` localStorage key (timestamp-based expiry)
- **State variables** (key ones):
  - `result` — computed divination result (hexagrams, trigrams, Ti/Yong, fortune)
  - `autoAiReply` / `autoAiLoading` — auto AI reading state
  - `aiMsgs` / `aiOpen` / `aiInput` — chat panel state
  - `aiUnlocked` / `aiRemaining` — subscription & quota state
  - `mode` — null (home) or 'meihua' (divination page)
  - `lang` — 'en' (default) or 'zh'

#### `meihua-app/app/mingpan/page.js` (~2,480 lines)
紫微斗数 destiny chart page:
- **i18n**: `TX` object (zh/en) with all UI text
- **Translation maps**: PALACE_EN, STAR_EN, MINOR_STAR_EN, BRIGHT_EN, MUTAGEN_EN, etc.
- **Birth cities** (`CITIES` array, ~150 entries):
  - Format: `[name_zh, name_en, longitude, utc_std, hasDST, region]`
  - Regions: us (50 states covered), cn (35 cities), in (25 Indian cities), ca, eu, as, oc, la, af
  - `CITY_COUNTRY` lookup for multi-country regions (50+ countries)
  - Search matches city name, region label, AND country name
  - English mode: no Chinese characters shown
- **REGION_LABELS / REGION_ORDER**: `['us','cn','in','ca','eu','as','oc','la','af']`
- **Birth hours**:
  - Chinese: 子时 (23-1), 丑时 (1-3), etc.
  - English: 11pm - 1am, 1am - 3am, etc. (plain format, no jargon)
- **True Solar Time** (`calcTrueSolarTime`): Adjusts birth hour based on longitude vs standard meridian
- **Chart generation**: Uses `iztro` library (always `'zh-CN'` locale), EN via lookup maps
- **Life reading** (`generateLifeReading`): Multi-section analysis with K-line scoring
- **Annual reading** (`generateAnnualReading`): Current/next year fortune analysis
- **Formations** (`detectFormations`): Detects classical patterns (禄马交驰, 日月并明, etc.)
- **K-Line chart**: SVG-based life trajectory visualization
- **AI Chat Panel**: Same pattern as meihua, fixed bottom bar
- **Star interpretation** (`SI` object): All 14 main stars with 5-dimension readings
- **Input UI**: Birthday (date picker) + Birth Hour (select) + Birthplace (searchable dropdown) + DST checkbox + Gender

### API Routes (all in `meihua-app/app/api/`)

| Route | Method | Description | Dependencies |
|-------|--------|-------------|--------------|
| `/api/meihua-chat` | POST | AI chat for 梅花 divination | Anthropic (`claude-sonnet-4-6`) |
| `/api/chat` | POST | AI chat for 紫微 chart | Anthropic (`claude-sonnet-4-6`) |
| `/api/checkout` | POST | Creates Stripe checkout session | Stripe |
| `/api/cancel-subscription` | POST | Cancels Stripe subscription | Stripe + Supabase |
| `/api/subscription` | GET/POST | Check/record subscription status | Stripe + Supabase |
| `/api/chat-history` | GET/POST | Load/save chat messages | Supabase |
| `/api/save-reading` | POST | Save divination/chart readings | Supabase |
| `/api/log-question` | POST | Log user questions | Supabase |
| `/api/flags` | GET | Feature flags | Supabase |

#### AI Chat Routes Details

**`/api/meihua-chat/route.js`** (90 lines):
- Model: `claude-sonnet-4-6`, max_tokens: 1200
- System prompt (zh/en) bans all I Ching jargon (爻, 体卦, 用卦, 乾坤, etc.)
- Injects current date for time-relevant advice
- Receives: `{ messages, hexData, lang }`

**`/api/chat/route.js`** (92 lines):
- Model: `claude-sonnet-4-6`, max_tokens: 1500
- System prompt (zh/en) bans all astrology jargon (化禄, 化忌, 大限, star names, etc.)
- Injects current date for time-relevant advice
- Receives: `{ messages, chartData, lang }`

### Supabase Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `readings` | session_id, type, input_data, result_data, lang | Store divination & chart results |
| `chat_history` | session_id, page_type, role, content | Store AI chat messages |
| `subscriptions` | stripe_session_id, stripe_customer_id, status, plan, expires_at | Track paid subscriptions |
| `questions` | (pre-existing) | Log user questions |

- Connection: Supabase JS client with `SUPABASE_SERVICE_ROLE_KEY`
- Region: `us-west-2` (Session Pooler)

### Environment Variables (on Vercel)
- `ANTHROPIC_API_KEY` — Claude API key
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `STRIPE_SECRET_KEY` — Stripe live secret key
- `STRIPE_SUBSCRIPTION_PRICE_ID` — Stripe price ID ($4.99/mo, immutable)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key

### Dependencies (`package.json`)
- `next`: 14 (App Router)
- `react` / `react-dom`: ^18
- `@anthropic-ai/sdk`: ^0.78.0
- `@supabase/supabase-js`: ^2.97.0
- `iztro`: ^2.5.7 (紫微斗数 chart engine)
- `stripe`: ^20.3.1
- `pg`: ^8.19.0 (PostgreSQL, used for initial table creation)

---

## Key Data Flow

### Meihua Divination Flow
1. User enters question + number → `calc()` computes hexagrams
2. Auto AI reading triggers → calls `/api/meihua-chat` → displays in dark card
3. Rule-based analysis renders in white card below
4. User can ask follow-up via inline input in AI card or bottom chat panel
5. Reading saved to Supabase via `/api/save-reading`

### Mingpan Chart Flow
1. User enters birthday + hour + city + gender → `doChart()` generates chart via `iztro`
2. True Solar Time adjustment applied based on city longitude
3. Life reading + annual reading + K-line generated
4. User can consult AI via bottom chat panel
5. Reading saved to Supabase

### Subscription Flow
1. User clicks subscribe → `/api/checkout` creates Stripe session → redirect
2. On return, `stripe_session_id` saved to localStorage
3. `/api/subscription` POST records in Supabase
4. `/api/subscription` GET verifies status (checks Supabase first, falls back to Stripe)
5. `ai_unlocked` localStorage key stores expiry timestamp
6. Shared across both pages

### Free Quota System
- Key: `ai_count_${year}-${month}` in localStorage
- 3 free AI interactions per month (shared across meihua + mingpan)
- Each auto AI reading counts as 1 use
- Each manual chat message counts as 1 use
- Resets monthly

---

## Recent Commit History (latest first)
```
249074a Add follow-up input box in AI card and revert model to sonnet
a9bfe2f Add question tip: silently repeat 3 times before divining
91ca930 Inject current date into all AI prompts for time-relevant advice
1500e50 Change free AI quota from 3/day to 3/month
4708595 Fix date/hour input overflow with box-sizing: border-box
8fc1beb Add country search support and expand global city coverage
578de37 Remove jargon from AI prompts, improve birth hour/city UX
05e2e35 Add auto AI reading to meihua core results
5a60dfe Save divination and chart readings to Supabase
ea86210 Add Supabase integration for chat history, subscriptions, and readings
4dc523b Unify subscription price to $4.99/mo across both pages
5c278a5 Make English the default language and fix all English display issues
c55c176 Add cancel subscription feature with Stripe API
```

---

## Important Notes & Gotchas
- **NEVER change AI model or prompts without asking user first**
- **Stripe price is immutable**: The $4.99/mo price ID cannot be changed once used. To change price, must create new Price object in Stripe.
- **iztro always zh-CN**: Chart engine only works with Chinese locale. English is achieved via lookup maps (STAR_EN, PALACE_EN, etc.)
- **No user accounts**: Subscription tied to device/browser via localStorage. No login system.
- **Supabase writes are fire-and-forget**: Frontend saves to Supabase in background, doesn't block UI.
- **Both pages in single files**: page.js (~11850 lines) and mingpan/page.js (~2480 lines) contain all logic, UI, and data in monolithic files.
- **CSS is all inline styles**: No CSS files, all styling via React `style` props.
- **All AI outputs must use plain language**: No professional divination/astrology terminology visible to users.
