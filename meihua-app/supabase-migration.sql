-- ===========================================
-- Device-based user identification migration
-- Run this in Supabase SQL Editor BEFORE deploying
-- ===========================================

-- 1. Add device_id to existing tables
ALTER TABLE readings ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS device_id TEXT;

-- 2. Create AI usage tracking table (for server-side quota)
CREATE TABLE IF NOT EXISTS ai_usage (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'meihua',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_ai_usage_device_month ON ai_usage (device_id, created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_device ON subscriptions (device_id);
CREATE INDEX IF NOT EXISTS idx_readings_device ON readings (device_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_device ON chat_history (device_id);
