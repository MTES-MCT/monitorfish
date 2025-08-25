INFRA_FOLDER="$(shell pwd)/infra/configurations/"
HOST_MIGRATIONS_FOLDER=$(shell pwd)/backend/src/main/resources/db/migration
DATA_WAREHOUSE_INPUT_DATA_FOLDER=$(shell pwd)/pipeline/tests/test_data/clickhouse_user_files
EXTERNAL_DATA_FOLDER=$(shell pwd)/datascience/tests/test_data/external
EXTERNAL_DATA_FOLDER_PREFECT_3=$(shell pwd)/pipeline/tests/test_data/external
PIPELINE_TEST_ENV_FILE=$(shell pwd)/pipeline/.env.test

SHELL := /bin/bash
.SHELLFLAGS = -ec
.SILENT:
MAKEFLAGS += --silent
.ONESHELL:

.DEFAULT_GOAL: help

.PHONY: help ##OTHER 🛟 To display this prompts. This will list all available targets with their documentation
help:
	echo "❓ Use \`make <target>' where <target> is one of 👇"
	echo ""
	echo -e "\033[1mLocal Development\033[0m:"
	grep -E '^\.PHONY: [a-zA-Z0-9_-]+ .*?##LOCAL' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = "(: |##LOCAL)"}; {printf "\033[36m%-30s\033[0m %s\n", $$2, $$3}'
	echo ""
	echo -e "\033[1mTesting\033[0m:"
	grep -E '^\.PHONY: [a-zA-Z0-9_-]+ .*?##TEST' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = "(: |##TEST)"}; {printf "\033[36m%-30s\033[0m %s\n", $$2, $$3}'
	echo ""
	echo -e "\033[1mCommands for RUN (STAGING and PROD)\033[0m:"
	grep -E '^\.PHONY: [a-zA-Z0-9_-]+ .*?##RUN' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = "(: |##RUN)"}; {printf "\033[36m%-30s\033[0m %s\n", $$2, $$3}'
	echo ""
	echo -e "\033[1mOther commands\033[0m:"
	grep -E '^\.PHONY: [a-zA-Z0-9_-]+ .*?##OTHER' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = "(: |##OTHER)"}; {printf "\033[36m%-30s\033[0m %s\n", $$2, $$3}'
	echo ""
	echo "Tips 💡"
	echo "	- use tab for auto-completion"
	echo "	- use the dry run option '-n' to show what make is attempting to do. example: environmentName=dev make -n deploy"

docker-env:
	cd ./infra/docker && ../../frontend/node_modules/.bin/import-meta-env-prepare -u -x ./.env.local.defaults\


################################################################################
# Local Development

.PHONY: check-clean-archi ##LOCAL Check clean architecture imports
check-clean-archi:
	cd backend/tools && ./check-clean-architecture.sh

.PHONY: clean ##LOCAL Clean all backend assets and stop docker containers
clean: docker-env
	rm -Rf ./backend/target
	docker compose down -v
	docker compose --env-file ./infra/docker/.env -f ./infra/docker/docker-compose.monitorenv.dev.yml down -v
	docker compose --env-file ./infra/docker/.env -f ./infra/docker/docker-compose.cypress.yml down -v
	docker compose -f ./infra/docker/docker-compose.puppeteer.yml down -v

.PHONY: generate-test-data ##LOCAL Generate test data (SQL files from .jsonc)
generate-test-data:
	cd frontend && npm run generate:testdata

compile-back:
	cd backend && ./gradlew assemble

init-local-sig:
	./infra/local/postgis_insert_layers.sh && ./infra/init/geoserver_init_layers.sh

.PHONY: install-front ##LOCAL ⬇️  Install frontend dependencies
install-front:
	cd ./frontend && npm i

.PHONY: run-back ##LOCAL ▶️  Run backend API
run-back: run-stubbed-apis
	docker compose up -d --quiet-pull --wait db keycloak
	cd backend && ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

.PHONY: run-front ##LOCAL ▶️  Run frontend for development
run-front:
	cd ./frontend && npm run dev

.PHONY: run-back-with-monitorenv ##LOCAL ▶️  Run backend API when running MonitorEnv app (in another terminal)
run-back-with-monitorenv: run-monitorenv
	docker compose up -d --quiet-pull --wait db
	cd backend && MONITORENV_URL=http://localhost:9880 ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

.PHONY: run-monitorenv ##LOCAL ▶️  Run MonitorEnv app containers
run-monitorenv: docker-env
	docker compose \
		--project-directory ./infra/docker \
		--env-file ./infra/docker/.env \
		-f ./infra/docker/docker-compose.monitorenv.dev.yml \
		up -d monitorenv_app

