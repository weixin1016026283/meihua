import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('feature_flags')
      .select('name, enabled');

    if (error) throw error;

    const defaults = {
      choice_analysis: true,
      timing_section: true,
      career_section: true,
      love_section: true,
      horary_astrology: false,
    };

    // 转成 { flagName: true/false } 格式；若表为空则回退默认值
    const flags = data?.length ? Object.fromEntries(data.map(r => [r.name, r.enabled])) : defaults;
    return Response.json(flags);
  } catch {
    // 出错时返回所有功能开启（fail open）
    return Response.json({
      choice_analysis: true,
      timing_section: true,
      career_section: true,
      love_section: true,
      horary_astrology: false,
    });
  }
}
