docker exec tmp_postgres_1 sh -c "psql -U prefect -d prefect_server -c \"DELETE FROM flow_run WHERE scheduled_start_time < NOW() - INTERVAL '7 days'\";"
