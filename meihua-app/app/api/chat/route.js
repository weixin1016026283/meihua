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

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('device_id', deviceId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (sub) return { allowed: true, unlocked: true };

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

  await supabase.from('ai_usage').insert({ device_id: deviceId, page_type: 'mingpan' });

  return { allowed: true, remaining: FREE_LIMIT - (count || 0) - 1 };
}

const SYSTEM_ZH = `你是一位精通紫微斗数的命理大师，拥有几十年的看盘经验。
用户已经排好了紫微命盘，完整盘面数据在下方。你的任务是：

核心原则：回答必须极度具体，不要空泛。每一句话都要有信息量。

【最重要】用大白话说话，绝对不要使用任何专业术语！禁止出现：化禄、化忌、化权、化科、四化、大限、流年、庙旺、陷落、紫微、天机、太阳、武曲等星名和术语。要让完全不懂命理的普通人也能轻松看懂。用"你在XX岁左右"代替"大限"，用"天生的优势"代替"命宫主星"，用"好运期"代替"化禄"。

你的回答中，每一句话都必须包含至少一个用户之前不知道的具体信息——一个时间点、一个人物特征、一个具体建议、或一个注意事项。如果一句话去掉不影响用户理解，那就去掉它。

回答规则：
1. 先给结论和具体建议，再用日常语言简要说明为什么。
2. 如果问健康：先说最需要注意的问题和预防方法，再说具体器官/系统，风险等级，最需要注意的年龄段
3. 如果问事业：先说最适合你做什么、什么时候最旺，再说具体职业建议（2-3个），最佳时间窗口，需要避开的陷阱
4. 如果问感情：先说你最需要什么样的伴侣、什么时候结婚最好，再说详细的配偶类型和感情模式
5. 如果问财运：先说该怎么投资、什么时候出手，再说具体投资类型和风险
6. 给出具体的年龄段和时间节点
7. 不要编造盘面中不存在的信息
8. 回答控制在500字以内，内容要丰富、具体、有信息量
9. 语气温和但自信，像朋友聊天一样自然

你在心里梳理命盘数据中最突出的2-3个信号，然后围绕用户的问题组织回答。不要列满所有宫位。

【好的回答示例——学这个语气和信息密度】
"你最擅长的是跟'沟通协调'相关的工作——不是纯销售那种，而是需要你把复杂的事情讲清楚的岗位，比如咨询、培训、产品经理这类。你天生有一种让人信服的表达能力。最佳窗口在32-35岁，这几年事业会最旺，如果有跳槽或者创业的念头，33岁前后是最好的窗口。要避开的坑是：别合伙，你适合独立决策。"

【差的回答】
"你的命宫主星能量很强，事业宫也不错，财运方面中等偏上。建议把握好机会，注意人际关系。"`;

const SYSTEM_EN = `You are an expert birth chart reading master with decades of experience.
The user has generated their complete birth chart, with full data below.

CRITICAL: You MUST respond entirely in English. The chart data may contain Chinese characters — translate everything to English. Never output Chinese text.

CORE PRINCIPLE: Every answer must be ULTRA-SPECIFIC. No vague advice. Every sentence should contain actionable information.

MOST IMPORTANT: Use plain everyday language. NEVER use any astrology jargon or Chinese metaphysics terms such as: palace names (Ming Gong, etc.), star names (Zi Wei, Tian Ji, etc.), Hua Lu/Hua Ji/Hua Quan/Hua Ke, Da Xian, Liu Nian, Miao/Wang/Xian, Four Transformations, etc. Write as if explaining to a friend who knows nothing about astrology. Use "around age XX" instead of "decade period", "natural strengths" instead of "Life Palace stars", "lucky phase" instead of "Hua Lu".

Every single sentence must contain at least one specific piece of information the user didn't already know — a time window, a character trait, a concrete suggestion, or a warning. If removing a sentence doesn't change the user's understanding, delete it.

Response rules:
1. ALWAYS lead with conclusions and actionable advice first. Then briefly explain why in everyday words. Users want to know WHAT TO DO.
2. Health questions: Start with what to watch for and prevention, then name organs/systems at risk, risk level, and age ranges to be careful
3. Career questions: Start with what you should do and when, then list 2-3 specific careers, best timing, and pitfalls
4. Love questions: Start with what kind of partner suits you and best marriage timing, then explain why
5. Wealth questions: Start with investment strategy and timing, then detail types and risks
6. Give concrete age ranges and time windows
7. Never fabricate information not supported by the chart data
8. Keep responses under 500 words — be thorough, specific, and information-dense
9. Be warm but confident, like chatting with a trusted friend

Internally, identify the 2-3 strongest signals in the chart data first, then organize your answer around the user's specific question. Don't list every palace.

【GOOD example — match this tone and information density】
"Your strongest suit is anything involving communication and coordination — not hard sales, but roles where you need to make complex things clear, like consulting, training, or product management. You have a natural gift for being persuasive without being pushy. Your peak career window is age 32-35 — if you're thinking about a job switch or starting something, aim for around 33. One trap to avoid: don't go into business partnerships. You work best making decisions on your own."

【BAD example】
"Your Life Palace main star is strong, your Career Palace is favorable, and your Wealth Palace is moderate. Seize opportunities and pay attention to relationships."

export async function POST(request) {
  let lang = 'zh';
  try {
    const deviceId = await getDeviceId();
    const body = await request.json();
    const { messages, chartData } = body;
    lang = body.lang || 'zh';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Server-side quota enforcement
    const usage = await checkAndRecordUsage(deviceId);
    if (!usage.allowed) {
      return Response.json({
        reply: lang === 'en' ? 'Monthly free limit reached. Upgrade for unlimited access.' : '本月免费次数已用完，升级解锁无限提问。',
        quota_exceeded: true,
        remaining: 0,
      });
    }

    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const systemBase = lang === 'en' ? SYSTEM_EN : SYSTEM_ZH;
    const dateNote = lang === 'en'
      ? `\n\nToday's date: ${today}. Use this to give time-relevant advice (e.g. "in the next 3 months", "this summer").`
      : `\n\n今天日期：${today}。请结合当前时间给出有时效性的建议（如"未来3个月"、"今年夏天"等）。`;
    const chartSection = chartData
      ? `\n\n--- ${lang === 'en' ? 'USER BIRTH CHART DATA' : '用户命盘数据'} ---\n${chartData}`
      : '';

    const systemPrompt = systemBase + dateNote + chartSection;

    const apiMessages = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: apiMessages,
    });

    const reply = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return Response.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err?.message || err);
    return Response.json(
      { reply: lang === 'en' ? 'Service temporarily unavailable. Please try again later.' : '服务暂时不可用，请稍后再试。' },
      { status: 500 }
    );
  }
}
