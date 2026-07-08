-- ============================================================
-- 瑜伽裤百科 · 发疯评论区建表脚本 v2
-- 打开 https://supabase.com/dashboard/project/pqvjztbxgtgbohrmaqhr/sql/new
-- 把下面的 SQL 粘贴进去执行
-- ============================================================

-- 创建发疯评论表（含所有字段）
CREATE TABLE IF NOT EXISTS crazy_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '匿名野人',
  mood TEXT NOT NULL DEFAULT '😑',
  text TEXT NOT NULL,
  time BIGINT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  chaos INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  liked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 开启行级安全（RLS）
ALTER TABLE crazy_comments ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取评论（匿名用户也能看）
CREATE POLICY "允许所有人读取评论" ON crazy_comments
  FOR SELECT USING (true);

-- 允许所有人写入评论（不需要登录）
CREATE POLICY "允许所有人写入评论" ON crazy_comments
  FOR INSERT WITH CHECK (true);

-- 允许任何人更新评论（用于点赞等操作）
CREATE POLICY "允许所有人更新评论" ON crazy_comments
  FOR UPDATE USING (true) WITH CHECK (true);

-- 允许任何人删除评论
CREATE POLICY "允许所有人删除评论" ON crazy_comments
  FOR DELETE USING (true);

-- 创建 time 索引（方便按时间排序）
CREATE INDEX IF NOT EXISTS idx_crazy_comments_time ON crazy_comments (time DESC);
