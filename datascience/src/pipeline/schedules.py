from prefect.schedules import CronSchedule

from src.pipeline.flows import (
    control_anteriority,
    controllers,
    controls,
    current_segments,
    ers,
    fishing_gear_codes,
    fleet_segments,
    infractions,
    init_species_groups,
    last_positions,
    ports,
    species,
    vessels,
)

################################ Define flow schedules ################################
control_anteriority.flow.schedule = CronSchedule("5 * * * *")
controllers.flow = CronSchedule("0 8 * * *")
controls.flow = CronSchedule("4 * * * *")
current_segments.flow.schedule = CronSchedule("2,12,22,32,42,52 * * * *")
ers.flow.schedule = CronSchedule("* * * * *")
fishing_gear_codes.flow.schedule = CronSchedule("0 8 * * *")
infractions.flow.schedule = CronSchedule("1 8 * * *")
last_positions.flow.schedule = CronSchedule("* * * * *")
species.flow.schedule = CronSchedule("0 8 * * *")
vessels.flow.schedule = CronSchedule("5 8 * * *")

###################### List flows to register with prefect server #####################
flows_to_register = [
    controllers.flow,
    controls.flow,
    control_anteriority.flow,
    current_segments.flow,
    ers.flow,
    fishing_gear_codes.flow,
    fleet_segments.flow,
    infractions.flow,
    init_species_groups.flow,
    last_positions.flow,
    ports.flow,
    species.flow,
    vessels.flow,
]
