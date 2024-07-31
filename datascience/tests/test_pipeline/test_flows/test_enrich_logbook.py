from datetime import datetime
from logging import Logger

import pandas as pd
import pytest
import pytz
from sqlalchemy import text

from config import default_risk_factors
from src.db_config import create_engine
from src.pipeline.flows.enrich_logbook import (
    compute_pno_risk_factors,
    compute_pno_segments,
    compute_pno_types,
    extract_all_control_priorities,
    extract_control_anteriority,
    extract_pno_species_and_gears,
    extract_pno_trips_period,
    extract_pno_types,
    flag_pnos_to_verify_and_send,
    flow,
    load_enriched_pnos,
    merge_pnos_data,
    reset_pnos,
)
from src.pipeline.helpers.dates import Period
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def control_anteriority() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["ABC000055481", "ABC000306959", "OLD_VESSEL_1"],
            "control_rate_risk_factor": [1.75, 1.75, 1.75],
            "infraction_rate_risk_factor": [1.0, 1.0, 1.0],
        }
    )


@pytest.fixture
def sample_control_anteriority() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["CFR000000001", "CFR000000006", "CFR000000004"],
            "control_rate_risk_factor": [1.75, 4, 2.5],
            "infraction_rate_risk_factor": [1.0, 3.0, 1.0],
        }
    )


@pytest.fixture
def expected_all_control_priorities() -> pd.DataFrame:
    current_year = datetime.utcnow().year

    return pd.DataFrame(
        {
            "year": [current_year - 1, current_year - 1, current_year, current_year],
            "facade": ["SA", "SA", "SA", "SA"],
            "segment": ["SWW01/02/03", "SWW04", "SWW01/02/03", "SWW04"],
            "control_priority_level": [2.0, 2.0, 1.0, 3.0],
        }
    )


@pytest.fixture
def expected_pno_types() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "pno_type_id": [1, 1, 1, 2, 2, 3, 4],
            "pno_type_name": [
                "Préavis type 1",
                "Préavis type 1",
                "Préavis type 1",
                "Préavis type 2",
                "Préavis type 2",
                "Préavis par pavillon",
                "Préavis par engin",
            ],
            "minimum_notification_period": [4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0],
            "has_designated_ports": [True, True, True, True, True, True, True],
            "pno_type_rule_id": [1, 2, 3, 4, 5, 6, 7],
            "species": [
                ["HKE", "BSS", "COD", "ANF", "SOL"],
                ["HKE"],
                ["HER", "MAC", "HOM", "WHB"],
                ["HKE", "BSS", "COD", "ANF", "SOL"],
                ["HER", "MAC", "HOM", "WHB"],
                [],
                [],
            ],
            "fao_areas": [
                [
                    "27.3.a",
                    "27.4",
                    "27.6",
                    "27.7",
                    "27.8.a",
                    "27.8.b",
                    "27.8.c",
                    "27.8.d",
                    "27.9.a",
                ],
                ["37"],
                ["27", "34.1.2", "34.2"],
                [
                    "27.3.a",
                    "27.4",
                    "27.6",
                    "27.7",
                    "27.8.a",
                    "27.8.b",
                    "27.8.c",
                    "27.8.d",
                    "27.9.a",
                ],
                ["27", "34.1.2", "34.2"],
                [],
                [],
            ],
            "gears": [[], [], [], [], [], [], ["SB"]],
            "flag_states": [[], [], [], [], [], ["GBR", "VEN"], []],
            "minimum_quantity_kg": [0.0, 0.0, 10000.0, 2000.0, 10000.0, 0.0, 0.0],
        }
    )


