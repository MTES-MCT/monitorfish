INFRA_FOLDER="$(shell pwd)/infra/configurations/"

.PHONY: install init-sig run-front run-back docker-build docker-tag docker-push check-clean-archi test restart-app data_science update_data_science_environment

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
	cd backend && ./mvnw clean && ./mvnw test
	cd frontend && CI=true npm test
test-front:
	cd frontend && npm test
	
# CI commands
docker-build:
	docker build --no-cache -f infra/docker/DockerfileBuildApp . -t monitorfish-app:$(VERSION) --build-arg VERSION=$(VERSION) --build-arg GITHUB_SHA=$(GITHUB_SHA)
docker-tag:
	docker tag monitorfish-app:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-push:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)

# RUN commands
init-local-sig:
	./infra/local/postgis_insert_layers.sh && ./infra/init/geoserver_init_layers.sh
init-remote-sig:
	./infra/remote/postgis_insert_layers.sh && ./infra/init/geoserver_init_layers.sh
restart-remote-app:
	cd infra/remote && sudo docker-compose pull && sudo docker-compose up -d --build app
run-local-app:
	cd infra/local && sudo docker-compose up -d

# DATA commands
run-jupyter-notebook:
	docker-compose -f datascience/docker-compose.yml up --force-recreate
run-jupyter-notebook-no-proxy:
	docker-compose -f datascience/docker-compose-no-proxy.yml up --force-recreate
run-jupyter-notebook-dam-si:
	docker-compose -f datascience/docker-compose-dam-si.yml up --force-recreate
run-data-science-env:
	docker-compose -f datascience/docker-compose.yml up --force-recreate -d
	docker exec -it monitorfish_data_science bash
run-data-science-env-no-proxy:
	docker-compose -f datascience/docker-compose-no-proxy.yml up --force-recreate -d
	docker exec -it monitorfish_data_science bash
run-data-science-env-dam-si:
	docker-compose -f datascience/docker-compose-dam-si.yml up --force-recreate -d
	docker exec -it monitorfish_data_science_dam_si bash
update-data-science-env:
	docker-compose -f datascience/docker-compose.yml up --force-recreate -d
	docker container exec monitorfish_data_science conda env update -n base -f "work/datascience/environment.yml"
	docker container commit monitorfish_data_science monitorfish_data_science
update-data-science-env-no-proxy:
	docker-compose -f datascience/docker-compose-no-proxy.yml up --force-recreate -d
	docker container exec monitorfish_data_science conda env update -n base -f "work/datascience/environment.yml"
	docker container commit monitorfish_data_science monitorfish_data_science
update-data-science-env-dam-si:
	docker-compose -f datascience/docker-compose-dam-si.yml up --force-recreate -d
	docker container exec monitorfish_data_science_dam_si conda env update -n base -f "work/datascience/environment.yml"
	docker container commit monitorfish_data_science_dam_si monitorfish_data_science_dam_si
