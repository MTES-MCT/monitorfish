ALTER TABLE public.position_alerts
    ADD COLUMN threat_characterization TYPE VARCHAR(200) NOT NULL DEFAULT 'Type inconnu',
    ADD COLUMN threat TYPE VARCHAR(100) NOT NULL DEFAULT 'Famille inconnue';
