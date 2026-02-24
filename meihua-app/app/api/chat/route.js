import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
}

const SYSTEM_ZH = `你是一位精通紫微斗数的命理大师，拥有几十年的看盘经验。
用户已经排好了紫微命盘，完整盘面数据在下方。你的任务是：

核心原则：回答必须极度具体，不要空泛。每一句话都要有信息量。

回答规则：
1. 如果问健康：必须指出具体的器官/身体系统（如：心脏、肝胆、肾脏等），风险等级（高/中/低），最危险的年龄段（如：45-55岁），以及具体的预防和化解方法（如：每周游泳3次、忌辛辣、定期做XX检查）
2. 如果问事业：必须列出2-3个最适合的具体职业（如：产品经理、律师、投资顾问），最佳发展时间窗口（如：35-45岁是黄金期），需要避开的具体陷阱
3. 如果问感情：必须说明最佳配偶类型（年龄差、性格特征、职业方向），最佳恋爱/结婚年龄，需要避免的具体感情模式
4. 如果问财运：必须指出最佳投资类型（房产/基金/创业等），财运高峰的具体年龄段，需要避开的具体财务陷阱
5. 从星耀的庙旺得利平不陷状态推导严重程度——庙旺=影响大/风险高，落陷=影响轻/容易化解
6. 结合大限和流年分析时间节点——给出具体的年龄段
7. 不要编造盘面中不存在的星耀或四化
8. 回答控制在300字以内，但每一句都要有具体信息
9. 语气温和但自信，像一位经验丰富的老师`;

const SYSTEM_EN = `You are an expert Zi Wei Dou Shu (Purple Star Astrology) master with decades of chart-reading experience.
The user has generated their complete birth chart, with full palace data below.

CORE PRINCIPLE: Every answer must be ULTRA-SPECIFIC. No vague advice. Every sentence should contain actionable information.

Response rules:
1. Health questions: Name the exact organs/body systems at risk (e.g., cardiovascular, liver, kidneys), risk level (high/medium/low), most dangerous age range (e.g., 45-55), and specific prevention methods (e.g., swim 3x/week, avoid spicy food, get annual heart screenings)
2. Career questions: List 2-3 specific job titles or industries (e.g., product manager, attorney, investment advisor), best career window (e.g., ages 35-45), and specific pitfalls to avoid
3. Love questions: Describe ideal partner type (age gap, personality traits, career type), best age for marriage, and specific relationship patterns to avoid
4. Wealth questions: Recommend specific investment types (real estate, index funds, business), financial peak age range, and specific financial traps to watch for
5. Use star brightness (Temple/Prosperous/Weak/Trapped) to gauge severity — bright stars = stronger effect, fallen stars = weaker/easier to resolve
6. Reference specific decade periods and yearly cycles for timing — give concrete age ranges
7. Never fabricate stars or transformations not in the chart
8. Keep responses under 300 words but pack every sentence with specific information
9. Be warm but confident, like an experienced teacher`;

export async function POST(request) {
  try {
    const { messages, chartData, lang } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }

    const systemBase = lang === 'en' ? SYSTEM_EN : SYSTEM_ZH;
    const chartSection = chartData
      ? `\n\n--- ${lang === 'en' ? 'USER BIRTH CHART DATA' : '用户命盘数据'} ---\n${chartData}`
      : '';

    const systemPrompt = systemBase + chartSection;

    // Map messages to Anthropic format
    const apiMessages = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
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
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    const keyPrefix = process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'none';
    return Response.json(
      { reply: `Error: ${err?.message || 'Unknown'} [key: ${hasKey ? keyPrefix + '...' : 'NOT SET'}]` },
      { status: 500 }
    );
  }
}
