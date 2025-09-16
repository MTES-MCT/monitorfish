docker exec prefect-db sh -c "psql -U prefect -d prefect -c \"DELETE FROM flow_run WHERE expected_start_time < NOW() - INTERVAL '1 day'\";"
docker exec prefect-db sh -c "psql -U prefect -d prefect -c \"DELETE FROM log WHERE timestamp < NOW() - INTERVAL '1 day'\";"
docker exec prefect-db sh -c "psql -U prefect -d prefect -c \"DELETE FROM event_resources WHERE occurred < NOW() - INTERVAL '1 day'\";"
docker exec prefect-db sh -c "psql -U prefect -d prefect -c \"DELETE FROM events WHERE occurred < NOW() - INTERVAL '1 day'\";"