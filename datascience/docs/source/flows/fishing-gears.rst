=============
Fishing gears
=============

The ``Fishing gears`` flow extracts the fishing gears repository data from hard coded csv files 
stored in ``datascience/src/pipeline/data/`` and loads it to the ``fishing_gear_codes`` and 
``fishing_gear_codes_groups`` tables of the Monitorfish database.

It is run manually when needed (when the csv files are updated).