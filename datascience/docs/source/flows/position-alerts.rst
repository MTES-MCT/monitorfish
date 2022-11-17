===============
Position alerts
===============

The ``Position alerts`` flow detects whether any vessel emitted VMS data that matches the specified detection parameters on :

* flag state
* area of detection
* whether to detect all positions or only positions with fishing activity (as detected by the :doc:`enrich positions flow <enrich-positions>`)
* fishing gear (from logbook data)
* time window (specified by a number of hours preceding the present time)

The detected vessels are loaded to the ``pending_alerts`` table.
 
It is scheduled to run 10 minutes, with different parameters related to :

* trawling in the 3 nautical miles french coastal strip
* fishing in the 12 nautical miles french coastal strip by a non-french vessel (excluding historic fishing rights)