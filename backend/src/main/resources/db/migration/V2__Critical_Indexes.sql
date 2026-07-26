-- V2__Critical_Indexes.sql
-- targeted indexes to improve foreign key lookup performance

CREATE INDEX IF NOT EXISTS idx_chat_msg_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_msg_sender ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_chat_notif_recipient ON chat_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_notif_room ON chat_notifications(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_notif_message ON chat_notifications(message_id);

CREATE INDEX IF NOT EXISTS idx_chat_mem_room ON chat_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_mem_user ON chat_members(user_id);

CREATE INDEX IF NOT EXISTS idx_read_rcpt_msg ON message_read_receipts(last_read_message_id);
CREATE INDEX IF NOT EXISTS idx_read_rcpt_user ON message_read_receipts(user_id);

CREATE INDEX IF NOT EXISTS idx_ws_task_startup ON workspace_tasks(startup_id);
CREATE INDEX IF NOT EXISTS idx_ws_task_assignee ON workspace_tasks(assignee_id);

CREATE INDEX IF NOT EXISTS idx_call_log_caller ON call_logs(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_log_receiver ON call_logs(receiver_id);
