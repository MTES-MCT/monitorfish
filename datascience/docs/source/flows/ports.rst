=====
Ports
=====

The ``ports`` flow extracts the list of ports from 
`data.gouv.fr <https://www.data.gouv.fr/fr/datasets/liste-des-ports-du-systeme-ers-avec-donnees-de-position/>`__.
and loads it to the ``ports`` table of the Monitorfish database.

It is not scheduled to run and it only required to run when the list of ports has been
manually updated on data.gouv.fr by the development team.