from datetime import timedelta

from prefect.schedules import CronSchedule, IntervalSchedule

from src.pipeline.flows import (
    ers,
    fishing_gear_codes,
    heartbeat,
    ports,
    species,
    vessels,
)

################################ Define flow schedules ################################
heartbeat.flow.schedule = IntervalSchedule(interval=timedelta(minutes=1))
vessels.flow.schedule = CronSchedule("0 2 * * *")
fishing_gear_codes.flow.schedule = CronSchedule("0 3 * * *")
species.flow.schedule = CronSchedule("0 4 * * *")

###################### List flows to register with prefect server #####################
flows_to_register = [
    heartbeat.flow,
    vessels.flow,
    fishing_gear_codes.flow,
    species.flow,
    ports.flow_make_circabc_ports,
    ports.flow_make_unece_ports,
    ports.flow_combine_circabc_unece_ports,
    ports.flow_geocode_ports,
    ports.flow_load_ports,
]
