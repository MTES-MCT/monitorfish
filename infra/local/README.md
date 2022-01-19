# Commands

## Export regulatory zones from PostGIS

1. From the local VM, run :
```
psql -d cnsp --host <IP> --port 5432 --username "adl" -c "copy(SELECT id, law_type,
                                                           facade, layer_name, zones, region, date_fermeture,
                                                           date_ouverture, fishing_period, periodes, engins, engins_interdits,
                                                           mesures_techniques, especes, species, quantites, taille,
                                                           especes_interdites, autre_reglementation_especes,
                                                           documents_obligatoires, autre_reglementation,
                                                           references_reglementaires, geometry_simplified, row_hash FROM prod.reglementation_peche) to stdout" > dump.tsv
```
2. Copy to local folder : `scp -r root@<IP>:/tmp/dump.tsv .`
3. Add to the beginning of the file :
```
COPY public.reglementation_peche (id, law_type,
                                  facade, layer_name, zones, region, date_fermeture,
                                  date_ouverture, fishing_period, periodes, engins, engins_interdits,
                                  mesures_techniques, especes, species, quantites, taille,
                                  especes_interdites, autre_reglementation_especes,
                                  documents_obligatoires, autre_reglementation,
                                  references_reglementaires, geometry_simplified, row_hash) FROM stdin WITH ENCODING 'UTF8';
```
4. Copy to `/layersdata` folder of the repo

## Reset a regulation from the local PostGIS regulation referential

```
update prod.reglementation_peche set references_reglementaires = null, layer_name = null, zones = null, facade = null, region = null, law_type = null, references_reglementaires_a_venir = null where id = 10014;
```

## Create a test regulatory entry

```
insert into prod.reglementation_peche (law_type, facade, layer_name, zones, region, date_fermeture,date_ouverture, fishing_period, periodes, engins, engins_interdits,mesures_techniques, especes, species, quantites, taille,especes_interdites, autre_reglementation_especes,documents_obligatoires, autre_reglementation, references_reglementaires, row_hash) select law_type,
                                                           facade, 'Topic de test', 'Zone de test', region, date_fermeture,
                                                           date_ouverture, fishing_period, periodes, engins, engins_interdits,
                                                           mesures_techniques, especes, species, quantites, taille,
                                                           especes_interdites, autre_reglementation_especes,
                                                           documents_obligatoires, autre_reglementation,
                                                           references_reglementaires, row_hash from prod.reglementation_peche where id = 10294;

```