@pytest.fixture
def sample_pno_species_and_gears() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [1, 2, 3, 4, 4, 4, 5, 5, 5, 6, 7, 8],
            "cfr": [
                "CFR000000001",
                "CFR000000002",
                "CFR000000003",
                "CFR000000004",
                "CFR000000004",
                "CFR000000004",
                "___TARGET___",
                "___TARGET___",
                "___TARGET___",
                "CFR000000006",
                "CFR000000001",  # The same vessel has two PNOs
                "CFR000000008",
            ],
            "predicted_arrival_datetime_utc": [
                datetime(2021, 5, 2),
                datetime(2022, 5, 2),
                datetime(2023, 5, 2),
                datetime(2023, 5, 3),
                datetime(2023, 5, 3),
                datetime(2023, 5, 3),
                datetime(2023, 5, 6),
                datetime(2023, 5, 6),
                datetime(2023, 5, 6),
                datetime(2023, 5, 9),
                datetime(2023, 5, 10),
                datetime(2023, 5, 11),
            ],
            "year": [
                2021,
                2022,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
            ],
            "species": [
                "HKE",
                "HKE",
                "HKE",
                "BSS",
                "COD",
                "COD",
                "MAC",
                "HOM",
                "HER",
                "HKE",
                None,
                None,
            ],
            "trip_gears": [
                [
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                ],
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
                [],
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "SB", "mesh": 20, "dimensions": "4.5"}],
            ],
            "fao_area": [
                "27.9.a",
                "27.9.a",
                "37.1.3",
                "27.7.d",
                "27.8.c",
                "27.10.c",
                "27.7.d",
                "27.8.a",
                "34.1.2",
                "27.2.a",
                None,
                None,
            ],
            "weight": [
                1500.0,
                2500.0,
                2500.0,
                800.0,
                800.0,
                800.0,
                5000.0,
                5000.0,
                5000.0,
                3500.0,
                None,
                None,
            ],
            "flag_state": [
                "FRA",
                "FRA",
                "GBR",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
            ],
            "locode": [
                "FRABH",
                "FRABH",
                "FRUUU",
                "FRLEH",
                "FRLEH",
                "FRLEH",
                "FRAMO",
                "FRAMO",
                "FRAMO",
                "FRAAA",
                "FRDPE",
                "FRLEH",
            ],
            "facade": [
                "SA",
                "SA",
                "MEMN",
                "SA",
                "SA",
                "SA",
                "NAMO",
                "NAMO",
                "NAMO",
                "MED",
                "Guadeloupe",
                "Guadeloupe",
            ],
        }
    )


@pytest.fixture
def sample_all_control_priorities() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "year": [2023, 2023, 2023, 2023, 2023, 2022, 2022],
            "facade": ["MED", "MED", "MEMN", "SA", "Guadeloupe", "SA", "MED"],
            "segment": [
                "SHKE27",
                "SOTM",
                "SOTM",
                "SxTB8910",
                "SOTM",
                "SxTB8910",
                "SHKE27",
            ],
            "control_priority_level": [2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6],
        }
    )


@pytest.fixture
def expected_pno_species_and_gears() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [13, 14],
            "cfr": ["SOCR4T3", "SOCR4T3"],
            "predicted_arrival_datetime_utc": [
                datetime(2020, 5, 6, 20, 41, 3, 340000),
                datetime(2020, 5, 6, 20, 41, 9, 200000),
            ],
            "year": [2020, 2020],
            "species": ["GHL", None],
            "trip_gears": [
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
            ],
            "fao_area": ["27.7.a", None],
            "weight": [1500.0, None],
            "flag_state": ["CYP", "CYP"],
            "locode": ["GBPHD", None],
            "facade": ["MEMN", None],
        }
    )


