import datetime
from unittest.mock import patch

import pandas as pd
import sqlalchemy

from src.pipeline.flows.vessels import (
    clean_vessels,
    extract_beacon_numbers,
    extract_cee_vessels,
    extract_control_charters,
    extract_floats,
    extract_fr_vessels,
    extract_nav_licences,
    extract_non_cee_vessels,
    load_vessels,
)
from tests.mocks import mock_extract_side_effect


@patch("src.pipeline.flows.vessels.extract")
def test_extract_cee_vessels(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_cee_vessels.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_floats(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_floats.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_fr_vessels(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_fr_vessels.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_nav_licences(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_nav_licences.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_non_cee_vessels(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_non_cee_vessels.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_control_charters(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_control_charters.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_beacon_numbers(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_beacon_numbers.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


def test_clean_vessels():
    all_vessels = pd.DataFrame(
        {
            "id_nav_flotteur_f": [1, 2],
            "imo_f": ["123", None],
            "cfr_f": ["FRA000123456", None],
            "external_immatriculation_f": [None, "EXT12345"],
            "vessel_name_f": ["Le bateau", "Le navire"],
            "ircs_f": ["FAKE", "DUMMY"],
            "mmsi_f": [None, "MMSI_id"],
            "flag_state_f": ["FRA", None],
            "district_code_f": ["GV", None],
            "district_f": ["Le Guilvinec", None],
            "id_nav_flotteur_nf": [1, None],
            "length_nf": [12.56, None],
            "width_nf": [5.23, None],
            "gauge_nf": [125.2, None],
            "power_nf": [56.36, None],
            "vessel_phone_1_nf": ["0123456789", None],
            "vessel_phone_2_nf": ["0123456789", None],
            "vessel_phone_3_nf": ["9876543210", None],
            "vessel_phone_4_nf": [None, None],
            "vessel_email_1_nf": [None, None],
            "vessel_email_2_nf": [None, None],
            "vessel_type_nf": ["Chalutier", None],
            "registry_port_nf": ["Guilvinec", None],
            "sailing_types_nf": ["Pêche au large", None],
            "operator_name_nf": ["Opé pêche", None],
            "operator_email_nf": ["lepecheur@email.fish", None],
            "operator_phone_1_nf": ["123456789", None],
            "operator_phone_2_nf": ["123456789", None],
            "proprietor_name_nf": ["Le propriétaire", None],
            "proprietor_email_nf": ["proprio@peche.fish", None],
            "proprietor_phone_1_nf": ["12345678910", None],
            "proprietor_phone_2_nf": ["12345678910", None],
            "fishing_gear_main_nfp": ["OTM", None],
            "fishing_gear_secondary_nfp": ["OTB", None],
            "fishing_gear_third_nfp": ["DRB", None],
            "id_nav_flotteur_ncp": [1, None],
            "district_ncp": ["Guivinec", None],
            "length_ncp": [22.86, None],
            "gauge_ncp": [654.2, None],
            "power_ncp": [951.3, None],
            "operator_name_ncp": ["L'opérateur", None],
            "fishing_gear_main_ncp": [None, "OTM"],
            "fishing_gear_secondary_ncp": [None, "OTB"],
            "fishing_gear_third_ncp": [None, "DRB"],
            "vessel_type_ncp": [None, "Dragueur"],
            "operator_email_ncp": ["lepecheur@email.fish", "operateur@fish.net"],
            "proprietor_email_ncp": ["proprio@peche.fish", "proprio@fish.net"],
            "id_nav_flotteur_nep": [None, 2],
            "fishing_gear_main_nep": [None, "PTB"],
            "id_nav_flotteur_gin": [1, 2],
            "nav_licence_expiration_date": [
                datetime.datetime(2021, 6, 12, 0, 0, 0),
                None,
            ],
            "sailing_category": ["2ème", None],
            "beacon_number": [None, "beacbeac"],
            "beacon_status": [None, "Activée"],
            "under_charter": [True, False],
        }
    )

    cleaned_vessels = clean_vessels.run(all_vessels)

    expected_columns = [
        "id",
        "imo",
        "cfr",
        "external_immatriculation",
        "mmsi",
        "ircs",
        "vessel_name",
        "flag_state",
        "width",
        "length",
        "district",
        "district_code",
        "gauge",
        "registry_port",
        "power",
        "vessel_type",
        "sailing_category",
        "sailing_type",
        "declared_fishing_gears",
        "nav_licence_expiration_date",
        "proprietor_name",
        "proprietor_phones",
        "proprietor_emails",
        "operator_name",
        "operator_phones",
        "operator_emails",
        "vessel_phones",
        "vessel_emails",
        "beacon_number",
        "beacon_status",
        "under_charter",
    ]

    expected_values = [
        [
            1,
            "123",
            "FRA000123456",
            None,
            None,
            "FAKE",
            "Le bateau",
            "FRA",
            5.23,
            12.56,
            "Le Guilvinec",
            "GV",
            125.2,
            "Guilvinec",
            56.36,
            "Chalutier",
            "2ème",
            "Pêche au large",
            ["OTM", "OTB", "DRB"],
            pd.to_datetime(datetime.datetime(2021, 6, 12, 0, 0, 0)),
            "Le propriétaire",
            ["12345678910"],
            ["proprio@peche.fish"],
            "Opé pêche",
            ["123456789"],
            ["lepecheur@email.fish"],
            ["0123456789", "9876543210"],
            [],
            None,
            None,
            True,
        ],
        [
            2,
            None,
            None,
            "EXT12345",
            "MMSI_id",
            "DUMMY",
            "Le navire",
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            "Dragueur",
            None,
            None,
            ["OTM", "PTB", "OTB", "DRB"],
            None,
            None,
            [],
            ["proprio@fish.net"],
            None,
            [],
            ["operateur@fish.net"],
            [],
            [],
            "beacbeac",
            "Activée",
            False,
        ],
    ]

    expected_vessels = pd.DataFrame(
        data=expected_values, columns=pd.Index(expected_columns)
    )

    assert expected_columns == list(cleaned_vessels)

    assert (
        cleaned_vessels.notnull().values.tolist()
        == expected_vessels.notnull().values.tolist()
    )

    assert (
        cleaned_vessels.iloc[0].dropna().values.tolist()
        == expected_vessels.iloc[0].dropna().values.tolist()
    )

    assert (
        cleaned_vessels.iloc[1].dropna().values.tolist()
        == expected_vessels.iloc[1].dropna().values.tolist()
    )


def test_load_vessels(reset_test_data):
    columns = [
        "id",
        "imo",
        "cfr",
        "external_immatriculation",
        "mmsi",
        "ircs",
        "vessel_name",
        "flag_state",
        "width",
        "length",
        "district",
        "district_code",
        "gauge",
        "registry_port",
        "power",
        "vessel_type",
        "sailing_category",
        "sailing_type",
        "declared_fishing_gears",
        "nav_licence_expiration_date",
        "proprietor_name",
        "proprietor_phones",
        "proprietor_emails",
        "operator_name",
        "operator_phones",
        "operator_emails",
        "vessel_phones",
        "vessel_emails",
        "beacon_number",
        "beacon_status",
        "under_charter",
    ]

    values = [
        [
            1,
            "123",
            "FRA000123456",
            None,
            None,
            "FAKE",
            "Le bateau",
            "FRA",
            5.23,
            12.56,
            "Le Guilvinec",
            "GV",
            125.2,
            "Guilvinec",
            56.36,
            "Chalutier",
            "2ème",
            "Pêche au large",
            ["OTM", "OTB", "DRB"],
            pd.to_datetime(datetime.datetime(2021, 6, 12, 0, 0, 0)),
            "Le propriétaire",
            ["12345678910"],
            ["proprio@peche.fish"],
            "Opé pêche",
            ["123456789"],
            ["lepecheur@email.fish"],
            ["0123456789", "9876543210"],
            [],
            None,
            None,
            True,
        ],
        [
            2,
            None,
            None,
            "EXT12345",
            "MMSI_id",
            "DUMMY",
            "Le navire",
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            "Dragueur",
            None,
            None,
            ["OTM", "PTB", "OTB", "DRB"],
            None,
            None,
            [],
            ["proprio@fish.net"],
            None,
            [],
            ["operateur@fish.net"],
            [],
            [],
            "beacbeac",
            "Activée",
            False,
        ],
    ]

    dtypes = {
        "id": "int64",
        "imo": "category",
        "cfr": "category",
        "external_immatriculation": "category",
        "mmsi": "category",
        "ircs": "category",
        "vessel_name": "category",
        "flag_state": "category",
        "width": "Sparse[float64, nan]",
        "length": "object",
        "district": "object",
        "district_code": "category",
        "gauge": "object",
        "registry_port": "category",
        "power": "object",
        "vessel_type": "object",
        "sailing_category": "category",
        "sailing_type": "category",
        "declared_fishing_gears": "object",
        "nav_licence_expiration_date": "category",
        "proprietor_name": "category",
        "proprietor_phones": "object",
        "proprietor_emails": "object",
        "operator_name": "object",
        "operator_phones": "object",
        "operator_emails": "object",
        "vessel_phones": "object",
        "vessel_emails": "object",
    }

    dummy_vessels = pd.DataFrame(data=values, columns=pd.Index(columns))
    dummy_vessels = dummy_vessels.astype(dtypes)
    load_vessels.run(dummy_vessels)
