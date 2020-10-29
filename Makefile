INFRA_FOLDER="$(shell pwd)/infra/configurations/"

.PHONY: install init-sig run-front run-back docker-build docker-tag docker-push check-clean-archi test restart-app

# DEV commands
install:
	cd frontend && npm install
run-front:
	cd frontend && npm start
run-back:
	docker-compose up -d
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.config.additional-location=$(INFRA_FOLDER)" -Dspring-boot.run.profiles="local"
erase-db:
	docker-compose down
	docker volume rm monitorfish_db-data
check-clean-archi:
	cd backend/tools && ./check-clean-architecture.sh
test: check-clean-archi
	cd backend && ./mvnw test

# CI commands
docker-build:
	docker build --no-cache -f infra/docker/DockerfileBuildApp . -t monitorfish-app:$(VERSION)
docker-tag:
	docker tag monitorfish-app:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-push:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)

# RUN commands
init-local-sig:
	./init/geoserver_init_layers.sh && ./local/postgis_insert_layers.sh
init-remote-sig:
	./init/geoserver_init_layers.sh && ./remote/postgis_insert_layers.sh
restart-remote-app:
	cd infra/remote && sudo docker-compose pull && sudo docker-compose up -d --build app
ruu-local-app:
	cd infra/local && sudo docker-compose up -d