@pytest.fixture
def segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "year": [2023, 2023, 2023, 2023, 2015],
            "segment": ["SOTM", "SHKE27", "NWW01", "SxTB8910", "SxTB8910-2015"],
            "segment_name": [
                "Chaluts pélagiques",
                "Merlu en zone 27",
                "Senne de plage",
                "Merlu Morue xTB zones 8 9 10",
                "Merlu Morue xTB zones 8 9 10 (2015)",
            ],
            "gears": [
                ["OTM", "PTM"],
                [],
                ["SB"],
                ["OTB", "PTB"],
                ["OTB", "PTB"],
            ],
            "fao_areas": [
                [],
                ["27"],
                [],
                ["27.8", "27.9", "27.10"],
                ["27.8", "27.9", "27.10"],
            ],
            "species": [
                [],
                ["HKE"],
                [],
                ["HKE", "COD"],
                ["HKE", "COD"],
            ],
            "impact_risk_factor": [2.5, 2.8, 1.9, 3.5, 3.2],
        }
    )


@pytest.fixture
def expected_computed_pno_types() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [1, 2, 3, 4, 5, 6, 7, 8],
            "cfr": [
                "CFR000000001",
                "CFR000000002",
                "CFR000000003",
                "CFR000000004",
                "___TARGET___",
                "CFR000000006",
                "CFR000000001",  # The same vessel has two PNOs
                "CFR000000008",
            ],
            "locode": [
                "FRABH",
                "FRABH",
                "FRUUU",
                "FRLEH",
                "FRAMO",
                "FRAAA",
                "FRDPE",
                "FRLEH",
            ],
            "flag_state": ["FRA", "FRA", "GBR", "FRA", "FRA", "FRA", "FRA", "FRA"],
            "predicted_arrival_datetime_utc": [
                datetime(2021, 5, 2),
                datetime(2022, 5, 2),
                datetime(2023, 5, 2),
                datetime(2023, 5, 3),
                datetime(2023, 5, 6),
                datetime(2023, 5, 9),
                datetime(2023, 5, 10),
                datetime(2023, 5, 11),
            ],
            "trip_gears": [
                [
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                ],
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
                [],
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "SB", "mesh": 20, "dimensions": "4.5"}],
            ],
            "pno_types": [
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    }
                ],
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                    {
                        "pnoTypeName": "Préavis type 2",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                ],
                [
                    {
                        "pnoTypeName": "Préavis par pavillon",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                ],
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    }
                ],
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                    {
                        "pnoTypeName": "Préavis type 2",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                ],
                None,
                None,
                [
                    {
                        "pnoTypeName": "Préavis par engin",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    }
                ],
            ],
        }
    )


@pytest.fixture
def expected_computed_pno_segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [1, 2, 3, 4, 5, 6, 7, 8],
            "trip_segments": [
                None,
                None,
                None,
                [
                    {
                        "segment": "SxTB8910",
                        "segmentName": "Merlu Morue xTB zones 8 9 10",
                    }
                ],
                [{"segment": "SOTM", "segmentName": "Chaluts pélagiques"}],
                [
                    {"segment": "SHKE27", "segmentName": "Merlu en zone 27"},
                    {"segment": "SOTM", "segmentName": "Chaluts pélagiques"},
                ],
                [{"segment": "SOTM", "segmentName": "Chaluts pélagiques"}],
                [{"segment": "NWW01", "segmentName": "Senne de plage"}],
            ],
            "impact_risk_factor": [
                default_risk_factors["impact_risk_factor"],
                default_risk_factors["impact_risk_factor"],
                default_risk_factors["impact_risk_factor"],
                3.5,
                2.5,
                2.8,
                2.5,
                1.9,
            ],
            "control_priority_level": [
                default_risk_factors["control_priority_level"],
                default_risk_factors["control_priority_level"],
                default_risk_factors["control_priority_level"],
                2.3,
                default_risk_factors["control_priority_level"],
                2.1,
                2.4,
                default_risk_factors["control_priority_level"],
            ],
        }
    )


