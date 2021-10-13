from prefect.schedules import CronSchedule, Schedule, clocks

from src.pipeline.flows import (
    control_anteriority,
    controllers,
    controls,
    current_segments,
    ers,
    facade_areas,
    fao_areas,
    fishing_gear_codes,
    fleet_segments,
    infractions,
    init_species_groups,
    last_positions,
    missing_trip_numbers,
    ports,
    regulations,
    risk_factor,
    species,
    vessels,
)

################################ Define flow schedules ################################
control_anteriority.flow.schedule = CronSchedule("5 * * * *")
controllers.flow.schedule = CronSchedule("0 8 * * *")

controls.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "1 * * * *",
            parameter_defaults={"number_of_months": 1, "loading_mode": "upsert"},
        )
    ]
)

current_segments.flow.schedule = CronSchedule("2,12,22,32,42,52 * * * *")
ers.flow.schedule = CronSchedule("* * * * *")
fishing_gear_codes.flow.schedule = CronSchedule("0 8 * * *")
infractions.flow.schedule = CronSchedule("1 8 * * *")
last_positions.flow.schedule = CronSchedule("* * * * *")
missing_trip_numbers.flow.schedule = CronSchedule("4,14,24,34,44,54 * * * *")
regulations.flow.schedule = CronSchedule("* * * * *")
risk_factor.flow.schedule = CronSchedule("3,13,23,33,43,53 * * * *")
species.flow.schedule = CronSchedule("0 8 * * *")
vessels.flow.schedule = CronSchedule("5 8 * * *")

###################### List flows to register with prefect server #####################
flows_to_register = [
    controllers.flow,
    controls.flow,
    control_anteriority.flow,
    current_segments.flow,
    ers.flow,
    facade_areas.flow,
    fao_areas.flow,
    fishing_gear_codes.flow,
    fleet_segments.flow,
    infractions.flow,
    init_species_groups.flow,
    last_positions.flow,
    missing_trip_numbers.flow,
    ports.flow,
    regulations.flow,
    risk_factor.flow,
    species.flow,
    vessels.flow,
]
