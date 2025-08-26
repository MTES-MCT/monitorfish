=====
Ports
=====

The ``ports`` flow extracts the list of ports from the CROSS-A data, loads it to the ``ports`` table of the Monitorfish database and updates the open dataset `data.gouv.fr <https://www.data.gouv.fr/fr/datasets/liste-des-ports-du-systeme-ers-avec-donnees-de-position/>`__.

It is run manually when needed (when ports have been modified in the CROSS-A database).