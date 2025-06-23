from docker.types import Mount
from dotenv import dotenv_values
from prefect.run_configs.docker import DockerRun
from prefect.schedules import CronSchedule, Schedule, clocks
from prefect.storage.local import Local

from config import (
    DOCKER_IMAGE,
    FLOWS_LABEL,
    FLOWS_LOCATION,
    IS_INTEGRATION,
    LOGBOOK_FILES_GID,
    MAX_FISHING_SPEED_THRESHOLD,
    MIN_FISHING_SPEED_THRESHOLD,
    MINIMUM_CONSECUTIVE_POSITIONS,
    MINIMUM_MINUTES_OF_EMISSION_AT_SEA,
    MONITORFISH_VERSION,
    NON_COMMITED_DATA_LOCATION,
    PNO_TEST_MODE,
    ROOT_DIRECTORY,
    TEST_MODE,
    WEEKLY_CONTROL_REPORT_EMAIL_TEST_MODE,
)
from src.pipeline.flows import (
    activity_visualizations,
    admin_areas,
    anchorages,
    beacons,
    clean_flow_runs,
    control_anteriority,
    control_units,
    controls,
    controls_open_data,
    current_segments,
    distribute_pnos,
    districts,
    email_actions_to_units,
    enrich_logbook,
    enrich_positions,
    facade_areas,
    fao_areas,
    fishing_gear_codes,
    foreign_fmcs,
    infractions,
    init_2025_segments,
    init_pno_subscriptions,
    init_pno_types,
    init_species_groups,
    last_positions,
    logbook,
    missing_dep_alerts,
    missing_far_alerts,
    missing_trip_numbers,
    missions,
    notify_beacon_malfunctions,
    ports,
    position_alerts,
    recompute_controls_segments,
    refresh_materialized_view,
    regulations,
    regulations_checkup,
    regulations_open_data,
    risk_factor,
    scrape_legipeche,
    species,
    suspicions_of_under_declaration_alerts,
    update_beacon_malfunctions,
    validate_pending_alerts,
    vessel_profiles,
    vessels,
)
from src.pipeline.helpers.country_codes import (
    european_union_country_codes_iso_2,
    french_vessels_country_codes_iso_2,
)

################################ Define flow schedules ################################
activity_visualizations.flow.schedule = CronSchedule("0 20 1 * *")
admin_areas.flow.schedule = CronSchedule("43 4 * * 1,2,3,4,5")
beacons.flow.schedule = CronSchedule("4,14,24,34,44,54 * * * *")
clean_flow_runs.flow.schedule = CronSchedule("8,18,28,38,48,58 * * * *")
control_anteriority.flow.schedule = CronSchedule("5 * * * *")
control_units.flow.schedule = CronSchedule("12 8 * * *")
controls_open_data.flow.schedule = CronSchedule("15 3 * * 5")
current_segments.flow.schedule = CronSchedule("2,22,42 * * * *")
distribute_pnos.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "* * * * *",
            parameter_defaults={
                "test_mode": PNO_TEST_MODE,
                "is_integration": IS_INTEGRATION,
                "start_hours_ago": 120,
                "end_hours_ago": 0,
            },
        ),
    ]
)
email_actions_to_units.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "0 5 * * 1",
            parameter_defaults={
                "start_days_ago": 7,
                "end_days_ago": 1,
                "test_mode": WEEKLY_CONTROL_REPORT_EMAIL_TEST_MODE,
                "is_integration": IS_INTEGRATION,
            },
        ),
    ]
)
enrich_logbook.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "1,6,11,16,21,26,31,36,41,46,51,56 * * * *",
            parameter_defaults={
                "start_hours_ago": 6,
                "end_hours_ago": 0,
                "minutes_per_chunk": 480,
                "recompute_all": False,
            },
        )
    ]
)
enrich_positions.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "1-59 * * * *",
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
        clocks.CronClock(
            "0 * * * *",
            parameter_defaults={
                "start_hours_ago": 24,
                "end_hours_ago": 0,
                "minutes_per_chunk": 1440,
                "chunk_overlap_minutes": 0,
                "minimum_consecutive_positions": MINIMUM_CONSECUTIVE_POSITIONS,
                "minimum_minutes_of_emission_at_sea": MINIMUM_MINUTES_OF_EMISSION_AT_SEA,
                "min_fishing_speed_threshold": MIN_FISHING_SPEED_THRESHOLD,
                "max_fishing_speed_threshold": MAX_FISHING_SPEED_THRESHOLD,
                "recompute_all": True,
            },
        ),
    ]
)
foreign_fmcs.flow.schedule = CronSchedule("37 10 * * *")
infractions.flow.schedule = CronSchedule("1 8 * * *")
last_positions.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "* * * * *",
            parameter_defaults={"minutes": 1440, "action": "update"},
        )
    ]
)
logbook.flow.schedule = CronSchedule("0,5,10,15,20,25,30,35,40,45,50,55 * * * *")

