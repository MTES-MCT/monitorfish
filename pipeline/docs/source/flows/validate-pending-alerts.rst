=======================
Validate pending alerts
=======================

The ``Validate pending alerts`` flow automatically validates all pending alerts of a given type : the alerts are turned into 
:doc:`reportings <../reportings>`, which are then archived.

This is used to avoid polluting the app with a large number of alerts yet keep track of said alerts by recording them in 
the vessels' history.

It is scheduled to run every day on *Missing FAR in 24h* alerts (see :doc:`missing-far-alerts`).
