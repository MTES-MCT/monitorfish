# Commands

## Export regulatory zones from PostGIS

1. From the local VM, run :
```
psql -d cnsp --host <IP> --port 5432 --username "adl" -c "copy(SELECT id, law_type,
                                                           facade, topic, zone, region, date_fermeture,
                                                           date_ouverture, fishing_period, periodes, engins, engins_interdits,
                                                           mesures_techniques, especes, species, quantites, taille,
                                                           especes_interdites, autre_reglementation_especes,
                                                           documents_obligatoires, autre_reglementation,
                                                           regulatory_references, geometry_simplified, row_hash FROM prod.reglementation_peche) to stdout" > dump.tsv
```
2. Copy to local folder : `scp -r root@<IP>:/tmp/dump.tsv .`
3. Add to the beginning of the file :
```
COPY public.reglementation_peche (id, law_type,
                                  facade, topic, zone, region, date_fermeture,
                                  date_ouverture, fishing_period, periodes, engins, engins_interdits,
                                  mesures_techniques, especes, species, quantites, taille,
                                  especes_interdites, autre_reglementation_especes,
                                  documents_obligatoires, autre_reglementation,
                                  regulatory_references, geometry_simplified, row_hash) FROM stdin WITH ENCODING 'UTF8';
```
4. Copy to `/layersdata` folder of the repo

## Reset a regulation from the local PostGIS regulation referential

```
insert into prod.regulations (id, topic, zone, region, law_type) VALUES (11053, 'Un topic de test', 'Zone de test', 'Bretagne', 'Reg. NAMO');
```

## Create a test regulatory entry

```
insert into prod.regulations (geometry) select geometry from prod.regulations where id = 654;
```
