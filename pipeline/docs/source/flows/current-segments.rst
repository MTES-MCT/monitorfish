================
Current segments
================

The ``current_segments`` flow extracts all catches of each vessel since its last 
DEP message and crosses its catch (species, area and fishing gear) with the definition of
fleet segments in order to determine the :doc:`fleet segment(s) <../fleet-segments>` to which each vessel belongs in
real time.

The computed data is loaded in the ``current_segments`` table of the Monitorfish database.

It is scheduled to run every 10 minutes.prefect 