@pytest.fixture
def pnos_to_load() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [13, 14],
            "trip_gears": [
                [
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                ],
                [],
            ],
            "pno_types": [
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                    {
                        "pnoTypeName": "Préavis type 2",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                ],
                None,
            ],
            "trip_segments": [
                None,
                [
                    {"segment": "SHKE27", "segmentName": "Merlu en zone 27"},
                    {"segment": "SOTM", "segmentName": "Chaluts pélagiques"},
                ],
            ],
            "is_in_verification_scope": [False, True],
            "is_verified": [False, False],
            "is_sent": [False, False],
            "is_being_sent": [True, False],
            "risk_factor": [1.0, 3.8],
        }
    )


@pytest.fixture
def pnos_to_load_bis(pnos_to_load) -> pd.DataFrame:
    return pnos_to_load.assign(
        is_in_verification_scope=~pnos_to_load.is_in_verification_scope,
        is_verified=~pnos_to_load.is_verified,
        is_sent=~pnos_to_load.is_sent,
        is_being_sent=~pnos_to_load.is_being_sent,
    )


@pytest.fixture
def pno_in_test_data() -> pd.Series:
    return pd.Series(
        {
            "id": 8,
            "enriched": False,
            "trip_gears": None,
            "pno_types": None,
            "trip_segments": None,
            "is_in_verification_scope": None,
            "is_verified": None,
            "is_sent": None,
            "is_being_sent": None,
        }
    )


@pytest.fixture
def expected_loaded_pnos() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [8, 13, 14],
            "enriched": [False, True, True],
            "trip_gears": [
                None,
                [
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                ],
                [],
            ],
            "pno_types": [
                None,
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "hasDesignatedPorts": True,
                        "minimumNotificationPeriod": 4.0,
                    },
                    {
                        "pnoTypeName": "Préavis type 2",
                        "hasDesignatedPorts": True,
                        "minimumNotificationPeriod": 4.0,
                    },
                ],
                [],
            ],
            "trip_segments": [
                None,
                [],
                [
                    {"segment": "SHKE27", "segmentName": "Merlu en zone 27"},
                    {"segment": "SOTM", "segmentName": "Chaluts pélagiques"},
                ],
            ],
            "is_in_verification_scope": [None, False, True],
            "is_verified": [None, False, False],
            "is_sent": [None, False, False],
            "is_being_sent": [None, True, False],
        }
    )


@pytest.fixture
def expected_loaded_pnos_bis(pnos_to_load_bis, pno_in_test_data) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [8, 13, 14],
            "enriched": [False, True, True],
            "trip_gears": [
                None,
                [
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                ],
                [],
            ],
            "pno_types": [
                None,
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "hasDesignatedPorts": True,
                        "minimumNotificationPeriod": 4.0,
                    },
                    {
                        "pnoTypeName": "Préavis type 2",
                        "hasDesignatedPorts": True,
                        "minimumNotificationPeriod": 4.0,
                    },
                ],
                [],
            ],
            "trip_segments": [
                None,
                [],
                [
                    {"segment": "SHKE27", "segmentName": "Merlu en zone 27"},
                    {"segment": "SOTM", "segmentName": "Chaluts pélagiques"},
                ],
            ],
            "is_in_verification_scope": [None, False, True],
            "is_verified": [None, False, False],
            "is_sent": [None, False, False],
            "is_being_sent": [None, True, False],
        }
    )


