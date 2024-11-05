UPDATE public.manual_prior_notifications
    SET
        value = JSONB_SET(value, '{updatedAt}', TO_JSONB(TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), true)
    WHERE
        updated_at is not null;

ALTER TABLE public.manual_prior_notifications
    DROP COLUMN updated_at;