.PHONY: lint-back ##LOCAL 🪮 ✨  Lint and format backend code
lint-back:
	cd ./backend && ./gradlew ktlintFormat | grep -v \
		-e "Exceeded max line length" \
		-e "Package name must not contain underscore" \
		-e "Wildcard import"

run-stubbed-apis:
	docker compose stop geoserver-monitorenv-stubs
	docker compose up -d --quiet-pull --wait geoserver-monitorenv-stubs

stop-stubbed-apis:
	docker stop cypress-geoserver-1

update-test-data:
	cd frontend && node ./scripts/generate_test_data_seeds.js

dev-backup-db:
	@export CONFIG_FILE_PATH=$$(pwd)/infra/dev/database/pg_backup.config; \
		./infra/remote/backup/pg_backup_rotated.sh
dev-restore-db:
	docker compose down -v
	docker compose up -d --quiet-pull --wait db
	sleep 5
	@export CONFIG_FILE_PATH=$$(pwd)/infra/dev/database/pg_backup.config; \
		./infra/remote/backup/pg_restore.sh -t "$(TAG)"

################################################################################
# Testing

.PHONY: test ##TEST ✅ Run all tests
test: test-back
	cd frontend && CI=true npm run test:unit -- --coverage

.PHONY: run-back-for-cypress ##TEST ▶️ Run backend API when using Cypress 📝
run-back-for-cypress: run-stubbed-apis
	docker compose up -d --quiet-pull --wait db keycloak
	cd backend && MONITORFISH_SCHEDULING_ENABLED=false ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

.PHONY: run-cypress ##TEST ▶️  Run Cypress 📝
run-cypress:
	cd ./frontend && npm run test:e2e:open

.PHONY: run-puppeteer ##TEST ▶️  Run Puppeteer 📝
run-puppeteer:
	cd ./frontend && npm run test:multi-windows:open

test-back: check-clean-archi
	@if [ -z "$(class)" ]; then \
		echo "Running all Backend tests..."; \
		cd backend && ./gradlew clean test; \
	else \
		echo "Running single Backend test class $(class)..."; \
		cd backend && ./gradlew test --console plain --no-continue --parallel --tests "$(class)"; \
	fi

.PHONY: test-back-watch ##TEST ✅ Watch backend tests
test-back-watch:
	./backend/scripts/test-watch.sh

.PHONY: run-back-with-monitorenv-for-cypress ##TEST ▶️  Run backend API when using Cypress connected to a local MonitorEnv app 📝
run-back-with-monitorenv-for-cypress: run-monitorenv run-stubbed-apis
	docker compose up -d --quiet-pull --wait db keycloak
	cd backend && MONITORENV_URL=http://localhost:9880 MONITORFISH_OIDC_ENABLED=false MONITORFISH_SCHEDULING_ENABLED=false ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

.PHONY: run-back-for-puppeteer ##TEST ▶️  Run backend API when using Puppeteer 📝
run-back-for-puppeteer: docker-env run-stubbed-apis
	docker compose up -d --quiet-pull --wait db
	docker compose -f ./infra/docker/docker-compose.puppeteer.yml up -d monitorenv-app
	cd backend && MONITORFISH_OIDC_ENABLED=false MONITORENV_URL=http://localhost:9880 ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

.PHONY: run-front-for-puppeteer ##TEST ▶️  Run frontend when using Puppeteer 📝
run-front-for-puppeteer:
	cd ./frontend && npm run dev-puppeteer

################################################################################
# Remote (Integration / Production)

# ----------------------------------------------------------
# Remote: Run commands

.PHONY: restart-remote-app ##RUN ▶️  Restart app
restart-remote-app:
	cd infra/remote && docker compose pull && docker compose up -d --build app --force-recreate

.PHONY: register-pipeline-flows-prod ##RUN ▶️  Register pipeline flows in PROD
deploy-pipeline-flows:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline-prefect3:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline-prefect3/deploy-flows.sh

register-pipeline-flows-prod:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/register-flows-prod.sh

.PHONY: register-pipeline-flows-int ##RUN ▶️  Register pipeline flows in STAGING
register-pipeline-flows-int:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/register-flows-int.sh

.PHONY: init-remote-sig ##RUN Initialize Geoserver layers
init-remote-sig:
	./infra/remote/postgis_insert_layers.sh && ./infra/init/geoserver_init_layers.sh

################################################################################
# Database upgrade

check-database-extensions-versions:
	docker exec -i monitorfish_database bash < infra/remote/database_upgrade/check_extensions_versions.sh

