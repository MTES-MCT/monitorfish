INFRA_FOLDER="$(shell pwd)/infra/configurations/"

.PHONY: run docker-build docker-tag docker-push check-clean-archi test

run-dev:
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.config.additional-location=$(INFRA_FOLDER)" -Dspring-boot.run.profiles="local"
docker-build:
	if [ "$(ENV_PROFILE)" != "prod" ]; then\
	    export VERSION=$(VERSION)_SNAPSHOT;\
	fi
	docker build --no-cache -f infra/docker/DockerfileBuildApp . -t monitorfish-app:$(VERSION)
docker-tag:
	docker tag monitorfish-app:v1 docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
docker-push:
	docker push docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:$(VERSION)
check-clean-archi:
	cd backend/tools && ./check-clean-architecture.sh
test: check-clean-archi
	cd backend && ./mvnw test