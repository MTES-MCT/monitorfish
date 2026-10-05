Data sources
============

VMS positions
^^^^^^^^^^^^^

VMS positions are received on an API endpoint (``POST /api/v1/positions``, NAF format) provided by the Kotlin Spring Boot 
backend service, and enriched by the :doc:`flows/enrich-positions` flow.

AIS positions
^^^^^^^^^^^^^

AIS positions are consumed by the backend from a Kafka topic, and aggregated by the :doc:`flows/last-positions` flow.

Logbook and sales notes files
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Logbook (ERS and FLUX formats) and sales notes raw xml files are ingested by the :doc:`flows/sales-and-logbook` flow from the 
`configured location <https://github.com/MTES-MCT/monitorfish/blob/master/pipeline/config.py>`__ 
where zip files must be deposited.

Databases
^^^^^^^^^

Data is imported - and kept in sync by periodically reimporting data - from these databases :

* The OCAN database for :doc:`flows/vessels`
* The FMC2 database for :doc:`flows/beacons`, :doc:`flows/infractions`, :doc:`flows/foreign-fmcs` and legacy :doc:`flows/controls`
* A data warehouse (also developped by the same team : https://github.com/MTES-MCT/fisheries-and-environment-data-warehouse) for 
  :doc:`flows/vessel-profiles`, :doc:`flows/activity-visualizations`, :doc:`flows/risk-elements` and :doc:`flows/trips-snapshot`
* The CROSS-A database for :doc:`flows/administrative-areas`, :doc:`flows/facade-areas`, :doc:`flows/ports`, :doc:`flows/regulations`
* The Monitorenv database for :doc:`flows/missions` and :doc:`flows/control-units`

Credentials for these data sources must be configured for Monitorfish to connect to them. See :ref:`environment_variables`.

Other sources
^^^^^^^^^^^^^

The following sources are also used :

* The Monitorenv API, read by the backend for missions, control units and stations (see :ref:`integrations`)
* The `FAO geoserver <https://www.fao.org/fishery/geoserver/fifao/ows>`__ for :doc:`flows/fao-areas`
* Open datasets on `data.gouv.fr <https://www.data.gouv.fr>`__ for :doc:`flows/species` and :doc:`flows/anchorages`
* Hard coded csv files (``pipeline/src/data/``) for :doc:`flows/districts`, :doc:`flows/fishing-gears`, :doc:`flows/species-groups`, 
  :doc:`flows/init-pno-types` and :doc:`flows/init-infraction-threat-characterization`
* The legipeche intranet website is scraped and used for :doc:`regulations data checkup <flows/regulations-checkup>`

Data publication
^^^^^^^^^^^^^^^^

Monitorfish publishes the following open datasets :

* ports : :doc:`flows/ports`
* control statistics and fleet segments : :doc:`flows/controls-open-data`
* regulated fishing areas, on data.gouv.fr and the Géoplateforme : :doc:`flows/regulations-open-data`
