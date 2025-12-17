ALTER TABLE public.position_alerts
    ADD COLUMN threat_characterization VARCHAR(200) NOT NULL DEFAULT 'Type inconnu',
    ADD COLUMN threat VARCHAR(100) NOT NULL DEFAULT 'Famille inconnue';
