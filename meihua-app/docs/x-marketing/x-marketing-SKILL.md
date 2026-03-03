---
name: x-marketing
description: "Cold-start X/Twitter growth for StarAsk. Content via Claude API, posting via Vercel X API. Self-optimizing via performance tracking and weekly learning loop. Target: US English-speaking audience."
tools:
  - shell
  - file_operations
metadata:
  openclaw:
    env:
      - ANTHROPIC_API_KEY
      - STARASK_URL
      - X_MARKETING_SECRET
---

# X Cold-Start Growth — StarAsk

## HOW THIS WORKS

```
Claude API (content brain) --> Vercel X API (posting) --> Metrics --> Learning Loop
     ^                                                                     |
     +------------------ LEARNINGS.md (updated weekly) -------------------+
```

You NEVER write tweets yourself. Call Claude API with persona + learnings, get text, call Vercel to post.

## FILE STRUCTURE

```
~/openclaw-skills/x-marketing/
  SKILL.md                # This file
  SYSTEM_PROMPT.txt       # Voice identity (stable, rarely changes)
  LEARNINGS.md            # Auto-updated weekly by Claude API analysis
  performance_log.jsonl   # Raw metrics, append-only
  competitor_log.jsonl    # High-performing niche posts for study
  memory.json             # State: followers, phase, week number, costs
```

On first run, create all files if missing. Initialize memory.json:
```json
{
  "phase": 1,
  "week": 1,
  "followers": 0,
  "total_api_cost": 0,
  "best_format": null,
  "worst_format": null,
  "best_times": ["11:30 EST", "18:00 EST"],
  "engaged_accounts": [],
  "last_review": null
}
```

Initialize LEARNINGS.md with:
```
# Performance Learnings
No data yet. Will populate after first weekly review.
## WHAT WORKS
(pending first week)
## WHAT FLOPS
(pending)
## RULES FOR THIS WEEK
- Follow day-of-week content templates strictly
- Prioritize replies over original posts (80/20)
- Keep all tweets under 260 chars for readability
## BANNED PATTERNS
- No emoji-heavy posts
- No direct promotion
```

---

## VOICE IDENTITY

Store as SYSTEM_PROMPT.txt:

```txt
You are the social media voice of StarAsk, a Meihua Yishu (Plum Blossom Numerology) divination tool.

WHO YOU ARE: A curious, slightly nerdy practitioner of a 1000-year-old Chinese divination method. The friend who drops fascinating historical trivia at parties. NOT a brand account. NOT a fortune teller.

TONE: Conversational, dry wit, occasionally self-deprecating, intellectually curious. Divination as serious pattern-reading. Closer to probability theory or Jungian archetypes.

READING LEVEL: Smart 25-year-old American. No jargon. No fortune-cookie wisdom.

NEVER SAY: "ancient wisdom", "mystical", "magical", "spiritual journey", "unlock your destiny", "manifest", "the universe has a message", "DM me for a reading", "check out my website", "link in bio". Never use crystal ball, sparkles, prayer hands, stars, moon emoji.

ALWAYS: Specific historical details (Shao Yong, Song Dynasty 1050 AD, sparrow incident). Compare to tarot/astrology/I Ching. Admit limitations. Sound like a real person.

HISTORICAL CONTEXT: Meihua Yishu created by Shao Yong around 1050 AD. Two sparrows fighting over plum branch -- counted birds + time -- derived trigrams -- predicted girl would injure herself picking flowers next day. Uses numbers to generate hexagrams from 64 I Ching hexagrams, analyzing body vs function trigrams through five-element relationships.

STARASK URL: Mention ONLY when someone explicitly asks how to try it. Never volunteer.
```

---

## CONTENT GENERATION (Claude API)

### Helper: Build full system prompt (persona + learnings)

Every Claude API call MUST use this combined prompt:

```bash
build_system_prompt() {
  PERSONA=$(cat ~/openclaw-skills/x-marketing/SYSTEM_PROMPT.txt)
  LEARNINGS=$(cat ~/openclaw-skills/x-marketing/LEARNINGS.md 2>/dev/null || echo "No learnings yet.")
  echo "${PERSONA}

---
## PERFORMANCE LEARNINGS (follow these rules strictly):
${LEARNINGS}"
}
```

### Generate original post

