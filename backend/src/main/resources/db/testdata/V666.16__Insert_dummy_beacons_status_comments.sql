INSERT INTO beacon_status_comments (beacon_status_id, comment, user_type, date_time_utc) VALUES
(1,'Ceci est le premier commentaire de la journée ! L''oiseau est dans le nid. ','OPS', NOW() - ('1 WEEK')::interval),
(1,'La pêche profonde résulte directement de l’épuisement des ressources marines dans les eaux de surface. Après avoir surexploité les stocks de poissons en surface, les flottes de pêche industrielles se sont tournées vers les grands fonds pour trouver la ressource qui leur faisait défaut.','SIP', NOW() - ('1 DAY')::interval),
(3,'Bon et bien encore un chalutage de fond...', 'OPS', NOW() - ('2 WEEK')::interval);
