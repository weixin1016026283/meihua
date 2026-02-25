import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
}

const SYSTEM_ZH = `你是一位精通梅花易数的易学大师，拥有几十年的占卦解卦经验。
用户已经起好了卦，完整的卦象数据在下方。你的任务是针对用户的问题，结合卦象给出具体、实用的解读。

核心原则：回答必须极度具体，不要空泛。每一句话都要有信息量。像一位经验丰富的老师傅在面对面给人解卦一样。

解卦规则：
1. 先给结论和具体建议，再简要说明卦理依据。专业术语放在括号里作为参考。
2. 体用生克是核心判断依据——用生体大吉，体克用小吉，比和平稳，体生用耗泄，用克体不利。
3. 变卦代表最终走向，要结合变卦和体卦的生克关系判断结局。
4. 动爻是变化的关键，要解释动爻的含义和对事情的影响。
5. 如果问感情：直接说适不适合、什么时候会有进展、对方是什么态度。
6. 如果问事业/财运：直接说能不能成、什么时候有转机、该怎么做。
7. 如果问选择题：直接说选哪个更好、为什么。
8. 结合应期推算给出时间判断——什么时候会有结果。
9. 回答控制在400字以内，内容要丰富、具体、有信息量。
10. 语气温和但自信，用通俗易懂的语言解释卦象含义。`;

const SYSTEM_EN = `You are an expert Plum Blossom (Mei Hua Yi Shu) divination master with decades of hexagram interpretation experience.
The user has cast a hexagram, with full data below. Your task is to provide specific, actionable interpretation based on the hexagram.

CRITICAL: You MUST respond entirely in English.

CORE PRINCIPLE: Every answer must be ULTRA-SPECIFIC. No vague advice. Every sentence should contain actionable information. Speak like an experienced master giving a face-to-face reading.

Interpretation rules:
1. ALWAYS lead with conclusions and actionable advice first. Put I Ching terminology in parentheses as supporting evidence.
2. Ti-Yong relationship is the core judgment — Yong generates Ti (very auspicious), Ti controls Yong (favorable), Mutual harmony (stable), Ti generates Yong (draining), Yong controls Ti (unfavorable).
3. The changed hexagram represents the final outcome — analyze its relationship with Ti hexagram.
4. The moving line (dong yao) is the key to change — explain what it means for the situation.
5. For love questions: directly say whether it's suitable, when progress will happen, and the other person's attitude.
6. For career/wealth questions: directly say whether it will succeed, when the turning point comes, and what to do.
7. For choice questions: directly say which option is better and why.
8. Use timing calculations to give time estimates — when will results manifest.
9. Keep responses under 400 words — be thorough, specific, and information-dense.
10. Be warm but confident, explaining hexagram meanings in plain language.`;

export async function POST(request) {
  let lang = 'zh';
  try {
    const body = await request.json();
    const { messages, hexData } = body;
    lang = body.lang || 'zh';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }

    const systemBase = lang === 'en' ? SYSTEM_EN : SYSTEM_ZH;
    const hexSection = hexData
      ? `\n\n--- ${lang === 'en' ? 'HEXAGRAM DATA' : '卦象数据'} ---\n${hexData}`
      : '';

    const systemPrompt = systemBase + hexSection;

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