# For details on missing DEP alerts timing and risks of bad syncing with other data,
# see https://github.com/MTES-MCT/monitorfish/pull/3834#issue-2637538251
missing_dep_alerts.flow.schedule = CronSchedule("5,25,45 * * * *")
missing_far_alerts.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "45 6 * * *",
            parameter_defaults={
                "alert_type": "MISSING_FAR_ALERT",
                "alert_config_name": "MISSING_FAR_ALERT",
                "states_iso2_to_monitor_everywhere": ["FR"],
                "states_iso2_to_monitor_in_french_eez": ["BE", "VE"],
                "max_share_of_vessels_with_missing_fars": 0.5,
                "minimum_length": 12.0,
                "only_raise_if_route_shows_fishing": True,
                "days_without_far": 1,
            },
        ),
        clocks.CronClock(
            "55 6 * * *",
            parameter_defaults={
                "alert_type": "MISSING_FAR_48_HOURS_ALERT",
                "alert_config_name": "MISSING_FAR_48_HOURS_ALERT",
                "states_iso2_to_monitor_everywhere": ["FR"],
                "states_iso2_to_monitor_in_french_eez": ["BE", "VE"],
                "max_share_of_vessels_with_missing_fars": 0.5,
                "minimum_length": 12.0,
                "only_raise_if_route_shows_fishing": True,
                "days_without_far": 2,
            },
        ),
    ]
)
missing_trip_numbers.flow.schedule = CronSchedule("4,14,24,34,44,54 * * * *")
missions.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "6 4 * * *",
            parameter_defaults={"number_of_months": 200},
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
update_beacon_malfunctions.flow.schedule = CronSchedule("6,16,26,36,46,56 * * * *")
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
        # RTC alert for vessels flying a FR flag : applies everywhere in the world
        clocks.CronClock(
            "2,12,22,32,42,52 * * * *",
            parameter_defaults={
                "alert_type": "RTC_FISHING_ALERT",
                "alert_config_name": "RTC_FISHING_ALERT_FR",
                "zones": ["Reg. RTC"],
                "hours_from_now": 8,
                "flag_states": ["FR"],
                "only_fishing_positions": True,
            },
        ),
        # RTC alert for vessels flying a non FR flag : applies only in the FRA EEZ
        clocks.CronClock(
            "3,13,23,33,43,53 * * * *",
            parameter_defaults={
                "alert_type": "RTC_FISHING_ALERT",
                "alert_config_name": "RTC_FISHING_ALERT_NON_FR",
                "zones": ["Reg. RTC"],
                "hours_from_now": 8,
                "except_flag_states": ["FR"],
                "eez_areas": ["FRA"],
                "only_fishing_positions": True,
            },
        ),
        clocks.CronClock(
            "4,14,24,34,44,54 * * * *",
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
            "5,15,25,35,45,55 * * * *",
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
            "7,17,27,37,47,57 * * * *",
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
            "8,18,28,38,48,58 * * * *",
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
            "9,19,29,39,49,59 * * * *",
            parameter_defaults={
                "alert_type": "TWELVE_MILES_FISHING_ALERT",
                "alert_config_name": "TWELVE_MILES_FISHING_ALERT_OTHERS",
                "zones": ["0-3", "3-6", "6-12", "0-12"],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "except_flag_states": ["FR", "PF", "VE", "BE", "NL", "DE", "ES"],
            },
        ),
        clocks.CronClock(
            "0 * * * *",
            parameter_defaults={
                "alert_type": "NEAFC_FISHING_ALERT",
                "alert_config_name": "NEAFC_FISHING_ALERT",
                "hours_from_now": 8,
                "only_fishing_positions": True,
            },
        ),
        clocks.CronClock(
            "6 * * 3-5 *",
            parameter_defaults={
                "alert_type": "BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT",
                "alert_config_name": "BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT",
                "zones": ["EOS - Lingues bleues"],
                "hours_from_now": 8,
                "only_fishing_positions": False,
                "species_onboard": ["BLI"],
                "species_onboard_min_weight": 6000.0,
            },
        ),
        clocks.CronClock(
            "16,46 * * * *",
            parameter_defaults={
                "alert_type": "BOTTOM_GEAR_VME_FISHING_ALERT",
                "alert_config_name": "BOTTOM_GEAR_VME_FISHING_ALERT",
                "zones": [
                    "Atlantique 400m - Ecosystèmes Marins Vulnérables (EMV) - Engins de fond"
                ],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "fishing_gears": [
                    "TB",
                    "GNS",
                    "LLS",
                    "LVS",
                    "OTB",
                    "OTT",
                    "PTB",
                    "TBB",
                    "TBN",
                    "TBS",
                ],
                "fishing_gear_categories": ["Dragues", "Pièges et casiers"],
                "include_vessels_unknown_gear": True,
                "min_depth": 400.0,
            },
        ),
        clocks.CronClock(
            "26,56 * * * *",
            parameter_defaults={
                "alert_type": "BOTTOM_TRAWL_800_METERS_FISHING_ALERT",
                "alert_config_name": "BOTTOM_TRAWL_800_METERS_FISHING_ALERT",
                "zones": [
                    "Interdiction chalutage de fond ATL - Profondeur supérieure à 800m"
                ],
                "hours_from_now": 8,
                "only_fishing_positions": True,
                "fishing_gears": ["TB", "OTB", "OTT", "PTB", "TBB", "TBN", "TBS"],
                "include_vessels_unknown_gear": True,
                "min_depth": 800.0,
            },
        ),
    ]
)
refresh_materialized_view.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "20 4 * * *",
            parameter_defaults={
                "view_name": "analytics_controls_full_data",
            },
        ),
    ]
)
regulations.flow.schedule = CronSchedule("2,32 * * * *")
regulations_checkup.flow.schedule = CronSchedule("5 6 * * 1,2,3,4,5")
regulations_open_data.flow.schedule = CronSchedule("18 1 * * 5")
risk_factor.flow.schedule = CronSchedule("3,23,43 * * * *")
scrape_legipeche.flow.schedule = CronSchedule("15 5 * * 1,2,3,4,5")
suspicions_of_under_declaration_alerts.flow.schedule = CronSchedule("57 6 * * *")
validate_pending_alerts.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "50 6 * * *",
            parameter_defaults={
                "alert_type": "MISSING_FAR_ALERT",
            },
        ),
    ]
)
vessel_profiles.flow.schedule = CronSchedule("51 * * * *")
vessels.flow.schedule = CronSchedule("2 2,5,8,11,14,20,23 * * *")


