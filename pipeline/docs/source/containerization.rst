Containerization
================

For each `release <https://github.com/MTES-MCT/monitorfish/releases>`__, 2 docker images are created :

* ``monitorfish_app`` : service with back end (Kotlin Springboot) and front end (React) apps
* ``monitorfish_pipeline`` : service with python data ingestion and processing app

These two images are pushed to the `Github package regitry <https://github.com/orgs/MTES-MCT/packages?repo_name=monitorfish>`__. 

To choose which version to pull from this registry when deploying, set the right :ref:`environment_variables`.