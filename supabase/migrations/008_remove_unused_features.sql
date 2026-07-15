-- ============================================
-- 未使用機能の削除
-- 対象: 募集シフト(QR/URL共有)、Googleカレンダー同期、
--       業務・タスク自動配置エンジン、他店舗連携
-- 事前にコード側の対応する実装は削除済み。
-- 各テーブル/カラム/関数は grep でコードから参照が無いことを確認済み。
-- ============================================

-- ========== 募集シフト(QR/URL共有) ==========
-- quick_shift_tokens: QRコード/URLトークン共有機能のテーブル
-- recruitment_shifts / append_recruitment_application: どのコードからも未参照(既に死んでいた機能)
DROP FUNCTION IF EXISTS record_token_usage(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS append_recruitment_application(UUID, JSONB);
DROP TABLE IF EXISTS quick_shift_tokens CASCADE;
DROP TABLE IF EXISTS recruitment_shifts CASCADE;

-- ========== Googleカレンダー同期 ==========
DROP FUNCTION IF EXISTS get_google_tokens_for_user(UUID);
DROP TABLE IF EXISTS user_google_tokens CASCADE;
ALTER TABLE shifts DROP COLUMN IF EXISTS google_calendar_event_id;

-- ========== 業務・タスク自動配置エンジン ==========
DROP TABLE IF EXISTS user_task_assignments CASCADE;
DROP TABLE IF EXISTS user_role_assignments CASCADE;
DROP TABLE IF EXISTS role_tasks CASCADE;
DROP TABLE IF EXISTS staff_roles CASCADE;
DROP TABLE IF EXISTS shift_task_assignments CASCADE;
DROP TABLE IF EXISTS todo_comments CASCADE;
DROP TABLE IF EXISTS daily_todos CASCADE;
DROP TABLE IF EXISTS todo_templates CASCADE;
ALTER TABLE time_segment_types DROP COLUMN IF EXISTS allow_task_overlap;

-- ========== 他店舗連携 ==========
DROP TABLE IF EXISTS user_store_access CASCADE;
ALTER TABLE stores DROP COLUMN IF EXISTS connected_stores;
ALTER TABLE stores DROP COLUMN IF EXISTS connection_password;
ALTER TABLE stores DROP COLUMN IF EXISTS connection_password_expiry;
ALTER TABLE users DROP COLUMN IF EXISTS connected_stores;
