Data sources
============

VMS positions
^^^^^^^^^^^^^

VMS positions are received on an API endpoint provided by the Kotlin Springboot backend service.

Logbook xml files
^^^^^^^^^^^^^^^^^

Logbook raw xml files are ingested by the :doc:`flows/logbook` flow from the 
`configured location <https://github.com/MTES-MCT/monitorfish/blob/master/pipeline/config.py>`__ 
where logbook xml files must be deposited.

Databases
^^^^^^^^^

Data is imported - and kept in sync by periodically reimporting data - from these databases :

* The OCAN database for :doc:`flows/vessels`
* The FMC2 database for :doc:`flows/beacons`
* A data warehouse (also developped by the same team : https://github.com/MTES-MCT/fisheries-and-environment-data-warehouse) for :doc:`flows/vessel-profiles`
* The CROSS-A database for :doc:`flows/administrative-areas`, :doc:`flows/facade-areas`, :doc:`flows/ports`, :doc:`flows/regulations`

Credentials for these data sources must be configured for Monitorfish to connect to them. See :ref:`environment_variables`.

Other sources
^^^^^^^^^^^^^

The following sources are also used :

* The `fao.org <https://www.fao.org/>`__ website for FAO areas and species referencials
* The legipeche intranet website is scraped and user for for :doc:`regulations data checkup <flows/regulations-checkup>`