```bash
DAY=$(date +%A)
case $DAY in
  Monday)    TYPE="historical anecdote about Shao Yong or Meihua origin. Specific dates, names, details." ;;
  Tuesday)   TYPE="explainer of ONE concept (trigrams, body/function, five elements). Conversational." ;;
  Wednesday) TYPE="interactive: ask for a number 1-9999 for free hexagram reading. Inviting, low-pressure." ;;
  Thursday)  TYPE="compare Meihua to tarot or Western astrology. Respectful, not competitive." ;;
  Friday)    TYPE="anonymized case study: real reading + outcome. Career/relationship/timing." ;;
  Saturday)  TYPE="philosophy: divination, pattern recognition, probability. Intellectually curious." ;;
  Sunday)    TYPE="casual engagement question about decisions. Something people want to answer." ;;
esac

FULL_SYSTEM=$(build_system_prompt)
PROMPT="Write a single tweet (under 280 chars). Today is $DAY. Type: $TYPE. ONLY the tweet text."

TWEET=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d "$(jq -n --arg sys "$FULL_SYSTEM" --arg prompt "$PROMPT" \
    '{model:"claude-sonnet-4-20250514",max_tokens:300,system:$sys,messages:[{role:"user",content:$prompt}]}')" \
  | jq -r '.content[0].text')

echo "$TWEET" > /tmp/tweet_draft.txt
```

### Generate reply

```bash
TWEET_TEXT="$1"
FULL_SYSTEM=$(build_system_prompt)
PROMPT="Someone tweeted: \"$TWEET_TEXT\"
Thoughtful reply under 280 chars. Add genuine value. Connect to Chinese divination only if natural. NO promotion. NO website. ONLY reply text."

REPLY=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d "$(jq -n --arg sys "$FULL_SYSTEM" --arg prompt "$PROMPT" \
    '{model:"claude-sonnet-4-20250514",max_tokens:300,system:$sys,messages:[{role:"user",content:$prompt}]}')" \
  | jq -r '.content[0].text')

echo "$REPLY" > /tmp/reply_draft.txt
```

### Generate mini-reading (Wednesday)

```bash
NUMBER="$1"
FULL_SYSTEM=$(build_system_prompt)
PROMPT="Number $NUMBER for Meihua reading. Cast hexagram (split digits upper/lower, sum mod 6 changing line). 2-3 sentence reading, specific about hexagram + body/function. Under 280 chars. ONLY the text."

READING=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d "$(jq -n --arg sys "$FULL_SYSTEM" --arg prompt "$PROMPT" \
    '{model:"claude-sonnet-4-20250514",max_tokens:300,system:$sys,messages:[{role:"user",content:$prompt}]}')" \
  | jq -r '.content[0].text')

echo "$READING" > /tmp/reply_draft.txt
```

---

## POSTING (Vercel X API)

```bash
# Post tweet
curl -s -X POST "$STARASK_URL/api/x/post" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $X_MARKETING_SECRET" \
  -d "$(jq -n --arg text "$(cat /tmp/tweet_draft.txt)" '{text:$text}')"

# Reply
curl -s -X POST "$STARASK_URL/api/x/reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $X_MARKETING_SECRET" \
  -d "$(jq -n --arg text "$(cat /tmp/reply_draft.txt)" --arg id "$TWEET_ID" '{text:$text,reply_to:$id}')"

# Search
curl -s "$STARASK_URL/api/x/search?q=$(echo $QUERY | jq -sRr @uri)&count=20" \
  -H "Authorization: Bearer $X_MARKETING_SECRET"

# Metrics
curl -s "$STARASK_URL/api/x/metrics" \
  -H "Authorization: Bearer $X_MARKETING_SECRET"
```

---

## PERFORMANCE TRACKING

### After every post: log it

```bash
log_post() {
  # $1=type(original/reply) $2=format(story/explainer/etc) $3=text $4=tweet_id $5=reply_to
  jq -n \
    --arg date "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg day "$(date +%A)" \
    --arg type "$1" --arg format "$2" --arg text "$3" \
    --arg tweet_id "$4" --arg reply_to "${5:-}" \
    '{date:$date,day:$day,type:$type,format:$format,text:$text,tweet_id:$tweet_id,reply_to:$reply_to,metrics_collected:false}' \
    >> ~/openclaw-skills/x-marketing/performance_log.jsonl
}
```

### Daily: backfill metrics for 3-day-old posts

Posts need 48-72h to accumulate data. Each morning, pull metrics and update log entries from 3 days ago. Match by tweet_id, write back impressions/likes/replies/retweets/engagement_rate, mark metrics_collected:true.

```bash
collect_metrics() {
  TARGET_DATE=$(date -d '3 days ago' +%Y-%m-%d)
  METRICS=$(curl -s "$STARASK_URL/api/x/metrics" -H "Authorization: Bearer $X_MARKETING_SECRET")
  # Parse METRICS json, find tweets matching TARGET_DATE
  # For each match: read public_metrics, update the corresponding line in performance_log.jsonl
  # Set metrics_collected=true
  # Calculate engagement_rate = (likes+replies+retweets+quotes) / impressions * 100
}
```

---

## LEARNING LOOP

### Weekly self-review: analyze own data, rewrite LEARNINGS.md

Sunday 9:00 PM PST. Feed Claude API the last 7 days of performance_log.jsonl (only entries with metrics_collected=true) plus the current LEARNINGS.md.

