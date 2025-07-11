docker exec prefect-db sh -c "psql -U prefect -d prefect -c \"DELETE FROM flow_run WHERE expected_start_time < NOW() - INTERVAL '7 days'\";"
