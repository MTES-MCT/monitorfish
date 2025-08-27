===============
Position alerts
===============

The ``Position alerts`` flow detects whether any vessel emitted VMS data that matches the specified detection parameters on :

* flag state
* area of detection
* whether to detect all positions or only positions with fishing activity (as detected by the :doc:`enrich positions flow <enrich-positions>`)
* fishing gear (from logbook data and :doc:`vessel-profiles`)
* species (from logbook data)
* time window (specified by a number of hours preceding the present time)
* depth (based on bathymetry data from https://emodnet.ec.europa.eu at the position of the VMS point)
* list of vessels (specified by their district, producer organization or individually)

The detected vessels are loaded to the ``pending_alerts`` table.
 