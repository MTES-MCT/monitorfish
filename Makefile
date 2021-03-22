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

# CI commands - app
docker-build:
	docker build --no-cache -f infra/docker/DockerfileBuildApp . -t monitorfish-app:$(VERSION) --build-arg VERSION=$(VERSION) --build-arg GITHUB_SHA=$(GITHUB_SHA)
docker-tag:
	docker tag monitorfish-app:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-push:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)

# CI commands - data pipeline
docker-build-pipeline:
	docker build -f "infra/docker/Dockerfile.DataPipeline" . -t monitorfish-pipeline:$(VERSION)
docker-test-pipeline:
	docker run monitorfish-pipeline:$(VERSION) coverage run -m unittest discover
docker-tag-pipeline:
	docker tag monitorfish-pipeline:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(VERSION)
docker-push-pipeline:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(VERSION)

# RUN commands
init-local-sig:
	./infra/local/postgis_insert_layers.sh && ./infra/init/geoserver_init_layers.sh
init-remote-sig:
	./infra/remote/postgis_insert_layers.sh && ./infra/init/geoserver_init_layers.sh
restart-remote-app:
	cd infra/remote && sudo docker-compose pull && sudo docker-compose up -d --build app
run-local-app:
	cd infra/local && sudo docker-compose up -d
run-pipeline-server-prod:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION)
	infra/remote/data-pipeline/prod/start-server.sh
run-pipeline-server-int:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION)
	infra/remote/data-pipeline/int/start-server.sh
run-pipeline-flows-prod:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/prod/start-flows.sh
run-pipeline-flows-int:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/int/start-flows.sh
stop-pipeline-server:
	infra/remote/data-pipeline/stop-server.sh
stop-pipeline-flows:
	docker container stop monitorfish-pipeline-flows; docker container rm monitorfish-pipeline-flows;

# DATA commands
install-pipeline:
	cd datascience && poetry install
run-notebook:
	cd datascience && poetry run jupyter notebook
test-pipeline:
	cd datascience && poetry run coverage run -m unittest discover && poetry run coverage report && poetry run coverage html
