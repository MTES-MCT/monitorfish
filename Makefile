INFRA_FOLDER="$(shell pwd)/infra/configurations/"
HOST_MIGRATIONS_FOLDER=$(shell pwd)/backend/src/main/resources/db/migration

.PHONY: clean install test

docker-env:
	cd ./infra/docker && ../../frontend/node_modules/.bin/import-meta-env-prepare -u -x ./.env.local.defaults\

################################################################################
# Local Development

install:
	cd ./frontend && npm i

run-front:
	cd ./frontend && npm run dev

run-back: run-stubbed-apis
	docker compose up -d --quiet-pull --wait db
	cd backend && ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

run-back-with-monitorenv: run-monitorenv
	docker compose up -d --quiet-pull --wait db
	cd backend && MONITORENV_URL=http://localhost:9880 ./gradlew bootRun --args='--spring.profiles.active=local --spring.config.additional-location=$(INFRA_FOLDER)'

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

clean: docker-env
	rm -Rf ./backend/target
	docker compose down -v
	docker compose --env-file ./infra/docker/.env -f ./infra/docker/docker-compose.cypress.yml down -v
	docker compose -f ./infra/docker/docker-compose.puppeteer.yml down -v
	docker compose --env-file ./infra/docker/.env -f ./infra/docker/docker-compose.monitorenv.dev.yml down -v

check-clean-archi:
	cd backend/tools && ./check-clean-architecture.sh

################################################################################
# Testing

test: test-back
	cd frontend && CI=true npm run test:unit -- --coverage

test-back: check-clean-archi
	cd backend && ./gradlew clean test

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

# CI commands - app
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
	@until curl --output /dev/null --silent --fail "http://localhost:8880/bff/v1/healthcheck"; do printf '.' && sleep 1; done

docker-compose-puppeteer-up: docker-env
	docker compose -f ./infra/docker/docker-compose.puppeteer.yml up -d monitorenv-app
	docker compose -f ./infra/docker/docker-compose.puppeteer.yml up -d monitorfish-app
	@printf 'Waiting for MonitorEnv app to be ready'
	@until curl --output /dev/null --silent --fail "http://localhost:9880/bff/v1/healthcheck"; do printf '.' && sleep 1; done
	@printf 'Waiting for MonitorFish app to be ready'
	@until curl --output /dev/null --silent --fail "http://localhost:8880/bff/v1/healthcheck"; do printf '.' && sleep 1; done

# CI commands - data pipeline
docker-build-pipeline:
	docker build -f ./infra/docker/datapipeline/Dockerfile . -t monitorfish-pipeline:$(VERSION)
docker-test-pipeline:
	docker run --network host -v /var/run/docker.sock:/var/run/docker.sock -u monitorfish-pipeline:$(DOCKER_GROUP) --env-file datascience/.env.test --env HOST_MIGRATIONS_FOLDER=$(HOST_MIGRATIONS_FOLDER) monitorfish-pipeline:$(VERSION) coverage run -m pytest --pdb tests
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

################################################################################
# Alias commands

dev: clean run-back
dev-monitorenv: clean run-back-with-monitorenv
