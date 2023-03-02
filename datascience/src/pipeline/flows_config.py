from docker.types import Mount
from dotenv import dotenv_values
from prefect.run_configs.docker import DockerRun
from prefect.schedules import CronSchedule, Schedule, clocks
from prefect.storage.local import Local

from config import (
    DOCKER_IMAGE,
    FLOWS_LOCATION,
    IS_INTEGRATION,
    LOGBOOK_FILES_GID,
    MAX_FISHING_SPEED_THRESHOLD,
    MIN_FISHING_SPEED_THRESHOLD,
    MINIMUM_CONSECUTIVE_POSITIONS,
    MINIMUM_MINUTES_OF_EMISSION_AT_SEA,
    MONITORFISH_VERSION,
    ROOT_DIRECTORY,
    TEST_MODE,
)
from src.pipeline.flows import (
    admin_areas,
    anchorages,
    beacons,
    control_anteriority,
    control_units,
    controls,
    controls_open_data,
    current_segments,
    districts,
    enrich_positions,
    facade_areas,
    fao_areas,
    fishing_gear_codes,
    infractions,
    init_species_groups,
    last_positions,
    logbook,
    missing_far_alerts,
    missing_trip_numbers,
    missions,
    notify_beacon_malfunctions,
    ports,
    position_alerts,
    regulations,
    regulations_checkup,
    regulations_open_data,
    risk_factor,
    scrape_legipeche,
    species,
    update_beacon_malfunctions,
    vessels,
)
from src.pipeline.helpers.country_codes import (
    european_union_country_codes_iso_2,
    french_vessels_country_codes_iso_2,
)

################################ Define flow schedules ################################
beacons.flow.schedule = CronSchedule("4,14,24,34,44,54 * * * *")
control_anteriority.flow.schedule = CronSchedule("5 * * * *")
control_units.flow.schedule = CronSchedule("12 8 * * *")
controls.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "1 * * * *",
            parameter_defaults={"number_of_months": 1, "loading_mode": "upsert"},
        ),
        clocks.CronClock(
            "10 8 * * *",
            parameter_defaults={"number_of_months": 200, "loading_mode": "replace"},
        ),
    ]
)
controls_open_data.flow.schedule = CronSchedule("15 3 * * 5")
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
                "minimum_minutes_of_emission_at_sea": MINIMUM_MINUTES_OF_EMISSION_AT_SEA,
                "min_fishing_speed_threshold": MIN_FISHING_SPEED_THRESHOLD,
                "max_fishing_speed_threshold": MAX_FISHING_SPEED_THRESHOLD,
                "recompute_all": False,
            },
        ),
    ]
)
infractions.flow.schedule = CronSchedule("1 8 * * *")
last_positions.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "* * * * *",
            parameter_defaults={"minutes": 1440, "action": "update"},
        )
    ]
)
missing_far_alerts.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "45 6 * * *",
            parameter_defaults={
                "alert_type": "MISSING_FAR_ALERT",
                "alert_config_name": "MISSING_FAR_ALERT",
                "states_iso2_to_monitor_everywhere": ["FR"],
                "states_iso2_to_monitor_in_french_eez": ["BE"],
                "max_share_of_vessels_with_missing_fars": 0.5,
                "minimum_length": 12.0,
                "only_raise_if_route_shows_fishing": True,
            },
        ),
    ]
)
missing_trip_numbers.flow.schedule = CronSchedule("4,14,24,34,44,54 * * * *")
missions.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "*/2 * * * *",
            parameter_defaults={"number_of_months": 1, "loading_mode": "upsert"},
        ),
        clocks.CronClock(
            "16 8 * * *",
            parameter_defaults={"number_of_months": 200, "loading_mode": "replace"},
        ),
    ]
)
notify_beacon_malfunctions.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "* * * * *",
            parameter_defaults={
                "test_mode": TEST_MODE,
                "is_integration": IS_INTEGRATION,
            },
        ),
    ]
)
update_beacon_malfunctions.flow.schedule = CronSchedule("5,15,25,35,45,55 * * * *")
position_alerts.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "1,11,21,31,41,51 * * * *",
            parameter_defaults={
                "alert_type": "THREE_MILES_TRAWLING_ALERT",
                "alert_config_name": "THREE_MILES_TRAWLING_ALERT",
                "zones": ["0-3"],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "fishing_gear_categories": ["Chaluts"],
                "include_vessels_unknown_gear": True,
            },
        ),
        clocks.CronClock(
            "2,12,22,32,42,52 * * * *",
            parameter_defaults={
                "alert_type": "FRENCH_EEZ_FISHING_ALERT",
                "alert_config_name": "FRENCH_EEZ_FISHING_ALERT",
                "zones": ["FRA"],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "except_flag_states": list(
                    set(
                        european_union_country_codes_iso_2
                        + french_vessels_country_codes_iso_2
                        + ["VE"]
                    )
                ),
            },
        ),
        clocks.CronClock(
            "3,13,23,33,43,53 * * * *",
            parameter_defaults={
                "alert_type": "TWELVE_MILES_FISHING_ALERT",
                "alert_config_name": "TWELVE_MILES_FISHING_ALERT_BE_NL",
                "zones": ["0-12_MINUS_BE_AND_NL_FISHING_AREAS"],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "flag_states": ["BE", "NL"],
            },
        ),
        clocks.CronClock(
            "4,14,24,34,44,54 * * * *",
            parameter_defaults={
                "alert_type": "TWELVE_MILES_FISHING_ALERT",
                "alert_config_name": "TWELVE_MILES_FISHING_ALERT_ES",
                "zones": ["0-12_MINUS_ES_FISHING_AREAS"],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "flag_states": ["ES"],
            },
        ),
        clocks.CronClock(
            "5,15,25,35,45,55 * * * *",
            parameter_defaults={
                "alert_type": "TWELVE_MILES_FISHING_ALERT",
                "alert_config_name": "TWELVE_MILES_FISHING_ALERT_DE",
                "zones": ["0-12_MINUS_DE_FISHING_AREAS"],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "flag_states": ["DE"],
            },
        ),
        clocks.CronClock(
            "6,16,26,36,46,56 * * * *",
            parameter_defaults={
                "alert_type": "TWELVE_MILES_FISHING_ALERT",
                "alert_config_name": "TWELVE_MILES_FISHING_ALERT_OTHERS",
                "zones": ["0-3", "3-6", "6-12", "0-12"],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "except_flag_states": ["FR", "PF", "VE", "BE", "NL", "DE", "ES"],
            },
        ),
    ]
)