@pytest.fixture
def merged_pnos() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [1, 2, 3, 4, 5, 6, 7, 8],
            "cfr": [
                "CFR000000001",
                "CFR000000002",
                "CFR000000003",
                "CFR000000004",
                "___TARGET___",
                "CFR000000006",
                "CFR000000001",  # The same vessel has two PNOs
                "CFR000000008",
            ],
            "locode": [
                "FRABH",
                "FRABH",
                "FRUUU",
                "FRLEH",
                "FRAMO",
                "FRAAA",
                "FRDPE",
                "FRLEH",
            ],
            "flag_state": ["FRA", "FRA", "GBR", "FRA", "FRA", "FRA", "FRA", "FRA"],
            "predicted_arrival_datetime_utc": [
                datetime(2021, 5, 2),
                datetime(2022, 5, 2),
                datetime(2023, 5, 2),
                datetime(2023, 5, 3),
                datetime(2023, 5, 6),
                datetime(2023, 5, 9),
                datetime(2023, 5, 10),
                datetime(2023, 5, 11),
            ],
            "trip_gears": [
                [
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                ],
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
                [],
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "SB", "mesh": 20, "dimensions": "4.5"}],
            ],
            "pno_types": [
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    }
                ],
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                    {
                        "pnoTypeName": "Préavis type 2",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                ],
                [
                    {
                        "pnoTypeName": "Préavis par pavillon",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                ],
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    }
                ],
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                    {
                        "pnoTypeName": "Préavis type 2",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    },
                ],
                None,
                None,
                [
                    {
                        "pnoTypeName": "Préavis par engin",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True,
                    }
                ],
            ],
            "trip_segments": [
                None,
                None,
                None,
                [
                    {
                        "segment": "SxTB8910",
                        "segmentName": "Merlu Morue xTB zones 8 9 10",
                    }
                ],
                [{"segment": "SOTM", "segmentName": "Chaluts pélagiques"}],
                [
                    {"segment": "SHKE27", "segmentName": "Merlu en zone 27"},
                    {"segment": "SOTM", "segmentName": "Chaluts pélagiques"},
                ],
                [{"segment": "SOTM", "segmentName": "Chaluts pélagiques"}],
                [{"segment": "NWW01", "segmentName": "Senne de plage"}],
            ],
            "impact_risk_factor": [
                default_risk_factors["impact_risk_factor"],
                default_risk_factors["impact_risk_factor"],
                default_risk_factors["impact_risk_factor"],
                3.5,
                2.5,
                2.8,
                2.5,
                1.9,
            ],
            "control_priority_level": [
                default_risk_factors["control_priority_level"],
                default_risk_factors["control_priority_level"],
                default_risk_factors["control_priority_level"],
                2.3,
                default_risk_factors["control_priority_level"],
                2.1,
                2.4,
                default_risk_factors["control_priority_level"],
            ],
        }
    )


@pytest.fixture
def pnos_with_risk_factors(merged_pnos) -> pd.DataFrame:
    return merged_pnos.drop(
        columns=["impact_risk_factor", "control_priority_level"]
    ).assign(
        risk_factor=[
            1.15016332,
            1.74110113,
            1.74110113,
            1.98943874,
            2.09127911,
            2.90829063,
            1.71949265,
            1.97958756,
        ]
    )


@pytest.fixture
def flagged_pnos(pnos_with_risk_factors) -> pd.DataFrame:
    return pnos_with_risk_factors.assign(
        is_in_verification_scope=[False, False, True, False, False, True, False, False],
        is_verified=[False, False, False, False, False, False, False, False],
        is_sent=[False, False, False, False, False, False, False, False],
        is_being_sent=[False, False, False, False, True, False, True, True],
    )


def test_extract_all_control_priorities(
    reset_test_data, expected_all_control_priorities
):
    res = extract_all_control_priorities.run()
    pd.testing.assert_frame_equal(res, expected_all_control_priorities)


def test_extract_pno_types(reset_test_data, expected_pno_types):
    pno_types = extract_pno_types.run()
    pd.testing.assert_frame_equal(pno_types, expected_pno_types)


def test_extract_pno_trips_period(reset_test_data):
    pno_period = Period(
        start=datetime(2020, 5, 6, 18, 30, 0), end=datetime(2020, 5, 6, 18, 50, 0)
    )
    expected_trips_period = Period(
        start=pytz.UTC.localize(datetime(2020, 5, 4, 19, 41, 3, 340000)),
        end=pytz.UTC.localize(datetime(2020, 5, 6, 20, 41, 9, 200000)),
    )
    trips_period = extract_pno_trips_period(period=pno_period)
    assert trips_period == expected_trips_period


