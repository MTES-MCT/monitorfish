INFRA_FOLDER="$(shell pwd)/infra/configurations/"

.PHONY: install init-sig run-front run-back docker-build docker-tag docker-push check-clean-archi test restart-app

# DEV commands
install:
	cd frontend && npm install
run-front:
	cd frontend && npm start
run-back:
	docker compose up -d
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.config.additional-location=$(INFRA_FOLDER)" -Dspring-boot.run.profiles="local"
erase-db:
	docker compose down
	docker volume rm monitorfish_db-data
check-clean-archi:
	cd backend/tools && ./check-clean-architecture.sh
test: check-clean-archi
	cd backend && ./mvnw clean && ./mvnw test
	cd frontend && CI=true npm test
dev:
	docker network inspect monitorfish_network >/dev/null 2>&1 || docker network create monitorfish_network
	docker compose -f ./infra/dev/docker-compose.yml up -d app
	sh -c 'make run-front'
dev-erase:
	docker compose -f ./infra/dev/docker-compose.yml down -v
dev-reset:
	rm -f ./frontend/cypress/downloads/*
	docker compose -f ./infra/dev/docker-compose.yml stop app geoserver
	docker compose -f ./infra/dev/docker-compose.yml exec db \
		psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS  monitorfishdb;"
	docker compose -f ./infra/dev/docker-compose.yml exec db \
		psql -U postgres -d postgres -c "CREATE DATABASE monitorfishdb;"
	docker compose -f ./infra/dev/docker-compose.yml up flyway
	docker compose -f ./infra/dev/docker-compose.yml start app
	docker compose -f ./infra/dev/docker-compose.yml logs -f app
dev-stop:
	docker compose -f ./infra/dev/docker-compose.yml down

# CI commands - app
docker-build:
	docker build --no-cache -f infra/docker/DockerfileBuildApp . -t monitorfish-app:$(VERSION) --build-arg VERSION=$(VERSION) --build-arg ENV_PROFILE=$(ENV_PROFILE) --build-arg GITHUB_SHA=$(GITHUB_SHA)
docker-tag:
	docker tag monitorfish-app:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-push:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-compose-up:
	export MONITORFISH_VERSION=$(VERSION) && cd frontend/cypress && docker-compose up -d

# CI commands - data pipeline
docker-build-pipeline:
	docker build -f "infra/docker/Dockerfile.DataPipeline" . -t monitorfish-pipeline:$(VERSION)
docker-test-pipeline:
	docker run --network host -v /var/run/docker.sock:/var/run/docker.sock -u monitorfish-pipeline:$(DOCKER_GROUP) --env-file datascience/.env.test monitorfish-pipeline:$(VERSION) coverage run -m pytest --pdb tests
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
	cd infra/remote && docker-compose pull && docker-compose up -d --build app
restart-remote-app-dev:
	export POSTGRES_USER=postgres && export POSTGRES_PASSWORD=postgres && export POSTGRES_DB=monitorfishdb && cd infra/remote && docker-compose pull && docker-compose up -d --build app

run-local-app:
	cd infra/local && docker-compose up -d
register-pipeline-flows-prod:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/prod/register-flows.sh
register-pipeline-flows-int:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/int/register-flows.sh
stop-pipeline-server:
	infra/remote/data-pipeline/stop-server.sh

# DATA commands
install-pipeline:
	cd datascience && poetry install
test-pipeline:
	cd datascience && export TEST_LOCAL=True && poetry run coverage run -m pytest --pdb tests/ && poetry run coverage report && poetry run coverage html
update-python-dependencies:
	cd datascience && poetry export --without-hashes -o requirements.txt && poetry export --without-hashes --dev -o requirements-dev.txt

# DOC commands
push-docs-to-transifex:
	cd datascience/docs && \
	poetry run sphinx-build -b gettext source pot && \
	poetry run tx config mapping-bulk --project monitorfish --file-extension '.pot' --source-file-dir pot --source-lang en --type PO --expression 'locale/<lang>/LC_MESSAGES/{filepath}/{filename}.po' --execute && \
	poetry run tx push --source
pull-translated-docs-from-transifex:
	cd datascience/docs && \
	poetry run tx pull --all
build-docs-locally:
	cd datascience/docs && \
	poetry run sphinx-build -b html source build/html/en && \
	poetry run sphinx-build -b html -D language=fr source build/html/fr
