=======================================
Init infraction threat characterization
=======================================

The ``Init infractions threat characterization`` flow loads, from hard coded csv files stored in ``pipeline/src/data/``, 
the hierarchy used to categorize infractions :

* ``threats`` (e.g. reporting obligations, fishing in closed areas...)
* ``threat_characterizations``
* ``infraction_threat_characterization``, which links each infraction (NATINF code) to a threat characterization
* ``risk_elements`` (see :doc:`risk-elements`)
* ``isr``, the infringement codes of the EFCA Inspection and Surveillance Report (ISR)

This hierarchy is used to sort infractions by family and type in the app (in control reports, reportings and 
:ref:`configurable alerts <configurable-alerts>`).

It is run manually when needed (when the csv files are updated).
