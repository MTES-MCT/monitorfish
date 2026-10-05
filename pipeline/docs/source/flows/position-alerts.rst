===============
Position alerts
===============

Position alerts are the :ref:`configurable alerts <configurable-alerts>` created by users in the app. Their 
specifications are stored in the ``position_alerts`` table.

They are run by two flows :

* the ``Position alerts`` flow, scheduled to run every 10 minutes, reads all alert specifications and selects those 
  which are activated and within their validity period (validity periods can be repeated each year). For each of these, 
  it triggers a run of the ``Position alert`` flow.
* the ``Position alert`` flow runs one alert specification : it detects whether any vessel emitted VMS data that 
  matches the detection parameters of the specification. At most 3 runs of this flow are executed concurrently.

Detection parameters are :

* flag state
* areas of detection : administrative areas (EEZ, FAO areas, coastal strips...) and / or regulatory areas
* whether to detect all positions or only positions with fishing activity (as detected by the :doc:`enrich positions flow <enrich-positions>`)
* fishing gear (from logbook data and :doc:`vessel-profiles`), with an optional mesh range
* species onboard (from logbook data), with an optional minimum weight and catch areas
* time window (specified by a number of hours preceding the present time)
* depth (based on bathymetry data from https://emodnet.ec.europa.eu at the position of the VMS point)
* list of vessels (specified by their district, producer organization or individually)

Vessels for which the alert is silenced are excluded. The detected vessels are loaded to the ``pending_alerts`` table.
