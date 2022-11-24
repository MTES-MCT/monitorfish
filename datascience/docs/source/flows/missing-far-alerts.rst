==================
Missing FAR alerts
==================

The ``Missing FAR alerts`` flow detects whether any vessel of more than 12m spent time fishing - 
that is, whether it emitted VMS data which was classified as fishing activity by the :doc:`enrich positions flow <enrich-positions>` -
on the previous day in french waters without sending any FAR logbook report.

The detected vessels are loaded to the ``pending_alerts`` table.
 
It is scheduled to run every day.