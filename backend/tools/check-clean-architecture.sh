#!/usr/bin/env bash

readonly SRC_PATH="../src/main/kotlin/fr/gouv/cnsp/monitorfish"

readonly DOMAIN_ENTITIES_PACKAGE_PATH="${SRC_PATH}/domain/entities"
readonly DOMAIN_REPOSITORIES_PACKAGE_PATH="${SRC_PATH}/domain/repositories"
readonly DOMAIN_USE_CASES_PACKAGE_PATH="${SRC_PATH}/domain/use_cases"

readonly UNAUTHORIZED_PACKAGES_USAGE_IN_USE_CASES="infrastructure"
readonly UNAUTHORIZED_PACKAGES_USAGE_IN_DOMAIN="${UNAUTHORIZED_PACKAGES_USAGE_IN_USE_CASES}|usecases|springframework|javax"

readonly UNAUTHORIZED_PACKAGES_USAGE_COUNT_IN_DOMAIN=$(find ${DOMAIN_ENTITIES_PACKAGE_PATH} ${DOMAIN_REPOSITORIES_PACKAGE_PATH} \( -name "*.kt" -o -name "*.java" \) -exec egrep -w ${UNAUTHORIZED_PACKAGES_USAGE_IN_DOMAIN} {} \; | wc -l)
readonly UNAUTHORIZED_PACKAGES_USAGE_COUNT_IN_USE_CASES=$(find ${DOMAIN_USE_CASES_PACKAGE_PATH} \( -name "*.kt" -o -name "*.java" \) -exec egrep -w ${UNAUTHORIZED_PACKAGES_USAGE_IN_USE_CASES} {} \; | wc -l)

if [[ "${UNAUTHORIZED_PACKAGES_USAGE_COUNT_IN_DOMAIN}" -eq 0 ]] && [[ "${UNAUTHORIZED_PACKAGES_USAGE_COUNT_IN_USE_CASES}" -eq 0 ]]; then
  exit 0
fi

echo "${UNAUTHORIZED_PACKAGES_USAGE_COUNT_IN_DOMAIN} unauthorized packages in ${DOMAIN_ENTITIES_PACKAGE_PATH} or ${DOMAIN_REPOSITORIES_PACKAGE_PATH}:"
find ${DOMAIN_PACKAGE_PATH} \( -name "*.kt" -o -name "*.java" \) -exec egrep -lw ${UNAUTHORIZED_PACKAGES_USAGE_IN_DOMAIN} {} \;
echo ""
echo "${UNAUTHORIZED_PACKAGES_USAGE_COUNT_IN_USE_CASES} unauthorized packages in ${DOMAIN_USE_CASES_PACKAGE_PATH}:"
find ${DOMAIN_USE_CASES_PACKAGE_PATH} \( -name "*.kt" -o -name "*.java" \) -exec egrep -lw ${UNAUTHORIZED_PACKAGES_USAGE_IN_USE_CASES} {} \;
exit 1
