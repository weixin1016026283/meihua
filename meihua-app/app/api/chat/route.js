import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
}

const SYSTEM_ZH = `你是一位精通紫微斗数的命理大师，拥有几十年的看盘经验。
用户已经排好了紫微命盘，完整盘面数据在下方。你的任务是：
1. 基于盘面数据回答用户的命理问题
2. 解读要专业但通俗易懂，让普通人也能听明白
3. 如果用户问的问题在盘面中没有直接答案，可以从相关宫位推导
4. 不要编造盘面中不存在的星耀或四化
5. 回答控制在200字以内，简洁有力
6. 语气温和但自信，像一位经验丰富的老师`;

const SYSTEM_EN = `You are an expert Zi Wei Dou Shu (Purple Star Astrology) master with decades of chart-reading experience.
The user has generated their complete birth chart, with full palace data below. Your task:
1. Answer the user's destiny questions based on the chart data
2. Be professional yet accessible — explain in terms anyone can understand
3. If the question isn't directly answered by the chart, reason from related palaces
4. Never fabricate stars or transformations not present in the chart
5. Keep responses under 200 words, concise and impactful
6. Be warm but confident, like an experienced teacher`;

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
    return Response.json(
      { reply: '服务暂时不可用 / Service temporarily unavailable.' },
      { status: 500 }
    );
  }
}