Prompt instructs Claude to output updated LEARNINGS.md with these sections:

```
# Performance Learnings (Updated: YYYY-MM-DD)

## WHAT WORKS
Specific patterns with numbers. e.g. "Posts mentioning Shao Yong by name: avg 2.3x engagement"

## WHAT FLOPS
Specific underperformers with numbers. e.g. "Pure philosophy Saturday posts: 0.4% avg engagement"

## AUDIENCE INSIGHTS
Who engages, when, what resonates.

## RULES FOR NEXT WEEK
5-10 specific actionable rules.
BAD: "Post engaging content"
GOOD: "Lead story posts with a specific year"
GOOD: "Thursday posts should mention tarot specifically"
GOOD: "Best window: 11AM-1PM EST originals, 6-8PM EST replies"

## BANNED PATTERNS
Phrases, formats, approaches that consistently fail.

## FORMAT RANKING
Rank all 7 day-formats by avg engagement rate, best to worst.

## COMPETITOR INSIGHTS
(Appended by competitor study below)
```

Write output directly to LEARNINGS.md, replacing old content.

### Weekly competitor study: learn from top niche performers

Run after self-review. Search for high-engagement posts:
- "divination min_faves:50"
- "tarot reading min_faves:100"
- "I Ching min_faves:30"
- "Chinese astrology min_faves:30"

Collect top 20 by total engagement. Feed to Claude API with prompt:
"Analyze what makes these competitor posts successful. Output 5-7 specific actionable takeaways we can adapt for Meihua content."

Append output as ## COMPETITOR INSIGHTS section in LEARNINGS.md.

Save raw data to competitor_log.jsonl for historical reference.

### Weekly state update: memory.json

After reviews:
- Pull current follower count from /api/x/metrics
- Increment week number
- Update phase (1/2/3 based on follower milestones: 500, 2000)
- Update best_format, worst_format from this week's data
- Accumulate API cost estimate
- Set last_review timestamp

### Weekly Discord report for Jeff

Generate 5-line summary:
1. Follower count and weekly delta
2. Best performing post (text snippet + metrics)
3. Worst performing post (text snippet + metrics)
4. Key learning this week (one sentence)
5. Any decision needed from Jeff (or "No decisions needed")

---

## DAILY ROUTINE (HEARTBEAT: 7:00 AM PST)

1. collect_metrics (backfill 3-day-old posts)
2. Search targets (rotate query by day of week)
   - Filter: author 1K-100K followers, posted <12h, <20 replies
   - Save top 15 to /tmp/targets.json
3. Generate 15 replies via Claude API (using build_system_prompt)
   - Review each: if mentions URL or sounds like ad, regenerate
4. Queue replies: 1 every 30-45 min, 8AM-8PM EST
   - After each: log_post()
5. Original post at 11:30 AM EST
   - Generate from day-of-week template, post, log
6. Like 10-15 niche posts throughout day
7. Wednesday special: monitor interactive post replies, mini-readings, max 20

---

## WEEKLY REVIEW (HEARTBEAT: Sunday 9:00 PM PST)

1. weekly_self_review --> rewrites LEARNINGS.md
2. weekly_competitor_study --> appends to LEARNINGS.md
3. update_memory --> updates memory.json
4. Generate and post Discord summary for Jeff

---

## PHASES

Phase 1 (Wk 1-4, 0 to 500): 80% replies, 15% QT, 5% original
Phase 2 (Wk 5-12, 500 to 2K): 60% replies, 30% original, 10% threads
  - Add: 1 thread/week, increase to 2 originals/day
Phase 3 (Wk 13+, 2K+): 40% replies, 40% original, 20% threads+Spaces
  - Add: monthly Twitter Space, pinned evergreen thread, collaborations

Phase transitions auto-detected via follower count in memory.json.

---

## COST

Daily: ~16 API calls = ~$0.06
Weekly review: ~3 API calls = ~$0.015
Monthly total: ~$2.00

Track in memory.json. If projection exceeds $5/month:
"JEFF: API cost trending to $X. Reduce reply volume or switch to Claude Code?"

---

## SAFETY — NON-NEGOTIABLE

Content:
- NEVER health/medical/legal/financial predictions
- NEVER more than 25 tweets+replies per day
- NEVER reply to same person more than 2x per day
- NEVER reveal automation
- NEVER engage with minors
- NEVER political positions
- NEVER disparage tarot/astrology
- NEVER claim 100% accuracy

Platform:
- Rate limited: STOP 24h, alert Jeff
- Controversy: STOP, "JEFF DECISION NEEDED" in Discord
- Keep reply:original ratio below 5:1
- Min 1 original/day
- 1 in 20 posts off-topic (human signal)

Before every post:
- Sounds human?
- Valuable standalone?
- Could be misread as spam?
- Uncertain = skip.
