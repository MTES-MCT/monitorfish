External data sources
=====================

Poséidon positions
^^^^^^^^^^^^^^^^^^

VMS positions are received from the ``Poséidon`` application on an API endpoint provided by the Kotlin Springboot backend service.

ERS xml files
^^^^^^^^^^^^^

ERS raw xml files are ingested by the :ref:`ERS` from the 
`configured location <https://github.com/MTES-MCT/monitorfish/blob/master/datascience/config.py>`__.

Databases
^^^^^^^^^
* OCAN
* FMC2

Credentials for these data sources must be configured for Monitorfish to connect to them. See :ref:`environment_variables`.