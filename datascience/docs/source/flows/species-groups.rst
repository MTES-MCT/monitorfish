==============
Species groups
==============

The ``Species groups`` flow extracts the species groups repository data from hard coded csv files 
stored in ``datascience/src/pipeline/data/`` and loads it to the ``species_groups`` and 
``species_codes_groups`` tables of the Monitorfish database.

It is run manually when needed (when the csv files are updated).