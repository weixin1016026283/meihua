import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('name, enabled');

    if (error) throw error;

    // 转成 { flagName: true/false } 格式
    const flags = Object.fromEntries(data.map(r => [r.name, r.enabled]));
    return Response.json(flags);
  } catch {
    // 出错时返回所有功能开启（fail open）
    return Response.json({
      choice_analysis: true,
      timing_section: true,
      career_section: true,
      love_section: true,
      horary_astrology: true,
    });
  }
}
