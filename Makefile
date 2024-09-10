INFRA_FOLDER="$(shell pwd)/infra/configurations/"
HOST_MIGRATIONS_FOLDER=$(shell pwd)/backend/src/main/resources/db/migration

.PHONY: clean install test

docker-env:
	cd ./infra/docker && ../../frontend/node_modules/.bin/import-meta-env-prepare -u -x ./.env.local.defaults\


################################################################################
# Local Development

check-clean-archi:
	cd backend/tools && ./check-clean-architecture.sh

clean: docker-env
	rm -Rf ./backend/target
	docker compose down -v
	docker compose --env-file ./infra/docker/.env -f ./infra/docker/docker-compose.monitorenv.dev.yml down -v
	docker compose --env-file ./infra/docker/.env -f ./infra/docker/docker-compose.cypress.yml down -v
	docker compose -f ./infra/docker/docker-compose.puppeteer.yml down -v

compile-back:
	cd backend && ./gradlew assemble

init-local-sig:
	./infra/local/postgis_insert_layers.sh && ./infra/init/geoserver_init_layers.sh

install-front:
	cd ./frontend && npm i

run-back: run-stubbed-apis
	docker compose up -d --quiet-pull --wait db keycloak
	cd backend && ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

run-back-for-cypress: run-stubbed-apis
	docker compose up -d --quiet-pull --wait db keycloak
	cd backend && MONITORFISH_OIDC_ENABLED=false ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

run-back-with-monitorenv: run-monitorenv
	docker compose up -d --quiet-pull --wait db
	cd backend && MONITORENV_URL=http://localhost:9880 ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

run-front:
	cd ./frontend && npm run dev

run-monitorenv: docker-env
	docker compose \
		--project-directory ./infra/docker \
		--env-file ./infra/docker/.env \
		-f ./infra/docker/docker-compose.monitorenv.dev.yml \
		up -d monitorenv_app

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

upgrade-postgres-13-to-16-dev:
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
# Testing

test: test-back
	cd frontend && CI=true npm run test:unit -- --coverage

test-back: check-clean-archi
	@if [ -z "$(class)" ]; then \
		echo "Running all Backend tests..."; \
		cd backend && ./gradlew clean test; \
	else \
		echo "Running single Backend test class $(class)..."; \
		cd backend && ./gradlew test --console plain --no-continue --parallel --tests "$(class)"; \
	fi

test-back-watch:
	./backend/scripts/test-watch.sh

lint-back:
	cd ./backend && ./gradlew ktlintFormat | grep -v \
		-e "Exceeded max line length" \
		-e "Package name must not contain underscore" \
		-e "Wildcard import"

run-back-for-puppeteer: docker-env run-stubbed-apis
	docker compose up -d --quiet-pull --wait db
	docker compose -f ./infra/docker/docker-compose.puppeteer.yml up -d monitorenv-app
	cd backend && MONITORENV_URL=http://localhost:9880 ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

run-front-for-puppeteer:
	cd ./frontend && npm run dev-puppeteer


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

docker-build-pipeline:
	docker build -f ./infra/docker/datapipeline/Dockerfile . -t monitorfish-pipeline:$(VERSION)
docker-test-pipeline:
	docker run --network host -v /var/run/docker.sock:/var/run/docker.sock -u monitorfish-pipeline:$(DOCKER_GROUP) --env-file datascience/.env.test --env HOST_MIGRATIONS_FOLDER=$(HOST_MIGRATIONS_FOLDER) monitorfish-pipeline:$(VERSION) coverage run -m pytest --pdb tests
docker-tag-pipeline:
	docker tag monitorfish-pipeline:$(VERSION) docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(VERSION)
docker-push-pipeline:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(VERSION)


################################################################################
# Remote (Integration / Production)

# ----------------------------------------------------------
# Remote: Run commands

init-remote-sig:
	./infra/remote/postgis_insert_layers.sh && ./infra/init/geoserver_init_layers.sh
restart-remote-app:
	cd infra/remote && docker compose pull && docker compose up -d --build app --force-recreate

register-pipeline-flows-prod:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/register-flows-prod.sh
register-pipeline-flows-int:
	docker pull docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$(MONITORFISH_VERSION) && \
	infra/remote/data-pipeline/register-flows-int.sh

# ----------------------------------------------------------
# Remote: Pipeline commands

install-pipeline:
	cd datascience && poetry install
test-pipeline:
	cd datascience && export TEST_LOCAL=True && poetry run coverage run -m pytest --pdb tests/ && poetry run coverage report && poetry run coverage html

# ----------------------------------------------------------
# Remote: Database commands

backup-db:
	./infra/remote/backup/pg_backup_rotated.sh
restore-db:
	./infra/remote/backup/pg_restore.sh

# ----------------------------------------------------------
# ???: Documentation commands

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


################################################################################
# Alias commands

dev: clean run-back
dev-monitorenv: clean run-back-with-monitorenv
