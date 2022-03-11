===========================
Deployment & Administration
===========================

----

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


----

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

----

Running the execution service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The execution service can be started with :

.. code-block:: bash

    make run-pipeline-flows-prod

----

Database backup & restore
^^^^^^^^^^^^^^^^^^^^^^^^^

This section explains how to perform and automate full database backups.

Configuration
-------------

* Create a backups folder on the host machine.
* Create ``MONITORFISH_BACKUPS_FOLDER`` entry with the full path to the backups folder in ~/.monitorfish - e.g.g. ``export MONITORFISH_BACKUPS_FOLDER="/backups/"``.
* Create ``MONITORFISH_LOGS_AND_BACKUPS_GID`` entry in ~/.monitorfish with the group that owns the backups folder (the database container with be run with this group so it can write to the backups folder on the host) - e.g.g. ``export MONITORFISH_LOGS_AND_BACKUPS_GID="125"``.
* Make a copy of ``infra/remote/backup/pg_backup.config.template`` and rename it ``pg_backup.config``.
* Optionnally, change the backup parameters in ``pg_backup.config``.

Backup
------

Running the backup script
"""""""""""""""""""""""""

Once the configuration step is done, a backup can be made by running the script at ``infra/remote/backup/pg_backup_rotated.sh``.

This script :

* ``docker execs`` into the database container and makes a full database backup using ``pg_dump``
* outputs :

  * a single ``globals.sql.gz`` file that contains database globals (roles, tablespaces)
  * a ``*.custom`` file (full database dump in compressed `custom` postgres format) for each database on the postgres cluster
* stores these files on the host machine, in a subfolder of the backups folder, named with the date of the backup
* deletes old backups in rotation, keeping daily and weekly backups for as long as specified in the ``pg_backup.config`` file

Automating backups
""""""""""""""""""

To automate backups, add the line ``infra/remote/backup/crontab.txt`` to the crontab file :

.. code-block:: bash

    crontab -e

We recommend running the backup script daily.

Restore
-------

To restore from a backup, see `TimescaleDB documentation <https://legacy-docs.timescale.com/v1.7/using-timescaledb/backup#pg_dump-pg_restore>`_.