==========
Deployment
==========

Prerequisites
^^^^^^^^^^^^^

Dependencies
------------

The following dependencies must be installed on the production machine :

* `git <https://git-scm.com/>`__
* `docker <https://docs.docker.com/get-docker/>`__
* `make <https://www.gnu.org/software/make/>`__

Configuration
-------------

Cloning the repository
""""""""""""""""""""""

Clone the repo with :

.. code-block:: bash

    git clone https://github.com/MTES-MCT/monitorfish.git

.. _environment_variables:

Environment variables
"""""""""""""""""""""

* A ``.env`` file must be created in the ``datascience`` folder, with all the variables listed in ``.env.template`` filled in.
* Set the ``MONITORFISH_VERSION`` environment variable. This will determine which docker images to pull when running ```make`` commands.

ERS files
"""""""""

ERS raw xml files are ingested by the ERS flow from the configured ``ERS_FILES_LOCATION`` in ``datascience/config.py``. 
In order to make ERS data available to Monitorfish, ERS files should therefore be deposited in this directory.

Running the database service
----------------------------

The Monitorfish database must be running for data processing operations to be carried out. For this, run the backend service first.

Running the orchestration service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Starting the Prefect server orchestrator
----------------------------------------

The orchestration service can be started with :

.. code-block:: bash

    make run-pipeline-server-prod
 

Automating log cleaning
-----------------------

Logs of past flow runs are stored in a Postgres database that is part of the prefect server architecture.
In order to keep the size of this database low, it is necessary to set up a cron job to delete old flow runs.

The Prefect server database runs in a Docker container. The script ``infra/remote/data-pipeline/truncate-old-prefect-logs.sh`` goes into that container with ``docker exec`` and runs a ``DELETE`` query to delete old flow_runs.

This query can be run daily by setting up a cron job, for instance by adding a line to the crontab file :

.. code-block:: bash

    crontab -e

then add the line in ``infra/remote/data-pipeline/crontab.txt`` (after updating the scripts and logs locations as needed) in the crontab file.

Running the execution service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The execution service can be started with :

.. code-block:: bash

    make run-pipeline-flows-prod