def test_extract_pno_trips_period_when_no_pno_is_in_queried_period(reset_test_data):
    pno_period = Period(
        start=datetime(1950, 1, 1, 0, 0, 0), end=datetime(1950, 1, 1, 0, 0, 0)
    )

    trips_period = extract_pno_trips_period(period=pno_period)
    assert trips_period is None


def test_extract_pno_species_and_gears(reset_test_data, expected_pno_species_and_gears):
    pno_species_and_gears = extract_pno_species_and_gears(
        pno_emission_period=Period(
            start=datetime(2020, 5, 6, 18, 30, 0), end=datetime(2020, 5, 6, 18, 50, 0)
        ),
        trips_period=Period(
            start=pytz.UTC.localize(datetime(2020, 5, 4, 19, 41, 3, 340000)),
            end=pytz.UTC.localize(datetime(2020, 5, 6, 20, 41, 9, 200000)),
        ),
    )

    pd.testing.assert_frame_equal(
        pno_species_and_gears.sort_values("logbook_reports_pno_id").reset_index(
            drop=True
        ),
        expected_pno_species_and_gears,
    )


def test_extract_control_anteriority(reset_test_data, control_anteriority):
    res = extract_control_anteriority.run()
    pd.testing.assert_frame_equal(res, control_anteriority)


def test_compute_pno_types(
    expected_pno_types, sample_pno_species_and_gears, expected_computed_pno_types
):
    res = compute_pno_types(sample_pno_species_and_gears, expected_pno_types)
    pd.testing.assert_frame_equal(res, expected_computed_pno_types)


def test_compute_pno_types_with_empty_gears_list_only(
    expected_pno_types, sample_pno_species_and_gears, expected_computed_pno_types
):
    assert sample_pno_species_and_gears.loc[2, "trip_gears"] == []
    res = compute_pno_types(sample_pno_species_and_gears.loc[[2]], expected_pno_types)
    pd.testing.assert_frame_equal(
        res, expected_computed_pno_types.loc[[2]].reset_index(drop=True)
    )


def test_compute_pno_segments(
    reset_test_data,
    sample_pno_species_and_gears,
    segments,
    sample_all_control_priorities,
    expected_computed_pno_segments,
):
    res = compute_pno_segments(
        sample_pno_species_and_gears, segments, sample_all_control_priorities
    )
    pd.testing.assert_frame_equal(res, expected_computed_pno_segments)


def test_compute_pno_segments_with_empty_gears_only(
    reset_test_data,
    sample_pno_species_and_gears,
    segments,
    sample_all_control_priorities,
    expected_computed_pno_segments,
):
    assert sample_pno_species_and_gears.loc[2, "trip_gears"] == []
    res = compute_pno_segments(
        sample_pno_species_and_gears.loc[[2]], segments, sample_all_control_priorities
    )
    pd.testing.assert_frame_equal(
        res, expected_computed_pno_segments.loc[[2]].reset_index(drop=True)
    )


def test_merge_pnos_data(
    expected_computed_pno_types,
    expected_computed_pno_segments,
    merged_pnos,
):
    res = merge_pnos_data(
        expected_computed_pno_types,
        expected_computed_pno_segments,
    )
    pd.testing.assert_frame_equal(res, merged_pnos)


def test_compute_pno_risk_factors(
    merged_pnos, sample_control_anteriority, pnos_with_risk_factors
):
    res = compute_pno_risk_factors(
        pnos=merged_pnos,
        control_anteriority=sample_control_anteriority,
    )
    pd.testing.assert_frame_equal(res, pnos_with_risk_factors)


def test_flag_pnos_to_verify_and_send(
    pnos_with_risk_factors,
    flagged_pnos,
    pno_units_targeting_vessels,
    pno_units_ports_and_segments_subscriptions,
):
    res = flag_pnos_to_verify_and_send(
        pnos=pnos_with_risk_factors,
        pno_units_targeting_vessels=pno_units_targeting_vessels,
        pno_units_ports_and_segments_subscriptions=pno_units_ports_and_segments_subscriptions,
        predicted_arrival_threshold=datetime(2023, 5, 2, 14, 12, 25),
    )
    pd.testing.assert_frame_equal(res, flagged_pnos)


