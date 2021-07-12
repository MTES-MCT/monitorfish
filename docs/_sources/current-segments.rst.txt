================
Current segments
================

The ``current_segments`` flow extracts all catches of each vessel since its last 
DEP message and crosses its catch (species, area and fishing gear) with the definition of
fleet_segments in order to determine the fleet segment(s) to which each vessel belongs in
real time.

It is scheduled to run every 10 minutes.