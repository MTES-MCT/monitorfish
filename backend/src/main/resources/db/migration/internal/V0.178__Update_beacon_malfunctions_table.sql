ALTER TYPE public.beacon_malfunctions_vessel_status ADD VALUE 'ON_SALE' AFTER 'NEVER_EMITTED';
ALTER TYPE public.beacon_malfunctions_vessel_status ADD VALUE 'SUSPENDED_BECAUSE_UNPAID' AFTER 'ON_SALE';
ALTER TYPE public.beacon_malfunctions_vessel_status ADD VALUE 'IN_FOREIGN_EEZ' AFTER 'SUSPENDED_BECAUSE_UNPAID';
