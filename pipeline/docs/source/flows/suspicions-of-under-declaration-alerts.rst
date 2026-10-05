======================================
Suspicions of under declaration alerts
======================================

The ``Suspicions of under declaration alerts`` flow identifies instances of vessels which present an unusually high ratio of fishing effort to declared fishing products.

Alerts are generated for these vessels (except those for which the alert is silenced or already reported) and loaded to the ``pending_alerts`` table.

This flow is not scheduled : it is run manually.
