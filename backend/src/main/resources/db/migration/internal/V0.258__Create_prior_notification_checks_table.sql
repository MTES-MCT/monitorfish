CREATE TABLE public.prior_notification_checks (
    report_id VARCHAR(36) PRIMARY KEY,
    is_in_verification_scope BOOLEAN NOT NULL,
    is_verified BOOLEAN NOT NULL,
    is_pending_send BOOLEAN NOT NULL,
    is_sent BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
