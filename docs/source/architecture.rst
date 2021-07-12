============
Architecture
============

The data processing service executes python batch jobs for mostly two things :

* to pull data from external sources into the Monitorfish database (ETL)
* to process data in the Monitorfish database to enrich and update tables that the backend makes available to the frontend through an API

Database schema
---------------

Database tables are created by Flyway migrations in the Kotlin Springboot backend app. Since data processing
jobs executed by the python data ingestion and processing application require tables to already exist and to have the right
columns and data types, it is necessary to keep the Springboot backend and  the python data processing applications "in sync". 
For this reason, both applications should alway be deployed with the **same version number** (see :ref:`environment_variables`).

Orchestration
-------------

Batch jobs are orchestrated by `Prefect <https://prefect.io>`__. For more information see 
`Prefect documentation <https://docs.prefect.io/orchestration/>`__.

A `prefect server` instance has been deployed in the DAM server center and is used to orchestrate data processing 
jobs in Monitorfish. The UI can be accessed at `<http://prefect.csam.e2.rie.gouv.fr/>`__.

Execution
---------

Flows : one for each job
""""""""""""""""""""""""

Batch jobs are written in python as prefect :ref:`flows <flows>` : each flow is responsible
for one particular task, such as updating the ``vessels`` referencial or refreshing the table of ``last_positions``.

Execution in a dockerized service
"""""""""""""""""""""""""""""""""

A dockerized python service runs a `prefect agent <https://docs.prefect.io/orchestration/agents/overview.html>`__,
a small process which queries the prefect server API every second in order to know if any flow must be executed. 
When a flow must be executed, perfect server tells the agent, which spawns a local python process that runs the flow.
