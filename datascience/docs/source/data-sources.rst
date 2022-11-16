External data sources
=====================

VMS positions
^^^^^^^^^^^^^

VMS positions are received on an API endpoint provided by the Kotlin Springboot backend service.

Logbook xml files
^^^^^^^^^^^^^^^^^

Logbook raw xml files are ingested by the :doc:`flows/logbook` flow from the 
`configured location <https://github.com/MTES-MCT/monitorfish/blob/master/datascience/config.py>`__ 
where logbook xml files must be deposited.

Databases
^^^^^^^^^

Data is imported (and constantly updated) from external databases for :doc:`flows/controls`, :doc:`flows/controllers`, :doc:`flows/fishing-gears` and :doc:`flows/vessels`.

These databases are :

* OCAN
* FMC2

Credentials for these data sources must be configured for Monitorfish to connect to them. See :ref:`environment_variables`.