###################### List flows to register with prefect server #####################
flows_to_register = [
    activity_visualizations.flow,
    admin_areas.flow,
    anchorages.flow,
    beacons.flow,
    clean_flow_runs.flow,
    control_anteriority.flow,
    control_units.flow,
    controls.flow,
    controls_open_data.flow,
    current_segments.flow,
    distribute_pnos.flow,
    districts.flow,
    email_actions_to_units.flow,
    enrich_logbook.flow,
    enrich_positions.flow,
    logbook.flow,
    facade_areas.flow,
    fao_areas.flow,
    fishing_gear_codes.flow,
    foreign_fmcs.flow,
    infractions.flow,
    init_2025_segments.flow,
    init_pno_types.flow,
    init_pno_subscriptions.flow,
    init_species_groups.flow,
    last_positions.flow,
    missing_dep_alerts.flow,
    missing_far_alerts.flow,
    missing_trip_numbers.flow,
    missions.flow,
    notify_beacon_malfunctions.flow,
    update_beacon_malfunctions.flow,
    ports.flow,
    position_alerts.flow,
    recompute_controls_segments.flow,
    refresh_materialized_view.flow,
    regulations.flow,
    regulations_checkup.flow,
    regulations_open_data.flow,
    risk_factor.flow,
    scrape_legipeche.flow,
    species.flow,
    suspicions_of_under_declaration_alerts.flow,
    validate_pending_alerts.flow,
    vessel_profiles.flow,
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
    if flow.name == logbook.flow.name:
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

    elif flow.name in (init_pno_subscriptions.flow.name,):
        host_config = {
            "mounts": [
                Mount(
                    target=NON_COMMITED_DATA_LOCATION.as_posix(),
                    source="/opt/pipeline-data",
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
        labels=[FLOWS_LABEL],
    )
