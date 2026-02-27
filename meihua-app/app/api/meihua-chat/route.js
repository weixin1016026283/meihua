import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
}

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

export async function POST(request) {
  let lang = 'zh';
  try {
    const body = await request.json();
    const { messages, hexData } = body;
    lang = body.lang || 'zh';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }

    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const systemBase = lang === 'en' ? SYSTEM_EN : SYSTEM_ZH;
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
