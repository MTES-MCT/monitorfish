<h1 align="center">
  <img src="https://d33wubrfki0l68.cloudfront.net/daf4a5624cac646b0bc921d0a72ae1cf1912b902/35340/img/eig4/monitorfish.png" alt="MonitorFish" title="MonitorFish" height="150px" />
  MonitorFish
</h1>

## Frontend

## Backend

Stack:
- Kotlin
- Spring Boot
- Flyway

### Run

Executing this script will run the backend application and the PostgreSQL database.

```shell
./scripts/run.sh
```

### Test

Executing this script will run all backend-related tests.

```shell
./scripts/test.sh
```

### Local setup of the app in Intellij

Set the VM options to locate the properties files:
```
-Dspring.config.additional-location="</path/to/project/>/infra/"
```

Set a Program argument to select a property file:
```
--spring.profiles.active=local
```

### API Documentation

API docs can be bound at http://localhost:8880/swagger-ui.html#/