def test_load_then_reset_logbook(
    reset_test_data,
    pnos_to_load,
    pnos_to_load_bis,
    expected_loaded_pnos,
    expected_loaded_pnos_bis,
):
    query = (
        "SELECT "
        "id, "
        "enriched, "
        "trip_gears, "
        "value->'pnoTypes' AS pno_types, "
        "trip_segments, "
        "(value->>'isInVerificationScope')::BOOLEAN AS is_in_verification_scope, "
        "(value->>'isVerified')::BOOLEAN AS is_verified, "
        "(value->>'isSent')::BOOLEAN AS is_sent, "
        "(value->>'isBeingSent')::BOOLEAN AS is_being_sent "
        "FROM logbook_reports "
        "WHERE "
        "   log_type = 'PNO' AND "
        "   operation_datetime_utc < ("
        "       CURRENT_TIMESTAMP AT TIME ZONE 'UTC' "
        "       - INTERVAL '2 months'"
        "   ) "
        "ORDER BY id "
    )
    initial_pnos = read_query(query, db="monitorfish_remote")
    pno_period = Period(
        start=datetime(2020, 5, 6, 18, 30, 0), end=datetime(2020, 5, 6, 18, 50, 0)
    )
    logger = Logger("myLogger")
    load_enriched_pnos(enriched_pnos=pnos_to_load, period=pno_period, logger=logger)
    final_pnos = read_query(query, db="monitorfish_remote")

    assert not initial_pnos.enriched.any()
    assert not final_pnos.loc[final_pnos.id == 8, "enriched"].values[0]
    assert final_pnos.loc[final_pnos.id.isin([13, 14]), "enriched"].all()

    pd.testing.assert_frame_equal(final_pnos, expected_loaded_pnos)

    # Reset logbook and check that the logbook_reports table is back to its original
    # state, except for the distribution attributes, which are not reset.
    reset_pnos.run(pno_period)

    distribution_attributes = [
        "is_in_verification_scope",
        "is_verified",
        "is_sent",
        "is_being_sent",
    ]

    pnos_after_reset = read_query(query, db="monitorfish_remote")

    pd.testing.assert_frame_equal(
        pnos_after_reset.drop(columns=distribution_attributes),
        initial_pnos.drop(columns=distribution_attributes),
    )

    pd.testing.assert_frame_equal(
        pnos_after_reset[distribution_attributes],
        expected_loaded_pnos[distribution_attributes],
    )

    # Loading enriched PNOs should update all attributes except ditribution
    # attributes which should remain unchanged if not null.
    load_enriched_pnos(enriched_pnos=pnos_to_load_bis, period=pno_period, logger=logger)

    pnos_bis_loaded = read_query(query, db="monitorfish_remote")

    pd.testing.assert_frame_equal(pnos_bis_loaded, expected_loaded_pnos_bis)

    with pytest.raises(AssertionError):
        pd.testing.assert_frame_equal(
            pnos_bis_loaded.loc[
                pnos_bis_loaded.id.isin(pnos_to_load_bis.logbook_reports_pno_id),
                distribution_attributes,
            ].reset_index(),
            pnos_to_load_bis[distribution_attributes],
            check_dtype=False,
        )


