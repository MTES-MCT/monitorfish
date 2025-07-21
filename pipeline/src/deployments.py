from dataclasses import dataclass
from typing import List

from prefect import Flow
from prefect.runner.storage import LocalStorage
from prefect.schedules import Schedule

from config import (
    ERS_FILES_LOCATION,
    HOST_ENV_FILE_LOCATION,
    IS_INTEGRATION,
    LOGBOOK_FILES_GID,
    MAX_FISHING_SPEED_THRESHOLD,
    MIN_FISHING_SPEED_THRESHOLD,
    MINIMUM_CONSECUTIVE_POSITIONS,
    MINIMUM_MINUTES_OF_EMISSION_AT_SEA,
    PNO_TEST_MODE,
    PREFECT_API_URL,
    ROOT_DIRECTORY,
    TEST_MODE,
    WEEKLY_CONTROL_REPORT_EMAIL_TEST_MODE,
)
from src.flows.activity_visualizations import activity_visualizations_flow
from src.flows.admin_areas import admin_areas_flow
from src.flows.anchorages import anchorages_flow
from src.flows.beacons import beacons_flow
from src.flows.control_anteriority import control_anteriority_flow
from src.flows.control_units import control_units_flow
from src.flows.controls import controls_flow
from src.flows.controls_open_data import controls_open_data_flow
from src.flows.current_segments import current_segments_flow
from src.flows.distribute_pnos import distribute_pnos_flow
from src.flows.districts import districts_flow
from src.flows.email_actions_to_units import email_actions_to_units_flow
from src.flows.enrich_logbook import enrich_logbook_flow
from src.flows.enrich_positions import enrich_positions_flow
from src.flows.facade_areas import facade_areas_flow
from src.flows.fao_areas import fao_areas_flow
from src.flows.fishing_gear_codes import fishing_gear_codes_flow
from src.flows.foreign_fmcs import foreign_fmcs_flow
from src.flows.infractions import infractions_flow
from src.flows.init_pno_types import init_pno_types_flow
from src.flows.init_species_groups import init_species_groups_flow
from src.flows.last_positions import last_positions_flow
from src.flows.logbook import logbook_flow
from src.flows.missing_dep_alerts import missing_dep_alerts_flow
from src.flows.missing_far_alerts import missing_far_alerts_flow
from src.flows.missing_trip_numbers import missing_trip_numbers_flow
from src.flows.missions import missions_flow
from src.flows.notify_beacon_malfunctions import notify_beacon_malfunctions_flow
from src.flows.ports import ports_flow
from src.flows.position_alerts import position_alerts_flow
from src.flows.recompute_controls_segments import recompute_controls_segments_flow
from src.flows.refresh_materialized_view import refresh_materialized_view_flow
from src.flows.regulations import regulations_flow
from src.flows.regulations_checkup import regulations_checkup_flow
from src.flows.risk_factors import risk_factors_flow
from src.flows.scrape_legipeche import scrape_legipeche_flow
from src.flows.species import species_flow
from src.flows.suspicions_of_under_declaration_alerts import (
    suspicions_of_under_declaration_alerts_flow,
)
from src.flows.update_beacon_malfunctions import update_beacon_malfunctions_flow
from src.flows.validate_pending_alerts import validate_pending_alerts_flow
from src.flows.vessel_profiles import vessel_profiles_flow
from src.helpers.country_codes import (
    european_union_country_codes_iso_2,
    french_vessels_country_codes_iso_2,
)


################################# List flows to deploy ################################
@dataclass
class FlowAndSchedules:
    flow: Flow
    schedules: List[Schedule] = None


