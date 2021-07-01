INSERT INTO controllers (id, controller, controller_type, administration)
VALUES
(151, 'ULAM 56', 'Terrestre', 'Affaires Maritimes'),
(12, 'Unité XYZ', 'Aérien', 'Marine Nationale');

INSERT INTO infractions (id, natinf_code, regulation, infraction_category, infraction)
VALUES
(5, '23581', 'Arreté du 12/01/3021', 'Pêche', 'Taille de maille non réglementaire'),
(22, '23588', 'Arreté du 15/01/3021', 'Pêche', 'Chalutage dans la zone des 3 milles'),
(13, '23584', 'Arreté du 18/01/3021', 'Sécurité / Rôle', 'Défaut AIS');

INSERT INTO controls (id, vessel_id, controller_id, control_type, control_datetime_utc, input_start_datetime_utc, input_end_datetime_utc, facade, longitude, latitude, port_locode, mission_order, vessel_targeted, cnsp_called_unit, cooperative, pre_control_comments, infraction, infraction_ids, diversion, escort_to_quay, seizure, seizure_comments, post_control_comments, gear_controls)
VALUES 
(1, 1, 151,'Contrôle à la mer',CURRENT_DATE,CURRENT_DATE,CURRENT_DATE,'Manche ouest - Atlantique',-6.56, 45.12, null, False, False, False, False, 'Navire contrôlé en janvier', True, ARRAY[22, 13], True, False, False, 'Pas de saisie', 'Commentaires post contrôle', '[{"gearCode": "OTB", "declaredMesh": 60.0, "controlledMesh": null, "gearWasControlled": false}, {"gearCode": "OTM", "declaredMesh": 60.0, "controlledMesh": 60.8, "gearWasControlled": true}]'),
(2, 1, 151,'Contrôle à la mer',CURRENT_DATE,CURRENT_DATE,CURRENT_DATE,'Manche ouest - Atlantique',-8.52, 51.58, null, True, True, False, False, 'Aucun commentaire', False, null, False, False, False, 'Pas de saisie', 'Commentaires post contrôle', '[]'),
(3, 1, 151,'Contrôle à la mer','2019-01-18T07:19:28.384921Z','2019-01-18T07:19:28.384921Z','2019-01-18T07:19:28.384921Z','Manche ouest - Mer du Nord',-9.52, 42.58, null, True, True, True, False, 'Aucun commentaire', False, null, False, False, False, 'Pas de saisie', 'Commentaires post contrôle', '[]'),
(4, 1, 12,'Contrôle à la débarque','2020-01-18T07:19:28.384921Z','2020-01-18T07:19:28.384921Z','2020-01-18T07:19:28.384921Z','Manche est - Mer du nord',null, null, 'AEFAT', False, true, true, False, 'Contrôler les engins', True, null, False, False, True, 'Saisie de la pêche', 'Documents pas à jour', '[{"gearCode": "OTB", "declaredMesh": 60.0, "controlledMesh": 58.9, "gearWasControlled": true}]');
