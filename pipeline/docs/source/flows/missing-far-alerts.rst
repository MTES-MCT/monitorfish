==================
Missing FAR alerts
==================

The ``Missing FAR alerts`` flow detects whether any vessel of 12 meters or more spent time fishing - 
that is, whether it emitted VMS data which was classified as fishing activity by the :doc:`enrich positions flow <enrich-positions>` -
without sending any FAR logbook report.

Monitored vessels are french vessels everywhere, and belgian and venezuelan vessels in the french EEZ. Vessels exempted 
from electronic logbook are excluded.

The flow is scheduled twice every morning :

* a *Missing FAR in 24h* alert (``MISSING_FAR_ALERT``), for vessels with no FAR on the previous day
* a *Missing FAR in 48h* alert (``MISSING_FAR_48_HOURS_ALERT``), for vessels with no FAR over the previous 2 days

As a safeguard against logbook data reception failures, no alert is raised if more than 50% of the monitored vessels 
appear to have missing FARs.

The detected vessels are loaded to the ``pending_alerts`` table. *Missing FAR in 24h* alerts are then automatically 
validated by the :doc:`validate-pending-alerts` flow.
