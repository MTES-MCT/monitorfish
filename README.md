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

### Test

To run all tests and checks clean architecture principles are respected, execute:
```shell
make test
```

### API Documentation

API documentation can be found at http://localhost:8880/swagger-ui.html