flows_to_deploy = [
    FlowAndSchedules(
        flow=activity_visualizations_flow, schedules=[Schedule(cron="0 20 1 * *")]
    ),
    FlowAndSchedules(
        flow=admin_areas_flow, schedules=[Schedule(cron="43 4 * * 1,2,3,4,5")]
    ),
    FlowAndSchedules(flow=anchorages_flow),
    FlowAndSchedules(
        flow=beacons_flow, schedules=[Schedule(cron="4,14,24,34,44,54 * * * *")]
    ),
    FlowAndSchedules(
        flow=control_anteriority_flow, schedules=[Schedule(cron="5 * * * *")]
    ),
    FlowAndSchedules(flow=control_units_flow, schedules=[Schedule(cron="12 8 * * *")]),
    FlowAndSchedules(flow=controls_flow),
    FlowAndSchedules(
        flow=controls_open_data_flow, schedules=[Schedule(cron="15 3 * * 5")]
    ),
    FlowAndSchedules(
        flow=current_segments_flow, schedules=[Schedule(cron="2,22,42 * * * *")]
    ),
    FlowAndSchedules(
        flow=distribute_pnos_flow,
        schedules=[
            Schedule(
                cron="* * * * *",
                parameters={
                    "test_mode": PNO_TEST_MODE,
                    "is_integration": IS_INTEGRATION,
                    "start_hours_ago": 120,
                    "end_hours_ago": 0,
                },
            )
        ],
    ),
    FlowAndSchedules(flow=districts_flow),
    FlowAndSchedules(
        flow=email_actions_to_units_flow,
        schedules=[
            Schedule(
                cron="0 5 * * 1",
                parameters={
                    "start_days_ago": 7,
                    "end_days_ago": 1,
                    "test_mode": WEEKLY_CONTROL_REPORT_EMAIL_TEST_MODE,
                    "is_integration": IS_INTEGRATION,
                },
            )
        ],
    ),
    FlowAndSchedules(
        flow=enrich_logbook_flow,
        schedules=[
            Schedule(
                cron="1,6,11,16,21,26,31,36,41,46,51,56 * * * *",
                parameters={
                    "start_hours_ago": 6,
                    "end_hours_ago": 0,
                    "minutes_per_chunk": 480,
                    "recompute_all": False,
                },
            )
        ],
    ),
    FlowAndSchedules(
        flow=enrich_positions_flow,
        schedules=[
            Schedule(
                cron="1-59 * * * *",
                parameters={
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
            Schedule(
                cron="0 * * * *",
                parameters={
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
        ],
    ),
    FlowAndSchedules(flow=species_flow),
    FlowAndSchedules(flow=facade_areas_flow),
    FlowAndSchedules(flow=fao_areas_flow),
    FlowAndSchedules(flow=fishing_gear_codes_flow),
    FlowAndSchedules(flow=foreign_fmcs_flow, schedules=[Schedule(cron="37 10 * * *")]),
    FlowAndSchedules(flow=infractions_flow, schedules=[Schedule(cron="1 8 * * *")]),
    FlowAndSchedules(flow=init_pno_types_flow),
    FlowAndSchedules(flow=init_species_groups_flow),
    FlowAndSchedules(
        flow=last_positions_flow,
        schedules=[
            Schedule(
                cron="* * * * *",
                parameters={"minutes": 1440, "action": "update"},
            ),
        ],
    ),
    FlowAndSchedules(
        flow=logbook_flow,
        schedules=[Schedule(cron="0,5,10,15,20,25,30,35,40,45,50,55 * * * *")],
    ),
    FlowAndSchedules(
        flow=missing_dep_alerts_flow, schedules=[Schedule(cron="5,25,45 * * * *")]
    ),
    FlowAndSchedules(
        flow=missing_far_alerts_flow,
        schedules=[
            Schedule(
                cron="45 6 * * *",
                parameters={
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
            Schedule(
                cron="55 6 * * *",
                parameters={
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
        ],
    ),
    FlowAndSchedules(
        flow=missing_trip_numbers_flow,
        schedules=[Schedule(cron="4,14,24,34,44,54 * * * *")],
    ),
    FlowAndSchedules(
        flow=missions_flow,
        schedules=[
            Schedule(
                cron="6 4 * * *",
                parameters={"number_of_months": 200},
            )
        ],
    ),
    FlowAndSchedules(
        flow=notify_beacon_malfunctions_flow,
        schedules=[
            Schedule(
                cron="* * * * *",
                parameters={
                    "test_mode": TEST_MODE,
                    "is_integration": IS_INTEGRATION,
                },
            ),
        ],
    ),
    FlowAndSchedules(flow=ports_flow),
    FlowAndSchedules(
        flow=position_alerts_flow,
        schedules=[
            Schedule(
                cron="1,11,21,31,41,51 * * * *",
                parameters={
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
            Schedule(
                cron="2,12,22,32,42,52 * * * *",
                parameters={
                    "alert_type": "RTC_FISHING_ALERT",
                    "alert_config_name": "RTC_FISHING_ALERT_FR",
                    "zones": ["Reg. RTC"],
                    "hours_from_now": 8,
                    "flag_states": ["FR"],
                    "only_fishing_positions": True,
                },
            ),
            # RTC alert for vessels flying a non FR flag : applies only in the FRA EEZ
            Schedule(
                cron="3,13,23,33,43,53 * * * *",
                parameters={
                    "alert_type": "RTC_FISHING_ALERT",
                    "alert_config_name": "RTC_FISHING_ALERT_NON_FR",
                    "zones": ["Reg. RTC"],
                    "hours_from_now": 8,
                    "except_flag_states": ["FR"],
                    "eez_areas": ["FRA"],
                    "only_fishing_positions": True,
                },
            ),
            Schedule(
                cron="4,14,24,34,44,54 * * * *",
                parameters={
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
            Schedule(
                cron="5,15,25,35,45,55 * * * *",
                parameters={
                    "alert_type": "TWELVE_MILES_FISHING_ALERT",
                    "alert_config_name": "TWELVE_MILES_FISHING_ALERT_BE_NL",
                    "zones": ["0-12_MINUS_BE_AND_NL_FISHING_AREAS"],
                    "hours_from_now": 8,
                    "only_fishing_positions": True,
                    "flag_states": ["BE", "NL"],
                },
            ),
            Schedule(
                cron="7,17,27,37,47,57 * * * *",
                parameters={
                    "alert_type": "TWELVE_MILES_FISHING_ALERT",
                    "alert_config_name": "TWELVE_MILES_FISHING_ALERT_ES",
                    "zones": ["0-12_MINUS_ES_FISHING_AREAS"],
                    "hours_from_now": 8,
                    "only_fishing_positions": True,
                    "flag_states": ["ES"],
                },
            ),
            Schedule(
                cron="8,18,28,38,48,58 * * * *",
                parameters={
                    "alert_type": "TWELVE_MILES_FISHING_ALERT",
                    "alert_config_name": "TWELVE_MILES_FISHING_ALERT_DE",
                    "zones": ["0-12_MINUS_DE_FISHING_AREAS"],
                    "hours_from_now": 8,
                    "only_fishing_positions": True,
                    "flag_states": ["DE"],
                },
            ),
            Schedule(
                cron="9,19,29,39,49,59 * * * *",
                parameters={
                    "alert_type": "TWELVE_MILES_FISHING_ALERT",
                    "alert_config_name": "TWELVE_MILES_FISHING_ALERT_OTHERS",
                    "zones": ["0-3", "3-6", "6-12", "0-12"],
                    "hours_from_now": 8,
                    "only_fishing_positions": True,
                    "except_flag_states": ["FR", "PF", "VE", "BE", "NL", "DE", "ES"],
                },
            ),
            Schedule(
                cron="0 * * * *",
                parameters={
                    "alert_type": "NEAFC_FISHING_ALERT",
                    "alert_config_name": "NEAFC_FISHING_ALERT",
                    "hours_from_now": 8,
                    "only_fishing_positions": True,
                },
            ),
            Schedule(
                cron="6 * * 3-5 *",
                parameters={
                    "alert_type": "BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT",
                    "alert_config_name": "BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT",
                    "zones": ["EOS - Lingues bleues"],
                    "hours_from_now": 8,
                    "only_fishing_positions": False,
                    "species_onboard": ["BLI"],
                    "species_onboard_min_weight": 6000.0,
                },
            ),
            Schedule(
                cron="16,46 * * * *",
                parameters={
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
            Schedule(
                cron="26,56 * * * *",
                parameters={
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
        ],
    ),
    FlowAndSchedules(flow=recompute_controls_segments_flow),
    FlowAndSchedules(
        flow=refresh_materialized_view_flow,
        schedules=[
            Schedule(
                "20 4 * * *",
                parameter_defaults={
                    "view_name": "analytics_controls_full_data",
                },
            ),
        ],
    ),
    FlowAndSchedules(
        flow=regulations_checkup_flow,
        schedules=[Schedule(cron="5 6 * * 1,2,3,4,5")],
    ),
    FlowAndSchedules(
        flow=regulations_flow,
        schedules=[Schedule(cron="2,32 * * * *")],
    ),
    FlowAndSchedules(
        flow=risk_factors_flow,
        schdules=[Schedule(cron="3,23,43 * * * *")],
    ),
    FlowAndSchedules(
        flow=scrape_legipeche_flow,
        schedules=[Schedule(cron="15 5 * * 1,2,3,4,5")],
    ),
    FlowAndSchedules(
        flow=suspicions_of_under_declaration_alerts_flow,
        schedules=[Schedule(cron="57 6 * * *")],
    ),
    FlowAndSchedules(
        flow=update_beacon_malfunctions_flow,
        schedules=[Schedule(cron="6,16,26,36,46,56 * * * *")],
    ),
    FlowAndSchedules(
        flow=validate_pending_alerts_flow,
        schedules=[
            Schedule(
                cron="50 6 * * *",
                parameters={"alert_type": "MISSING_FAR_ALERT"},
            )
        ],
    ),
    FlowAndSchedules(
        flow=vessel_profiles_flow,
        schedules=[Schedule(cron="51 * * * *")],
    ),
]


deployments = [
    flow_to_deploy.flow.to_deployment(
        name=flow_to_deploy.flow.name, schedules=flow_to_deploy.schedules
    )
    for flow_to_deploy in flows_to_deploy
]

################### Define flows' run config ####################
for deployment in deployments:
    deployment.job_variables = {
        "env": {"PREFECT_API_URL": PREFECT_API_URL},
        "volumes": [
            f"{HOST_ENV_FILE_LOCATION}:/home/monitorfish-pipeline/pipeline/.env"
        ],
    }
    deployment.concurrency_limit = 1
    deployment.work_pool_name = "monitorfish"
    deployment.storage = LocalStorage(ROOT_DIRECTORY.as_posix())

    if deployment.name == "logbook":
        deployment.job_variables["docker"] = {
            "run_config": {"group_add": [LOGBOOK_FILES_GID]}
        }
        deployment.job_variables[
            "volumes"
        ] += f"{ERS_FILES_LOCATION}:{ERS_FILES_LOCATION}"
