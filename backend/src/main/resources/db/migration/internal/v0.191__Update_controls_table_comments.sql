-- Colonnes inchangées
id integer NOT NULL,
vessel_id integer,
cfr character varying(100),
ircs character varying(100),
external_immatriculation character varying(100),
vessel_name character varying(100),
flag_state character varying(100),
district_code character varying(2)
longitude double precision,
latitude double precision,
port_locode character varying(5),
facade character varying(100),
vessel_targeted boolean,
fao_areas character varying(100)[],

-- Colonnes à modifier
control_type character varying(100) -> action_type -- Renommer colonne control_type, la laisser en VARCHAR et ajouter "OBSERVATION" dans l'ENUM en back
control_datetime_utc timestamp without time zone -> action_datetime_utc,
gear_controls jsonb -> gear_onboard -- [{gearCode: , declaredMesh: , controlledMesh: , gearWasControlled: , + comments: VARCHAR}]
seizure_comments text -> seizure_and_diversion_comments
post_control_comments text -> other_comments
catch_controls jsonb -> species_onboard -- [{
--     speciesCode: VARCHAR,
--     nbFish: DOUBLE PRECISION,
--     + declaredWeight: DOUBLE PRECISION,
--     weight -> controlledWeight: DOUBLE PRECISION,
--     + underSized: BOOLEAN,
-- }
diversion boolean -> seizure_and_diversion, -- comment mapper les données de Poséidon (déroutement, appréhension et reconduite à quai séparés) ?
segments character varying(100)[] -> jsonb,

-- Colonnes à ajouter
mission_id INTEGER
emits_vms VARCHAR -- avec ENUM en back, valeurs "YES", "NO", "NOT_APPLICABLE"
emits_ais VARCHAR -- avec ENUM en back, valeurs "YES", "NO", "NOT_APPLICABLE"
logbook_matches_activity VARCHAR -- avec ENUM en back, valeurs "YES", "NO", "NOT_APPLICABLE"
licences_match_activity VARCHAR -- avec ENUM en back, valeurs "YES", "NO", "NOT_APPLICABLE"
species_weight_controlled BOOLEAN
species_size_controlled BOOLEAN
separate_stowage_of_preserved_species BOOLEAN
logbook_infractions JSONB -- [{infraction_type: WITH_RECORD / WITHOUT_RECORD / PENDING, natinf: INTEGER, comments: VARCHAR}]
licences_and_logbook_observations VARCHAR
gear_infractions JSONB -- [{infraction_type: WITH_RECORD / WITHOUT_RECORD / PENDING, natinf: INTEGER, comments: VARCHAR, gear_seized: BOOLEAN}]
species_infractions JSONB -- [{infraction_type: WITH_RECORD / WITHOUT_RECORD / PENDING, natinf: INTEGER, comments: VARCHAR, species_seized: BOOLEAN}]
species_observations VARCHAR
other_infractions JSONB -- [{infraction_type: WITH_RECORD / WITHOUT_RECORD / PENDING, natinf: INTEGER, comments: VARCHAR}]
number_of_vessels_flown_over INTEGER
unit_without_omega_gauge BOOLEAN
control_quality_comments VARCHAR
feedback_sheet_required BOOLEAN
is_from_poseidon BOOLEAN NOT NULL
user_trigram VARCHAR
flight_objectives VARCHAR[]


-- Colonnes inutilisées à supprimer
seizure boolean, -- possible de le réinjecter dans des infractions espèces ?
escort_to_quay boolean
cnsp_called_unit boolean
pre_control_comments text
mission_order boolean, -- à mettre dans les missions (modif pipeline pour les données historiques)
controller_id integer -- fait maintenant partie de la mission. Il faudra créer des missions pour les contrôles historiques (dans la pipeline).
cooperative boolean
infraction boolean -- redondance vs le fait qu'il y ait des infractions dans les autres champs
infraction_ids integer[] -- répartir dans species_infractions, gear_infractions et other_infractions
input_start_datetime_utc timestamp without time zone
input_end_datetime_utc timestamp without time zone