update-database-extensions:
	docker exec -i monitorfish_database bash < infra/remote/database_upgrade/update_timescaledb.sh && \
	docker exec -i monitorfish_database bash < infra/remote/database_upgrade/update_postgis.sh

upgrade-postgres-11-to-13:
	docker run --rm \
		-v $(PG_11_DATA_VOLUME_NAME):/var/lib/postgresql/11/data \
		-v $(PG_13_DATA_VOLUME_NAME):/var/lib/postgresql/13/data \
		ghcr.io/mtes-mct/monitorfish/monitorfish-database-upgrade:pg11_to_pg13-ts2.3.1-postgis3.3.4 -O "-c timescaledb.restoring='on'" -O "-c shared_preload_libraries=timescaledb";

upgrade-postgres-13-to-16:
	docker run --rm \
		-v $(PG_13_DATA_VOLUME_NAME):/var/lib/postgresql/13/data \
		-v $(PG_16_DATA_VOLUME_NAME):/var/lib/postgresql/16/data \
		ghcr.io/mtes-mct/monitorfish/monitorfish-database-upgrade:pg13_to_pg16-ts2.14.2-postgis3.4.2 -O "-c timescaledb.restoring='on'" -O "-c shared_preload_libraries=timescaledb";

print_pg_conf_files:
	docker run --rm -i \
		-v $(DB_DATA_VOLUME_NAME):/var/lib/postgresql/data \
		debian:buster \
		bash < infra/remote/database_upgrade/print_pg_conf_files.sh;

fix_pg_hba:
	docker run --rm \
		-v $(DB_DATA_VOLUME_NAME):/var/lib/postgresql/data \
		debian:buster \
		bash -c 'echo "host all all all md5" >> /var/lib/postgresql/data/pg_hba.conf';

add_timescaledb_to_shared_preload_libraries:
	docker run --rm \
		-v $(DB_DATA_VOLUME_NAME):/var/lib/postgresql/data \
		debian:buster \
		bash -c "echo \"shared_preload_libraries = 'timescaledb'\" >> /var/lib/postgresql/data/postgresql.conf";



################################################################################
# CI

# ----------------------------------------------------------
# CI: App Commands

docker-build:
	docker build --no-cache -f infra/docker/app/Dockerfile . -t monitorfish-app:$(VERSION) \
		--build-arg VERSION=$(VERSION) \
		--build-arg ENV_PROFILE=$(ENV_PROFILE) \
		--build-arg GITHUB_SHA=$(GITHUB_SHA) \
		--build-arg SENTRY_URL=$(SENTRY_URL) \
		--build-arg SENTRY_AUTH_TOKEN=$(SENTRY_AUTH_TOKEN) \
		--build-arg SENTRY_ORG=$(SENTRY_ORG) \
		--build-arg SENTRY_PROJECT=$(SENTRY_PROJECT)
docker-tag:
	docker tag monitorfish-app:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-push:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-compose-down:
	docker compose -f ./infra/docker/docker-compose.cypress.yml down -v
docker-compose-up:
	docker compose -f ./infra/docker/docker-compose.cypress.yml up -d --quiet-pull db
	docker compose -f ./infra/docker/docker-compose.cypress.yml up --quiet-pull flyway
	docker compose -f ./infra/docker/docker-compose.cypress.yml up -d --quiet-pull app
	@printf 'Waiting for backend app to be ready'
	@until curl --output /dev/null --silent --fail "http://localhost:8880/api/v1/healthcheck"; do printf '.' && sleep 1; done

docker-compose-puppeteer-up: docker-env
	docker compose -f ./infra/docker/docker-compose.puppeteer.yml up -d monitorenv-app
	docker compose -f ./infra/docker/docker-compose.puppeteer.yml up -d monitorfish-app
	@printf 'Waiting for MonitorEnv app to be ready'
	@until curl --output /dev/null --silent --fail "http://localhost:9880/api/v1/healthcheck"; do printf '.' && sleep 1; done
	@printf 'Waiting for MonitorFish app to be ready'
	@until curl --output /dev/null --silent --fail "http://localhost:8880/api/v1/healthcheck"; do printf '.' && sleep 1; done

# ----------------------------------------------------------
# CI: Pipeline Commands

docker-test-pipeline: fetch-external-data run-data-warehouse
	docker run --network host -v $(EXTERNAL_DATA_FOLDER):/home/monitorfish-pipeline/datascience/tests/test_data/external -v /var/run/docker.sock:/var/run/docker.sock -u monitorfish-pipeline:$(DOCKER_GROUP) --env-file datascience/.env.test --env HOST_MIGRATIONS_FOLDER=$(HOST_MIGRATIONS_FOLDER) monitorfish-pipeline:$(VERSION) coverage run -m pytest --pdb --ignore=tests/test_data/external tests
