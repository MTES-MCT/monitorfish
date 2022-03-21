from docker.types import Mount
from dotenv import dotenv_values
from prefect.executors.dask import LocalDaskExecutor
from prefect.run_configs.docker import DockerRun
from prefect.schedules import CronSchedule, Schedule, clocks
from prefect.storage.local import Local

from config import (
    DOCKER_IMAGE,
    FISHING_SPEED_THRESHOLD,
    FLOWS_LOCATION,
    LOGBOOK_FILES_GID,
    MINIMUM_CONSECUTIVE_POSITIONS,
    MONITORFISH_HOST,
    MONITORFISH_IP,
    MONITORFISH_VERSION,
    ROOT_DIRECTORY,
)
from src.pipeline.flows import (
    admin_areas,
    anchorages,
    control_anteriority,
    control_objectives,
    controllers,
    controls,
    current_segments,
    enrich_positions,
    facade_areas,
    fao_areas,
    fishing_gear_codes,
    fleet_segments,
    infractions,
    init_species_groups,
    last_positions,
    logbook,
    missing_trip_numbers,
    ports,
    position_alerts,
    regulations,
    regulations_checkup,
    risk_factor,
    scrape_legipeche,
    species,
    update_beacon_malfunctions,
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
logbook.flow.schedule = CronSchedule("* * * * *")
enrich_positions.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "* * * * *",
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
update_beacon_malfunctions.flow.schedule = CronSchedule("5,15,25,35,45,55 * * * *")
position_alerts.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "*/10 * * * *",
            parameter_defaults={
                "alert_type": "THREE_MILES_TRAWLING_ALERT",
                "zones": ["0-3"],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "fishing_gear_categories": ["Chaluts"],
                "include_vessels_unknown_gear": True,
            },
        ),
    ]
)

regulations.flow.schedule = CronSchedule("6,16,26,36,46,56 * * * *")
regulations_checkup.flow.schedule = CronSchedule("58 7 * * 1,2,3,4,5")
risk_factor.flow.schedule = CronSchedule("3,13,23,33,43,53 * * * *")
scrape_legipeche.flow.schedule = CronSchedule("35 7 * * 1,2,3,4,5")
species.flow.schedule = CronSchedule("0 8 * * *")
vessels.flow.schedule = CronSchedule("5 2,5,8,11,14,17,20,23 * * *")


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
    logbook.flow,
    facade_areas.flow,
    fao_areas.flow,
    fishing_gear_codes.flow,
    fleet_segments.flow,
    infractions.flow,
    init_species_groups.flow,
    last_positions.flow,
    missing_trip_numbers.flow,
    update_beacon_malfunctions.flow,
    ports.flow,
    position_alerts.flow,
    regulations.flow,
    regulations_checkup.flow,
    risk_factor.flow,
    scrape_legipeche.flow,
    species.flow,
    vessels.flow,
]

################################ Define flows' executor ###############################
for flow in flows_to_register:
    flow.executor = LocalDaskExecutor()

################################ Define flows' storage ################################
# This defines where the executor can find the flow.py file for each flow **inside**
# the container.
for flow in flows_to_register:
    flow.storage = Local(
        add_default_labels=False,
        stored_as_script=True,
        path=(FLOWS_LOCATION / flow.file_name).as_posix(),
    )

################### Define flows' run config ####################
for flow in flows_to_register:
    host_config = {
        "extra_hosts": {
            "host.docker.internal": "host-gateway",
            MONITORFISH_HOST: MONITORFISH_IP,
        }
    }
    if flow.name == "ERS":
        host_config = {
            **host_config,
            "group_add": [LOGBOOK_FILES_GID],
            "mounts": [
                Mount(
                    target="/opt2/monitorfish-data/ers",
                    source="/opt2/monitorfish-data/ers",
                    type="bind",
                )
            ],
        }

    flow.run_config = DockerRun(
        image=f"{DOCKER_IMAGE}:{MONITORFISH_VERSION}",
        host_config=host_config,
        env=dotenv_values(ROOT_DIRECTORY / ".env"),
    )
