==============
Enrich logbook
==============

The ``Enrich logbook`` flow enriches logbook PNOs with data computed by Monitorfish, and loads the result back to the 
``value`` field of the ``logbook_reports`` table :

* the PNO types - based on the PNO type definitions stored in ``pno_types`` and ``pno_type_rules`` (see :doc:`init-pno-types`)
* the :doc:`fleet segments <../fleet-segments>` of the trip
* the :doc:`risk factor <../risk-factor>` of the vessel
* whether the PNO is in the verification scope of the FMC, and its verification and sending status

See :doc:`../prior-notifications`.

It is scheduled to run every 5 minutes.
