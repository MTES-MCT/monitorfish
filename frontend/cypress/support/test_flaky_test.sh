counter=0
while true; do
  if ./node_modules/.bin/cypress run --browser firefox --config-file ./config/cypress.config.ts --spec cypress/e2e/vessels/vessel_search.spec.ts; then
    counter=$((counter+1))
    echo "Test runned $counter times"
    continue
  else
    echo "Test failed after $counter times"
    break
  fi
done
