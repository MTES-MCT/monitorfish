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
* Set the ``MONITORFISH_VERSION`` environment variable. This will determine which docker imaged to pull when running ```make`` commands.

ERS files
"""""""""

ERS raw xml files are ingested by the ERS flow from the configured ``ERS_FILES_LOCATION`` in ``datascience/config.py``. 
In order to make ERS data available to Monitorfish, ERS files should therefore be deposited in this directory.

Running the database service
----------------------------

The Monitorfish database must be running for data processing operations to be carried out. For this, run the backend service first.

Running the orchestration service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The orchestration service can be start with :

.. code-block:: bash

    make run-pipeline-server-prod
 

Running the execution service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^