-- Update ers_messages table
ALTER TABLE public.ers_messages
RENAME COLUMN ers_id_to_delete_or_correct TO referenced_ers_id;

ALTER TABLE public.ers_messages
RENAME COLUMN parsed_integration_datetime_utc TO integration_datetime_utc;

ALTER TABLE public.ers_messages
DROP COLUMN raw_integration_datetime_utc;

ALTER TABLE public.ers_messages
ADD COLUMN trip_number integer;

CREATE INDEX ON public.ers_messages (trip_number);

-- Update ers table
ALTER TABLE public.ers
RENAME COLUMN ers_id_to_delete_or_correct TO referenced_ers_id;

ALTER TABLE public.ers
RENAME COLUMN parsed_integration_datetime_utc TO integration_datetime_utc;

ALTER TABLE public.ers
ADD COLUMN trip_number integer;

CREATE INDEX ON public.ers (trip_number);
CREATE INDEX ON public.ers (operation_number);
