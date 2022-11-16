================
Enrich positions
================

The ``Enrich positions`` flow analyzes the VMS route of vessels and computes a number of 
features which are then inserted in additionnal computed columns of the ``positions`` table :

* ``is_at_port`` : a boolean which is ``true`` if the position is in one of the ``anchorage`` H3 cells and ``false`` otherwise
* distance, time and average speed from the previous emitted position
* total time of continuous emission since the last exit of a harbour
* ``is_fishing`` : a boolean which is true if the position matches the fishing detection criteria and ``false`` otherwise

It is scheduled to run every minute.