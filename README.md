# MonitorFish

## Backend

## Run

```shell
./mvnw spring-boot:run -Dspring.config.additional-location=$INFRA_FOLDER -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE
```

### Local setup of the app in Intellij

Set the VM options to locate the properties files:
```
-Dspring.config.additional-location="</path/to/project/>betty/airquality/infra/"
```

Set a Program argument to select a property file:
```
--spring.profiles.active=local
```

Set an environment variables to locate the built frontend:
```
AQ_STATIC_FILES_PATH=</path/to/project/>/ui-angular/dist/ui-livin-airquality
```



## API Documentation

API docs can be bound at http://localhost:8880/swagger-ui.html#/