def test_flow_abracadabra(reset_test_data):
    query = (
        "SELECT id, enriched, trip_gears, value->'pnoTypes' AS pno_types, (value->>'riskFactor')::DOUBLE PRECISION AS risk_factor, trip_segments "
        "FROM logbook_reports "
        "WHERE "
        "   log_type = 'PNO' AND "
        "   operation_datetime_utc < ("
        "       CURRENT_TIMESTAMP AT TIME ZONE 'UTC' "
        "       - INTERVAL '2 months'"
        "   ) "
        "ORDER BY id "
    )

    initial_pnos = read_query(query, db="monitorfish_remote")

    now = datetime.utcnow()
    pno_start_date = datetime(2020, 5, 5)
    pno_end_date = datetime(2020, 5, 7)

    start_hours_ago = int((now - pno_start_date).total_seconds() / 3600)
    end_hours_ago = int((now - pno_end_date).total_seconds() / 3600)
    minutes_per_chunk = 2 * 24 * 60

    flow.schedule = None
    # First run
    state = flow.run(
        start_hours_ago=start_hours_ago,
        end_hours_ago=end_hours_ago,
        minutes_per_chunk=minutes_per_chunk,
        recompute_all=False,
    )
    assert state.is_successful()

    pnos_after_first_run = read_query(query, db="monitorfish_remote")

    # Manual update : reset PNO n°13, modify PNO n°14
    e = create_engine("monitorfish_remote")
    with e.begin() as conn:
        conn.execute(text("UPDATE logbook_reports SET enriched = false WHERE id = 13;"))

        conn.execute(
            text(
                "UPDATE logbook_reports "
                """SET trip_gears = '[{"gear": "This was set manually"}]'::jsonb """
                "WHERE id = 14;"
            )
        )

    # Second run without reset : manual modifications on PNO n°13 should be preserved
    state = flow.run(
        start_hours_ago=start_hours_ago,
        end_hours_ago=end_hours_ago,
        minutes_per_chunk=minutes_per_chunk,
        recompute_all=False,
    )
    assert state.is_successful()

    pnos_after_second_run_without_reset = read_query(query, db="monitorfish_remote")

    # Third run with reset : manual modifications on PNO n°13 should be erased and
    # recomputed.
    state = flow.run(
        start_hours_ago=start_hours_ago,
        end_hours_ago=end_hours_ago,
        minutes_per_chunk=minutes_per_chunk,
        recompute_all=True,
    )
    assert state.is_successful()

    pnos_after_third_run_with_reset = read_query(query, db="monitorfish_remote")

    # Initially no PNO should be enriched
    assert (
        not initial_pnos[["enriched", "trip_gears", "pno_types", "trip_segments"]]
        .any()
        .any()
    )

    # After first run PNO with ids 13 and 14 should be enriched
    assert set(pnos_after_first_run.loc[pnos_after_first_run.enriched, "id"]) == {
        13,
        14,
    }
    assert pnos_after_first_run.loc[pnos_after_first_run.id == 13, "trip_gears"].iloc[
        0
    ] == [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}]

    assert pnos_after_first_run.loc[pnos_after_first_run.id == 14, "trip_gears"].iloc[
        0
    ] == [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}]

    # After second run without reset, manual modifications on PNO n°14 should be
    # preserved
    assert pnos_after_second_run_without_reset.loc[
        pnos_after_second_run_without_reset.id == 13, "trip_gears"
    ].iloc[0] == [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}]
    assert pnos_after_second_run_without_reset.loc[
        pnos_after_second_run_without_reset.id == 14, "trip_gears"
    ].iloc[0] == [{"gear": "This was set manually"}]

    # After third run with reset, manual modifications on PNO n°14 should be erased and
    # recomputed.
    pd.testing.assert_frame_equal(pnos_after_first_run, pnos_after_third_run_with_reset)


def test_flow_with_no_pno_in_period_does_nothing(reset_test_data):
    query = "SELECT * FROM logbook_reports ORDER BY id"
    initial_logbook = read_query(query, db="monitorfish_remote")

    flow.schedule = None
    state = flow.run(
        start_hours_ago=0,
        end_hours_ago=0,
        minutes_per_chunk=10,
        recompute_all=False,
    )
    assert state.is_successful()
    final_logbook = read_query(query, db="monitorfish_remote")
    pd.testing.assert_frame_equal(initial_logbook, final_logbook)
