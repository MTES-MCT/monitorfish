==============
Init PNO types
==============

The ``Init PNO types`` flow loads the definitions of prior notification types (and the rules - species, FAO and GFCM areas, gears, 
flag states, minimum quantity... - which determine whether a PNO belongs to a type) from hard coded csv files stored in 
``pipeline/src/data/`` into the ``pno_types`` and ``pno_type_rules`` tables.

PNO types are computed by the :doc:`enrich-logbook` flow and determine whether a PNO is in the verification scope of the 
FMC and its minimum notification period. See :doc:`../prior-notifications`.

It is run manually when needed (when the csv files are updated).
