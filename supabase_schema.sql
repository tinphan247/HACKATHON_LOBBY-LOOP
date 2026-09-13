-- =====================================================================
-- HACKATHON LOBBY-LOOP: SUPABASE DATABASE SCHEMA & REALTIME SETUP
-- Hướng dẫn: Copy toàn bộ nội dung file này và dán vào Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Run)
-- =====================================================================

-- 1. Tạo bảng lưu trữ phản hồi (feedbacks)
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id TEXT PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  branch TEXT NOT NULL CHECK (branch IN ('happy', 'unhappy')),
  satisfaction_reasons TEXT[] DEFAULT '{}',
  issue TEXT,
  root_cause TEXT,
  comment TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT DEFAULT 'Galaxy Nguyen Du',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index để tối ưu truy vấn theo thời gian và đánh giá
CREATE INDEX IF NOT EXISTS idx_feedbacks_timestamp ON public.feedbacks (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON public.feedbacks (rating);
CREATE INDEX IF NOT EXISTS idx_feedbacks_branch ON public.feedbacks (branch);

-- 2. Thiết lập Row Level Security (RLS)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi client (bao gồm cả khách gửi feedback và dashboard quản trị) đọc dữ liệu
DROP POLICY IF EXISTS "Cho phép đọc feedbacks" ON public.feedbacks;
CREATE POLICY "Cho phép đọc feedbacks"
  ON public.feedbacks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Cho phép khách hàng gửi feedback mới từ điện thoại / web
DROP POLICY IF EXISTS "Cho phép thêm feedbacks" ON public.feedbacks;
CREATE POLICY "Cho phép thêm feedbacks"
  ON public.feedbacks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Cho phép reset hoặc xóa feedback phục vụ quản trị và trình diễn demo
DROP POLICY IF EXISTS "Cho phép xóa feedbacks" ON public.feedbacks;
CREATE POLICY "Cho phép xóa feedbacks"
  ON public.feedbacks
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 3. Kích hoạt tính năng Realtime của Supabase cho bảng feedbacks
-- (Giúp Dashboard tự động nhảy số khi khách submit trên điện thoại)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'feedbacks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feedbacks;
  END IF;
END $$;
