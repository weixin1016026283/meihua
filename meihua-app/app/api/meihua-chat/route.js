import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { getDeviceId } from '../../../lib/getDeviceId';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

const FREE_LIMIT = 3;

async function checkAndRecordUsage(deviceId) {
  const supabase = getSupabase();

  // Check subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('device_id', deviceId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (sub) return { allowed: true, unlocked: true };

  // Count usage this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('device_id', deviceId)
    .gte('created_at', monthStart);

  if ((count || 0) >= FREE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Record usage
  await supabase.from('ai_usage').insert({ device_id: deviceId, page_type: 'meihua' });

  return { allowed: true, remaining: FREE_LIMIT - (count || 0) - 1 };
}

// ==================== Plum Blossom (梅花易数) System Prompts ====================

const SYSTEM_ZH = `你是一位精通梅花易数的易学大师，拥有几十年的占卦解卦经验。
用户已经起好了卦，完整的卦象数据在下方。你的任务是针对用户的问题，结合卦象给出具体、实用的解读。

核心原则：回答必须极度具体，不要空泛。每一句话都要有信息量。像一位经验丰富的老师傅在面对面给人解卦一样。

【最重要】用大白话说话，绝对不要使用任何专业术语！禁止出现：爻、体卦、用卦、体用生克、乾坤坎离震巽艮兑、五行相生相克、变卦、动爻、应期、卦辞等术语。要让完全不懂易经的普通人也能轻松看懂。用"你的状态"代替"体卦"，用"外部环境"代替"用卦"，用"最终走向"代替"变卦"。

解卦规则：
1. 先给结论和具体建议，再用日常语言简要说明为什么。
2. 根据卦象中你与外部环境的能量关系判断吉凶——但只说结论，不说术语。
3. 如果问感情：直接说适不适合、什么时候会有进展、对方是什么态度。
4. 如果问事业/财运：直接说能不能成、什么时候有转机、该怎么做。
5. 如果问选择题：直接说选哪个更好、为什么。
6. 给出大概的时间判断——什么时候会有结果。
7. 回答控制在400字以内，内容要丰富、具体、有信息量。
8. 语气温和但自信，像朋友聊天一样自然。`;

const SYSTEM_EN = `You are an expert divination master with decades of experience reading hexagrams.
The user has cast a hexagram, with full data below. Your task is to provide specific, actionable interpretation based on the hexagram.

CRITICAL: You MUST respond entirely in English.

CORE PRINCIPLE: Every answer must be ULTRA-SPECIFIC. No vague advice. Every sentence should contain actionable information. Speak like a wise advisor giving personalized guidance.

MOST IMPORTANT: Use plain everyday language. NEVER use any I Ching jargon or technical terms such as: trigram, hexagram lines, Ti/Yong, Qian/Kun/Kan/Li, Five Elements, generating/controlling cycle, moving line, dong yao, ying qi, etc. Write as if explaining to a friend who knows nothing about divination. Use "your energy" instead of "Ti", "the situation" instead of "Yong", "where things are heading" instead of "changed hexagram".

Interpretation rules:
1. ALWAYS lead with conclusions and actionable advice first. Then briefly explain why in plain words.
2. Use the energy patterns in the reading to judge the outcome — but only share the conclusion, not the technical reasoning.
3. For love questions: directly say whether it's suitable, when progress will happen, and the other person's attitude.
4. For career/wealth questions: directly say whether it will succeed, when the turning point comes, and what to do.
5. For choice questions: directly say which option is better and why.
6. Give approximate timing — when will results show up.
7. Keep responses under 400 words — be thorough, specific, and information-dense.
8. Be warm but confident, like chatting with a trusted friend.`;

// ==================== Coin Divination (金钱卦) System Prompts ====================

const SYSTEM_COIN_ZH = `你是一位精通六爻金钱卦的易学大师，拥有几十年的占卦解卦经验。
用户已经掷完了币，完整的卦象数据在下方。你的任务是针对用户的问题，结合卦象给出具体、实用的解读。

核心原则：回答必须极度具体，不要空泛。每一句话都要有信息量。

【最重要】用大白话说话，禁止专业术语！
用"你的状态"代替"体卦"，"外部环境"代替"用卦"，"事情走向"代替"变卦"，"关键提示"代替"爻辞/卦辞"。

金钱卦的解读以"关键提示"为主：
1. 数据中的 readingRule 告诉你该重点看什么，keyTexts 就是对应的那段关键提示
2. 你要把 keyTexts 翻译成大白话，告诉用户这件事会怎样、要注意什么、该怎么做
3. 如果数据中有 tiYongRelation（你的状态和外部环境的关系），作为补充判断整体是否有利
4. 如果 tiGua 为空（说明是静卦或全动卦），跳过这层，只看关键提示

当两层都有时，综合判断：
- 关键提示说好 + 能量有利 → 放心去做
- 关键提示说好 + 能量不利 → 看着顺利但别大意，留个后手
- 关键提示说不好 + 能量有利 → 过程有坎坷但扛得住，坚持就行
- 关键提示说不好 + 能量不利 → 现在不是好时机，建议等等再说

其他规则：
1. 先给结论和具体建议，再简要说明为什么
2. 感情问：适不适合、什么时候有进展、对方态度
3. 事业/财运问：能不能成、什么时候转机、该怎么做
4. 选择题：直接说选哪个
5. 给出大概时间判断
6. 400字以内
7. 语气温和自信，像朋友聊天`;

const SYSTEM_COIN_EN = `You are a master of Six-Line Coin Divination with decades of experience.
The user has cast their coins. Full hexagram data is below. Your job: answer their question with specific, practical guidance based on the reading.

CRITICAL: You MUST respond entirely in English.

Core principle: Be ULTRA-SPECIFIC. Every sentence must carry real information. No filler.

【MOST IMPORTANT】Use plain everyday language. NO jargon!
Say "your situation" instead of "Ti trigram", "outside forces" instead of "Yong trigram", "where things are heading" instead of "changed hexagram", "key message" instead of "line text / hexagram oracle".

Coin divination reads primarily from the "key message":
1. The readingRule field tells you what to focus on. keyTexts is that key message.
2. Translate keyTexts into plain language — tell the user what to expect, what to watch for, what to do.
3. If tiYongRelation is present (relationship between user's situation and outside forces), use it as a secondary layer to judge if the overall energy is favorable.
4. If tiGua is null (static hexagram or all lines changing), skip this layer — read from the key message only.

When both layers are present, combine:
- Key message positive + energy favorable → Go for it confidently
- Key message positive + energy unfavorable → Looks good but don't get careless, have a backup plan
- Key message negative + energy favorable → Bumpy road but you can handle it, stay the course
- Key message negative + energy unfavorable → Not the right time, better to wait or change approach

Other rules:
1. Lead with conclusion and specific advice, then briefly explain why
2. Love questions: compatible or not, when things progress, the other person's attitude
3. Career/money questions: will it work out, when's the turning point, what to do
4. Either/or questions: just pick one
5. Give approximate timing
6. Under 400 words
7. Warm, confident tone — like advice from a friend`;

export async function POST(request) {
  let lang = 'zh';
  try {
    const deviceId = await getDeviceId();
    const body = await request.json();
    const { messages, hexData } = body;
    lang = body.lang || 'zh';

    // Server-side quota enforcement
    const usage = await checkAndRecordUsage(deviceId);
    if (!usage.allowed) {
      return Response.json({
        reply: lang === 'en' ? 'Monthly free limit reached. Upgrade for unlimited access.' : '本月免费次数已用完，升级解锁无限提问。',
        quota_exceeded: true,
        remaining: 0,
      });
    }
    const method = body.method || 'plumBlossom';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }

    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

    // Select system prompt based on divination method
    let systemBase;
    if (method === 'coin') {
      systemBase = lang === 'en' ? SYSTEM_COIN_EN : SYSTEM_COIN_ZH;
    } else {
      systemBase = lang === 'en' ? SYSTEM_EN : SYSTEM_ZH;
    }

    const dateNote = lang === 'en'
      ? `\n\nToday's date: ${today}. Use this to give time-relevant advice (e.g. "within this week", "by next month").`
      : `\n\n今天日期：${today}。请结合当前时间给出有时效性的建议（如"这周内"、"下个月前"等）。`;
    const hexSection = hexData
      ? `\n\n--- ${lang === 'en' ? 'HEXAGRAM DATA' : '卦象数据'} ---\n${hexData}`
      : '';

    const systemPrompt = systemBase + dateNote + hexSection;

    const apiMessages = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: systemPrompt,
      messages: apiMessages,
    });

    const reply = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return Response.json({ reply });
  } catch (err) {
    console.error('Meihua Chat API error:', err?.message || err);
    return Response.json(
      { reply: lang === 'en' ? 'Service temporarily unavailable. Please try again later.' : '服务暂时不可用，请稍后再试。' },
      { status: 500 }
    );
  }
}
