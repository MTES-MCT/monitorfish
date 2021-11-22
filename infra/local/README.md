# Helps commands

## Export regulatory zones from PostGIS

1. From the local VM, run : `pg_dump -U adl -t prod.reglementation_peche cnsp  > /tmp/ref_reg.sql`
2. Copy to local folder : `scp -r root@10.56.205.25:/tmp/ref_reg.sql .`
3. Copy to `/layersdata` folder of the repo

## Reset a regulation from the local PostGIS regulation referential

```
update prod.reglementation_peche set references_reglementaires = null, layer_name = null, zones = null, facade = null, region = null, law_type = null, references_reglementaires_a_venir = null where id = 10014;
```
