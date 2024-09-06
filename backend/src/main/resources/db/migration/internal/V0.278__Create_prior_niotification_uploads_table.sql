CREATE TABLE prior_notification_uploads (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(255) NOT NULL,
    is_manual_prior_notification BOOLEAN NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    content BYTEA NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
