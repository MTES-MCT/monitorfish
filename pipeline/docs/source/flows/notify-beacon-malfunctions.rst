==========================
Notify beacon malfunctions
==========================

The ``Notify beacon malfunctions`` flow sends beacon malfunction notifications by email, sms and fax to the vessel captain,
vessel operator, satellite operator and foreign FMC (if the vessel is in foreign waters), for each notification 
requested in the app (initial notification at sea or at port, reminder, end of malfunction, notification to a foreign FMC).

Sent notifications are logged in the ``beacon_malfunction_notifications`` table.

It is scheduled to run every 2 minutes. See :doc:`../vms-beacon-monitoring`.
