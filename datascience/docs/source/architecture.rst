============
Architecture
============

The data processing service executes python batch jobs for mostly two things :

* to pull data from external sources into the Monitorfish database (ETL)
* to process data in the Monitorfish database to enrich and update tables that the backend makes available to the frontend through an API

Database schema
---------------

Database tables are created by `Flyway <https://flywaydb.org/>`__ migrations in the Kotlin Springboot backend app. Since data processing
jobs executed by the python data ingestion and processing application require tables to already exist and to have the right
columns and data types, it is necessary to keep the Springboot backend and  the python data processing applications "in sync". 
For this reason, both applications should alway be deployed with the **same version number** (see :ref:`environment_variables`).

Orchestration
-------------

Batch jobs are orchestrated by `Prefect <https://prefect.io>`__. For more information see 
`Prefect documentation <https://docs.prefect.io/orchestration/>`__.

A `prefect server` instance has been deployed in the DAM server center and is used to orchestrate data processing 
jobs in Monitorfish. The UI can be accessed at `<http://prefect.csam.e2.rie.gouv.fr/>`__ and enables 
administrators to view each flow as a diagram of its constituent tasks, to monitor their execution, see 
the logs and debug in case any flow run fails...


Execution
---------

Stack
"""""

The main tools used to extract data, process it in python and load it to the PostgreSQL database of Monitorfish are :

* python 3.8.7
* `SQLAlchemy <https://www.sqlalchemy.org/>`__ as a python SQL toolkit to interact with SQL databases
* Database adapters `cx_Oracle <https://oracle.github.io/python-cx_Oracle/>`__ and  `psycopg2 <https://github.com/psycopg/psycopg2/>`__ for 
  connectivity to Oracle and PostgreSQL databases respectively
* `pandas <https://pandas.pydata.org/>`__ for data manipulation in python
* the `prefect python library <https://github.com/prefecthq/prefect>`__ to write batch jobs as flows of tasks

Flows : one for each job
""""""""""""""""""""""""

Batch jobs are written in python as prefect :ref:`flows <flows>` : each flow is responsible
for one particular task, such as updating the ``vessels`` referencial or refreshing the table of ``last_positions``.

Execution in a dockerized service
"""""""""""""""""""""""""""""""""

A dockerized python service runs a `prefect agent <https://docs.prefect.io/orchestration/agents/overview.html>`__,
a small process which queries the API of the  prefect server orchestrator every second in order to know if any flow must be executed. 
When a flow must be executed, perfect server tells the agent, which spawns a local python process that runs the flow.
