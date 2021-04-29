<h1 align="center">
  <img src="https://d33wubrfki0l68.cloudfront.net/daf4a5624cac646b0bc921d0a72ae1cf1912b902/35340/img/eig4/monitorfish.png" alt="MonitorFish" title="MonitorFish" height="150px" />
  MonitorFish
</h1>

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=MTES-MCT_monitorfish&metric=alert_status)](https://sonarcloud.io/dashboard?id=MTES-MCT_monitorfish) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Improve monitoring and controlling of the activities of fishing vessels

**Notice**: To clone the repo without downloading large layers files, execute: `GIT_LFS_SKIP_SMUDGE=1 git clone <REPO>` as we use [Git LFS](https://git-lfs.github.com/) to manage large layers files.
## Stack

Frontend:
- Openlayers
- React

Backend:
- Kotlin
- Spring Boot
- Flyway (database migration)
- PostgreSQL with PostGIS/TimescaleDB
- Tomcat (version 9.0.37)

Data processing & ETL:
- python 3.8
- [pandas](https://pandas.pydata.org/)
- [prefect](https://docs.prefect.io/core/) (ETL)


## Install

To install dependencies, execute:
```shell
make install
```

## Run

To run the frontend for development purpose, open a terminal and execute:
```shell
make run-front
```

To run the backend for development purpose (with hot-reload), open another terminal and execute:
> During the first run, dependencies will be downloaded
```shell
make run-back
```

Then, insert the GIS layers to the postgres database by executing (make sure you have `psql` installed):
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

Finally add to Geoserver the layers by executing (make sure to remove your proxy if you have one configured with `unset HTTP_PROXY` and `unset http_proxy`):
```shell
./infra/init/geoserver_init_layers.sh
```

### Test

To run all tests and checks clean architecture principles are respected, execute:
```shell
make test
```

To manually add a VMS position (in NAF format) for the vessel `CABO ARTA`:
```
curl --data '//SR//AD/FRA//FR/NLD//RD/20210431//NA/CABO ARTA//RT/2133//FS/NLD//RC/PCVC//XR/FG78//IR/XXX2545115//DA/20210431//TI/2130//LT/55.099//LG/3.869//SP/0//CO/173//TM/POS//ER//'  -X POST http://localhost:8880/api/v1/positions -H "Content-Type:application/text"
```

### API Documentation

API documentation can be found at http://localhost:8880/swagger-ui.html

## Data pipeline and data science environment

Data processing and ETL (Extract, Transform, Load) operations are done in a dockerized python service using [prefect](https://docs.prefect.io/core/) and [pandas](https://pandas.pydata.org/).

### Dependencies
* On Linux, the following packages are required :
    * libpq-dev, a C compiler (from build-essential for instance) and libaio1 :
        ```
        apt-get update
        apt-get install libpq-dev build-essential libaio1 
        ```
    * [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/downloads.html).
* The project runs on python 3.8.7. To manage python versions, we suggest you use [pyenv](https://github.com/pyenv/pyenv). See the official documentation for installation instructions.
* Python dependencies are separated between :
    * production dependencies, listed in *requirements.txt*, are the dependencies of the dockerized python service which runs ETL jobs
    * development dependencies, listed in *requirements-dev.txt*, which are commonly use in data analysis
* In the dockerized service that runs ETL jobs, these dependencies are `pip` installed in a virtual environment.
* For development, we suggest managing Python dependencies with [poetry](https://python-poetry.org/).
    * To install poetry, run:
        ```
        curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python3 -

        ```
    * Then, within the `datascience` folder, install python dependencies with :
        ```
        poetry install
        ```
    * To install pre-commit hooks (isort, black and flake8 are configured in the pyproject.toml), run
        ```
        poetry run pre-commit install
        ``` 

### Jupyter notebook & Jupyter Lab

Jupyter notebook is installed as a development dependency.

### Tests
To run tests on the data pipeline, run
```
make test-data-pipeline
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
