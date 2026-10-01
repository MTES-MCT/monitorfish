=====
Ports
=====

The ``ports`` flow extracts the list of ports from the CROSS-A data, loads it to the ``ports`` table of the Monitorfish database, 
invalidates the ports cache of the backend and updates the open dataset 
`data.gouv.fr <https://www.data.gouv.fr/fr/datasets/liste-des-ports-du-systeme-ers-avec-donnees-de-position/>`__.

It is run manually when needed (when ports have been modified in the CROSS-A database).

The ``ports.py`` module also contains helper flows, run manually, which were used to build the ports referential 
(from UNECE and CIRCABC data, with geocoding).