regulations.flow.schedule = CronSchedule("6,16,26,36,46,56 * * * *")
regulations_checkup.flow.schedule = CronSchedule("58 5 * * 1,2,3,4,5")
regulations_open_data.flow.schedule = CronSchedule("18 1 * * 5")
risk_factor.flow.schedule = CronSchedule("3,13,23,33,43,53 * * * *")
scrape_legipeche.flow.schedule = CronSchedule("15 5 * * 1,2,3,4,5")
vessels.flow.schedule = CronSchedule("5 2,5,8,11,14,17,20,23 * * *")


###################### List flows to register with prefect server #####################
flows_to_register = [
    admin_areas.flow,
    anchorages.flow,
    beacons.flow,
    control_anteriority.flow,
    control_units.flow,
    controls.flow,
    controls_open_data.flow,
    current_segments.flow,
    districts.flow,
    enrich_positions.flow,
    logbook.flow,
    facade_areas.flow,
    fao_areas.flow,
    fishing_gear_codes.flow,
    infractions.flow,
    init_species_groups.flow,
    last_positions.flow,
    missing_far_alerts.flow,
    missing_trip_numbers.flow,
    missions.flow,
    notify_beacon_malfunctions.flow,
    update_beacon_malfunctions.flow,
    ports.flow,
    position_alerts.flow,
    regulations.flow,
    regulations_checkup.flow,
    regulations_open_data.flow,
    risk_factor.flow,
    scrape_legipeche.flow,
    species.flow,
    vessels.flow,
]


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
    if flow.name == "Logbook":
        host_config = {
            "group_add": [LOGBOOK_FILES_GID],
            "mounts": [
                Mount(
                    target="/opt2/monitorfish-data/ers",
                    source="/opt2/monitorfish-data/ers",
                    type="bind",
                )
            ],
        }
    else:
        host_config = None

    flow.run_config = DockerRun(
        image=f"{DOCKER_IMAGE}:{MONITORFISH_VERSION}",
        host_config=host_config,
        env=dotenv_values(ROOT_DIRECTORY / ".env"),
        labels=["monitorfish"],
    )
