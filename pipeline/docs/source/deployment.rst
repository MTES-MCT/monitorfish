===========================
Deployment & Administration
===========================

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

* A ``.env`` file must be created in the ``pipeline`` folder, with all the variables listed in ``pipeline/.env.template`` filled in.
* A ``~/.monitorfish`` file must define the variables listed in ``pipeline/.monitorfish.template`` :

  * ``MONITORFISH_VERSION`` : determines which docker images to pull when running ``make`` commands. The backend and 
    the data pipeline must always be deployed with the same version (see :ref:`data-pipeline`).
  * ``PREFECT_API_URL`` : the URL of the Prefect server API (e.g. ``http://<prefect-host>:4200/api``)
  * ``LOGBOOK_FILES_GID`` : the group that owns the logbook files folder, so that flows can read and move logbook files

Logbook files
"""""""""""""

Logbook (ERS / FLUX) and sales notes zip files are ingested by the :doc:`flows/sales-and-logbook` flow from the 
``received`` subfolder of ``ERS_FILES_LOCATION`` (configured in ``pipeline/config.py``). In order to make logbook 
data available to Monitorfish, the zip files should therefore be deposited in this directory.

Running the app and database services
--------------------------------------

The Monitorfish database (``db``) and the app (``app``, backend and frontend) are defined in ``infra/remote/docker-compose.yml``. 
The app can be (re)started in the version set by ``MONITORFISH_VERSION`` with :

.. code-block:: bash

    make restart-remote-app

The Monitorfish database must be running for data processing operations to be carried out. Database migrations are run 
by the backend at startup : the backend must therefore be started (or upgraded) before the data pipeline flows are deployed.

Unhealthy containers can be restarted automatically by adding the line in ``infra/remote/crontab.txt`` to the crontab file.

----

Running the orchestration service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Starting the Prefect server
---------------------------

The Prefect 3 server (API, UI and its own Postgres database) is defined in ``infra/prefect_3_server`` :

1. Copy ``infra/prefect_3_server/.env.template`` and rename the copy ``.env``.
2. Fill in the variables in the ``.env`` file.
3. Run ``docker compose up -d`` in ``infra/prefect_3_server``.

The Prefect UI is then available on port 4200.

Automating log cleaning
-----------------------

Logs of past flow runs are stored in the Postgres database of the Prefect server.
In order to keep the size of this database low, it is necessary to set up a cron job to delete old flow runs, logs and events.

The script ``infra/prefect_3_server/truncate-prefect-logs.sh`` goes into the ``prefect-db`` container with ``docker exec`` 
and runs ``DELETE`` queries on old data.

This script can be run daily by setting up a cron job, for instance by adding a line to the crontab file :

.. code-block:: bash

    crontab -e

then add the line in ``infra/prefect_3_server/crontab.txt`` (after updating the script location as needed) in the crontab file.

----

Running the execution service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Starting the Prefect worker
---------------------------

Flows are executed by a Prefect `docker worker <https://docs.prefect.io/v3/concepts/workers>`__ which polls the 
``monitorfish`` work pool of the Prefect server and runs each flow in an ephemeral container of the 
``monitorfish-pipeline-prefect3`` image.

The worker runs as a systemd service :

1. Install ``prefect`` (with the ``docker`` extra) in a python virtual environment on the host.
2. Copy ``infra/remote/data-pipeline-prefect3/.prefect-worker.template`` to ``~/.prefect-worker`` and fill in the Prefect server URL.
3. Copy ``infra/remote/data-pipeline-prefect3/prefectworker.sh`` and ``prefectworker.service``, fill in the user, 
   script and virtual environment locations, then install and enable the service :

.. code-block:: bash

    sudo cp prefectworker.service /etc/systemd/system/
    sudo systemctl enable --now prefectworker

Deploying the flows
-------------------

Flows and their schedules (defined in ``pipeline/src/deployments.py``) are deployed to the Prefect server with :

.. code-block:: bash

    make deploy-pipeline-flows

This pulls the ``monitorfish-pipeline-prefect3`` image of version ``MONITORFISH_VERSION`` and runs 
``infra/remote/data-pipeline-prefect3/deploy-flows.sh``. It must be run again after each upgrade of ``MONITORFISH_VERSION``.

----

Database backup & restore
^^^^^^^^^^^^^^^^^^^^^^^^^

This section explains how to perform and automate full database backups.

Configuration
-------------

* Create a backups folder on the host machine.
* Create ``MONITORFISH_BACKUPS_FOLDER`` entry with the full path to the backups folder in ~/.monitorfish - e.g. ``export MONITORFISH_BACKUPS_FOLDER="/backups/"``.
* Create ``MONITORFISH_GIT_FOLDER`` entry in ~/.monitorfish with the full path to the cloned repository - e.g. ``export MONITORFISH_GIT_FOLDER="/home/monitorfish/monitorfish"``.
* Create ``MONITORFISH_LOGS_AND_BACKUPS_GID`` entry in ~/.monitorfish with the group that owns the backups folder (the database container will be run with this group so it can write to the backups folder on the host) - e.g. ``export MONITORFISH_LOGS_AND_BACKUPS_GID="125"``.
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