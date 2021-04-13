from datetime import timedelta

from prefect.schedules import CronSchedule, IntervalSchedule

from src.pipeline.flows import (
    controllers,
    controls,
    current_segments,
    ers,
    fishing_gear_codes,
    fleet_segments,
    heartbeat,
    infractions,
    last_positions,
    ports,
    species,
    vessels,
)

################################ Define flow schedules ################################
current_segments.flow.schedule = IntervalSchedule(interval=timedelta(minutes=10))
ers.flow.schedule = IntervalSchedule(interval=timedelta(minutes=1))
fishing_gear_codes.flow.schedule = CronSchedule("0 3 * * *")
heartbeat.flow.schedule = IntervalSchedule(interval=timedelta(minutes=1))
last_positions.flow.schedule = IntervalSchedule(interval=timedelta(minutes=1))
species.flow.schedule = CronSchedule("0 4 * * *")
vessels.flow.schedule = CronSchedule("0 2 * * *")

###################### List flows to register with prefect server #####################
flows_to_register = [
    controllers.flow,
    controls.flow,
    ers.flow,
    fishing_gear_codes.flow,
    heartbeat.flow,
    infractions.flow,
    ports.flow,
    species.flow,
    vessels.flow,
]
