==================
Missing dep alerts
==================

The ``Missing dep alerts`` flow identifies vessels which left port (as detected on their VMS track by the 
:doc:`enrich positions flow <enrich-positions>`) during the last 48 hours without sending the corresponding DEP 
(departure) logbook message.

Monitored vessels are french and venezuelan vessels of 12 meters or more which are not exempted from electronic logbook.

Alerts are generated for these vessels and loaded to the ``pending_alerts`` table.

It is scheduled to run every 20 minutes.
