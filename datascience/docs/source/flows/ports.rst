=====
Ports
=====

The ``ports`` flow extracts the list of ports from the open dataset on
`data.gouv.fr <https://www.data.gouv.fr/fr/datasets/liste-des-ports-du-systeme-ers-avec-donnees-de-position/>`__, 
which is managed by the development team, and loads it to the ``ports`` table of the Monitorfish database.

It is run manually when needed in order to sync the Monitorfish database with the open dataset.