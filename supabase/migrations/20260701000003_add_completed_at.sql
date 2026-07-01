-- Thêm cột completed_at để lưu thời điểm thực tế admin bấm "Hoàn thành".
-- Dùng để vẽ bar calendar theo độ dài thực tế thay vì ước tính theo party size.
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;
