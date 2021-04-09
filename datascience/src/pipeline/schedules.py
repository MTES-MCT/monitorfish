from datetime import timedelta

from prefect.schedules import CronSchedule, IntervalSchedule

from src.pipeline.flows import (
    controllers,
    controls,
    ers,
    fishing_gear_codes,
    fleet_segments,
    heartbeat,
    infractions,
    ports,
    species,
    vessels,
)

################################ Define flow schedules ################################
heartbeat.flow.schedule = IntervalSchedule(interval=timedelta(minutes=1))
vessels.flow.schedule = CronSchedule("0 2 * * *")
fishing_gear_codes.flow.schedule = CronSchedule("0 3 * * *")
species.flow.schedule = CronSchedule("0 4 * * *")
ers.flow.schedule = IntervalSchedule(interval=timedelta(minutes=1))

###################### List flows to register with prefect server #####################
flows_to_register = [
    controllers.flow,
    controls.flow,
    infractions.flow,
    heartbeat.flow,
    vessels.flow,
    fishing_gear_codes.flow,
    species.flow,
    ers.flow,
    ports.flow,
    fleet_segments.flow,
]
