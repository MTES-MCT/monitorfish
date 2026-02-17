CREATE INDEX reportings_all_active_idx
    ON reportings (id)
    INCLUDE (type, vessel_id, internal_reference_number)
WHERE archived = false AND deleted = false;

CREATE INDEX ON public.reportings (internal_reference_number);

CREATE INDEX ON public.reportings (vessel_id);