docker-tag-pipeline:
	docker tag monitorfish-pipeline:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(VERSION)
docker-push-pipeline:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(VERSION)

docker-test-pipeline-prefect-3: fetch-external-data-prefect-3 run-data-warehouse
	docker run \
	 --network host \
	 -e HOST_MIGRATIONS_FOLDER=$(HOST_MIGRATIONS_FOLDER) \
	 -e TEST=True \
	 -v $(PIPELINE_TEST_ENV_FILE):/home/monitorfish-pipeline/pipeline/.env.test \
	 -v $(EXTERNAL_DATA_FOLDER_PREFECT_3):/home/monitorfish-pipeline/pipeline/tests/test_data/external \
	 -v /var/run/docker.sock:/var/run/docker.sock \
	 -u monitorfish-pipeline:$(DOCKER_GROUP) \
	 monitorfish-pipeline-prefect3:$(VERSION) \
	 coverage run -m pytest --pdb --ignore=tests/test_data/external tests
docker-tag-pipeline-prefect-3:
	docker tag monitorfish-pipeline-prefect3:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline-prefect3:$(VERSION)
docker-push-pipeline-prefect-3:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline-prefect3:$(VERSION)

# ----------------------------------------------------------
# Remote: Pipeline commands

stop-data-warehouse:
	export DATA_WAREHOUSE_PASSWORD=password && \
	export DATA_WAREHOUSE_USER=clickhouse_user && \
	export DATA_WAREHOUSE_INPUT_DATA_FOLDER=$(DATA_WAREHOUSE_INPUT_DATA_FOLDER) && \
	docker compose -f ./pipeline/tests/docker-compose.yml down -v

fetch-external-data:
	git clone --depth=1 --branch=main https://github.com/MTES-MCT/fisheries-and-environment-data-warehouse.git ./datascience/tests/test_data/external/data_warehouse || echo "Data Warehouse repository already present - skipping git clone"

fetch-external-data-prefect-3:
	git clone --depth=1 --branch=main https://github.com/MTES-MCT/fisheries-and-environment-data-warehouse.git ./pipeline/tests/test_data/external/data_warehouse || echo "Data Warehouse repository already present - skipping git clone"

erase-external-data:
	rm -rf datascience/tests/test_data/external/data_warehouse

erase-external-data-prefect-3:
	rm -rf pipeline/tests/test_data/external/data_warehouse

run-data-warehouse:
	export DATA_WAREHOUSE_PASSWORD=password && \
	export DATA_WAREHOUSE_USER=clickhouse_user && \
	export DATA_WAREHOUSE_INPUT_DATA_FOLDER=$(DATA_WAREHOUSE_INPUT_DATA_FOLDER) && \
	docker compose -f ./pipeline/tests/docker-compose.yml up -d --remove-orphans

test-pipeline:
	cd datascience && export TEST_LOCAL=True && poetry run coverage run -m pytest --pdb --ignore=tests/test_data/external tests/ && poetry run coverage report && poetry run coverage html

test-pipeline-prefect-3:
	cd pipeline && \
	export TEST=True && \
	poetry run coverage run -m pytest --pdb --ignore=tests/test_data/external tests/ && \
	poetry run coverage report && \
	poetry run coverage html

test-pipeline-with-data_warehouse: fetch-external-data run-data-warehouse test-pipeline stop-data-warehouse

test-pipeline-with-data_warehouse-prefect-3: fetch-external-data-prefect-3 run-data-warehouse test-pipeline-prefect-3 stop-data-warehouse

# ----------------------------------------------------------
# Remote: Database commands

backup-db:
	./infra/remote/backup/pg_backup_rotated.sh
restore-db:
	./infra/remote/backup/pg_restore.sh

# ----------------------------------------------------------
# ???: Documentation commands

update-docs-pots:
	cd datascience/docs && \
	poetry run sphinx-build -b gettext -D extensions="sphinx.ext.viewcode","sphinx.ext.napoleon" source pot
push-docs-to-transifex: update-docs-pots
	cd datascience/docs && \
	./update_tx_config.sh && \
	poetry run tx push --source
pull-translated-docs-from-transifex:
	cd datascience/docs && \
	poetry run tx pull --all
build-docs-locally:
	cd datascience/docs && \
	poetry run sphinx-build -b html source build/html/en && \
	poetry run sphinx-build -b html -D language=fr source build/html/fr


################################################################################
# Alias commands

dev: clean run-back
dev-monitorenv: clean run-back-with-monitorenv
