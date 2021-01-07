<h1 align="center">
  <img src="https://d33wubrfki0l68.cloudfront.net/daf4a5624cac646b0bc921d0a72ae1cf1912b902/35340/img/eig4/monitorfish.png" alt="MonitorFish" title="MonitorFish" height="150px" />
  MonitorFish
</h1>

> Improve monitoring and controlling of the activities of fishing vessels

**Notice**: To clone the repo without downloading large layers files, execute: `GIT_LFS_SKIP_SMUDGE=1 git clone <REPO>` as we use [Git LFS](https://git-lfs.github.com/) to manage large layers files.
## Frontend

Stack:
- Openlayers
- React

## Install

To install dependencies, execute:
```shell
make install
```

## Run

To run the frontend for development purpose, execute:
```shell
make run-front
```

## Backend

Stack:
- Kotlin
- Spring Boot
- Flyway (DB Migration)
- PostgreSQL with PostGIS/TimescaleDB

### Run

> During the first run, dependencies will be downloaded

To run the backend for development purpose (with hot-reload), execute:
```shell
make run-back
```

Then, insert the GIS layers to the postgres database by executing:
```shell
./infra/remote/postgis_insert_layers.sh
```

export the required environment variables:
```
export DB_HOST=0.0.0.0
export DB_NAME=monitorfishdb
export DB_SCHEMA=public
export DB_USER=postgres
export DB_PASSWORD=postgres
```

And add to Geoserver the layers by executing (make sure to remove your proxy if you have one configured with `unset HTTP_PROXY` and `unset http_proxy`):
```shell
./infra/init/geoserver_init_layers.sh
```

### Test

To run all tests and checks clean architecture principles are respected, execute:
```shell
make test
```

### API Documentation

API documentation can be found at http://localhost:8880/swagger-ui.html

## Data science

Data analysis and visualization is performed in a dockerized environment. Inside the docker environment :
* python 3.8 is installed in the `base` conda environment with commonly used libraries for geo data analysis (geopandas, plotly...)
* this repository is bind-mounted at `/home/jovyan/work`.
* Notebooks (stored in `/home/jovyan/work/notebooks`) can therefore access and import code from the `/home/jovyan/work/datascience/src` directory where code worth keeping - helper functions, data processing steps... - is kept

### Running a notebook in the data science environment
To start a jupyter notebook in the data science environment, execute :
```shell
make run-jupyter-notebook
```

In this environment, `http_proxy` and `https_proxy` environment variables are set to access the Internet through the RIE proxy.

To start a jupyter notebook without proxy configuration (e.g. when connected to the Internet from outside the RIE network, for exemple when using a shared connection from a cell phone):

```shell
make run-jupyter-notebook-no-proxy
```

### Installing new packages in the data science environment
To install packages, the conda package manager is set up to use the conda-forge channel with `channel_priority: strict`. In order to avoid dependency conflits, it is recommended to install only packages from the conda-forge repository.

To install a new python package in the conda environment:
1. Check the exact name of the package in the [conda-forge repository](https://anaconda.org/conda-forge)
2. Add the package name to the `datascience/environment.yml` file and save the file.
3. Execute :
```shell
make update-data-science-env
```
This will :
* start the data science docker environment (if one is already running, it will spawn a new container)
* read the `environment.yml` file (which is accessible since `datascience` is bind-mounted into the docker container) where the newly added package will be detected
* install the package in the conda environment
* update the docker image

This can be performed even as the environment is up and running. For instance, if, while exploring a dataset in a Jupyter Notebook running in the data science environment, you realize that you need a package that is not installed: 
* add the package to the `environment.yml` file
* open a new shell in the repository and run `make update-data-science-env`.

This will start a second container next to the one where the notebook is running, install the package, commit the changes to the docker image, and the container in which the notebook is running will pick up the update and make the package available without requiring the environment and the notebook to be restarted.

### Getting a shell in the data science environment
To run a bash shell in the data science environment, after cloning the repo, execute :
```bash
make run-data-science-env
```
Or, if connecting from outside the RIE network:
```bash
make run-data-science-env-no-proxy
```

### Data
Data is currently not open and can only be accessed from inside the RIE network.

### Problems & solutions

```
Windows & Docker
Problem :
    During the build, there is an error while seting up docker which is used for the test database
Explanation :
    Testing uses docker. To be able to connect to docker, Intellij requires that TLS is disabled in docker.
Solution :
    Open docker Configuration, General and click on "Expose Daemon on xxxx Witout TLS"
```

```
Problem:
    Running the application with IntelliJ does not work. Spring complains about a BuildProperties beans that is missing
Explanation:
    The buildProperties bean is constructed based on the META-INF/build-info.properties file.
    This file is generated by Maven, but not by IntelliJ
Solution:
    Tell IntelliJ to delegate the build to maven. To do this you must:
        1- go to Build,Execution,Deployment> Build Tools > Maven > Runner
        2- click the checkbox : "Delegate IDE Build/run actions to maven"
```
