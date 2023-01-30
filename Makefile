INFRA_FOLDER="$(shell pwd)/infra/configurations/"

.PHONY: install init-sig run-front run-back docker-build docker-tag docker-push check-clean-archi test restart-app

# DEV commands
install:
	cd ./frontend && npm i
run-front:
	cd ./frontend && npm start
run-back: run-stubbed-apis
	docker compose up -d --quiet-pull db
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.config.additional-location=$(INFRA_FOLDER)" -Dspring-boot.run.profiles="local"
run-stubbed-apis:
	docker stop cypress-geoserver-monitorenv-stubs-1 || true
	docker compose -f ./frontend/cypress/docker-compose.yml up -d --quiet-pull geoserver-monitorenv-stubs
stop-stubbed-apis:
	docker stop cypress-geoserver-1
erase-db:
	docker compose down
	docker compose -f ./frontend/cypress/docker-compose.yml down -v
check-clean-archi:
	cd backend/tools && ./check-clean-architecture.sh
test: test-back
	cd frontend && CI=true npm run test:unit -- --coverage
test-back: check-clean-archi
	cd backend && ./mvnw clean && ./mvnw test

dev:
	make erase-db
	rm -Rf ./backend/target
	make run-back

# CI commands - app
docker-build:
	docker build --no-cache -f infra/docker/DockerfileBuildApp . -t monitorfish-app:$(VERSION) --build-arg VERSION=$(VERSION) --build-arg ENV_PROFILE=$(ENV_PROFILE) --build-arg GITHUB_SHA=$(GITHUB_SHA)
docker-tag:
	docker tag monitorfish-app:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-push:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-compose-down:
	docker compose -f ./frontend/cypress/docker-compose.yml down -v
docker-compose-up:
	docker compose -f ./frontend/cypress/docker-compose.yml up -d --quiet-pull db
	docker compose -f ./frontend/cypress/docker-compose.yml up --quiet-pull flyway
	docker compose -f ./frontend/cypress/docker-compose.yml up -d --quiet-pull app
	@printf 'Waiting for backend app to be ready'
	@until curl --output /dev/null --silent --fail "http://localhost:8880/bff/v1/healthcheck"; do printf '.' && sleep 1; done

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
	cd infra/remote && docker compose pull && docker compose up -d --build app
restart-remote-app-dev:
	export POSTGRES_USER=postgres && export POSTGRES_PASSWORD=postgres && export POSTGRES_DB=monitorfishdb && cd infra/remote && docker compose pull && docker compose up -d --build app

run-local-app:
	cd infra/local && docker compose up -d
register-pipeline-flows-prod:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/register-flows-prod.sh
register-pipeline-flows-int:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/register-flows-int.sh

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
	poetry run sphinx-build -b gettext -D extensions="sphinx.ext.viewcode","sphinx.ext.napoleon" source pot && \
	poetry run tx config mapping-bulk --project monitorfish --file-extension '.pot' --source-file-dir pot --source-lang en --type PO --expression 'locale/<lang>/LC_MESSAGES/{filepath}/{filename}.po' --execute && \
	poetry run tx push --source
pull-translated-docs-from-transifex:
	cd datascience/docs && \
	poetry run tx pull --all
build-docs-locally:
	cd datascience/docs && \
	poetry run sphinx-build -b html source build/html/en && \
	poetry run sphinx-build -b html -D language=fr source build/html/fr
