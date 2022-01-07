from prefect.executors.dask import LocalDaskExecutor
from prefect.schedules import CronSchedule, Schedule, clocks

from config import FISHING_SPEED_THRESHOLD, MINIMUM_CONSECUTIVE_POSITIONS
from src.pipeline.flows import (
    admin_areas,
    anchorages,
    control_anteriority,
    control_objectives,
    controllers,
    controls,
    current_segments,
    enrich_positions,
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
    regulations_checkup,
    risk_factor,
    scrape_legipeche,
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
        ),
        clocks.CronClock(
            "10 8 * * *",
            parameter_defaults={"number_of_months": 120, "loading_mode": "replace"},
        ),
    ]
)
current_segments.flow.schedule = CronSchedule("2,12,22,32,42,52 * * * *")
ers.flow.schedule = CronSchedule("* * * * *")
enrich_positions.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "1 * * * *",
            parameter_defaults={
                "start_hours_ago": 7,
                "end_hours_ago": 0,
                "minutes_per_chunk": 420,
                "chunk_overlap_minutes": 0,
                "minimum_consecutive_positions": MINIMUM_CONSECUTIVE_POSITIONS,
                "fishing_speed_threshold": FISHING_SPEED_THRESHOLD,
                "recompute_all": False,
            },
        ),
    ]
)
fishing_gear_codes.flow.schedule = CronSchedule("0 8 * * *")
infractions.flow.schedule = CronSchedule("1 8 * * *")
last_positions.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "0 * * * *",
            parameter_defaults={"minutes": 240, "action": "update"},
        ),
        clocks.CronClock(
            "1-59 * * * *",
            parameter_defaults={"minutes": 30, "action": "update"},
        ),
    ]
)
missing_trip_numbers.flow.schedule = CronSchedule("4,14,24,34,44,54 * * * *")
regulations.flow.schedule = CronSchedule("6,16,26,36,46,56 * * * *")
regulations_checkup.flow.schedule = CronSchedule("58 7 * * 1,2,3,4,5")
risk_factor.flow.schedule = CronSchedule("3,13,23,33,43,53 * * * *")
scrape_legipeche.flow.schedule = CronSchedule("35 7 * * 1,2,3,4,5")
species.flow.schedule = CronSchedule("0 8 * * *")
vessels.flow.schedule = CronSchedule("5 2,5,8,11,14,17,20,23 * * *")

################################ Define flows' executor ###############################
admin_areas.flow.executor = LocalDaskExecutor()
controls.flow.executor = LocalDaskExecutor()
last_positions.flow.executor = LocalDaskExecutor()
vessels.flow.executor = LocalDaskExecutor()

###################### List flows to register with prefect server #####################
flows_to_register = [
    admin_areas.flow,
    anchorages.flow,
    control_anteriority.flow,
    control_objectives.flow,
    controllers.flow,
    controls.flow,
    current_segments.flow,
    enrich_positions.flow,
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
    regulations_checkup.flow,
    risk_factor.flow,
    scrape_legipeche.flow,
    species.flow,
    vessels.flow,
]
