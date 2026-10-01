Containerization
================

For each `release <https://github.com/MTES-MCT/monitorfish/releases>`__, 2 docker images are created :

* ``ghcr.io/mtes-mct/monitorfish/monitorfish-app`` : service with back end (Kotlin Spring Boot) and front end (React) apps
* ``ghcr.io/mtes-mct/monitorfish/monitorfish-pipeline-prefect3`` : service with python data ingestion and processing app (Prefect flows)

These two images are pushed to the `Github package registry <https://github.com/orgs/MTES-MCT/packages?repo_name=monitorfish>`__. 

To choose which version to pull from this registry when deploying, set the right :ref:`environment_variables`.
