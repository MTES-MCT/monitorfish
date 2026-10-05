========
Controls
========

The ``controls`` flow extracts all controls data from the FMC database and inserts 
the data into the ``mission_actions`` table of the Monitorfish database.

This flow was used to import inspection data from the legacy system which existed before Monitorfish. 
Since the development of :doc:`missions and controls data entry <../missions-and-controls>` in Monitorfish, this flow is not used any more (but could be if a new import of legacy data were to be necessary).