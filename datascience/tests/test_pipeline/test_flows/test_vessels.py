import datetime
from unittest.mock import patch

import pandas as pd
import sqlalchemy

from src.pipeline.flows.vessels import (
    beaconStatus,
    clean_vessels,
    extract_beacons,
    extract_cee_vessels,
    extract_control_charters,
    extract_floats,
    extract_fr_vessels,
    extract_nav_licences,
    extract_non_cee_vessels,
    load_vessels,
    transform_beacons,
)
from tests.mocks import mock_extract_side_effect

cleaned_vessels_data = {
    "id": [1, 2],
    "imo": ["123", None],
    "cfr": ["FRA000123456", None],
    "external_immatriculation": [None, "EXT12345"],
    "mmsi": [None, "MMSI_id"],
    "ircs": ["FAKE", "DUMMY"],
    "vessel_name": ["Le bateau", "Le navire"],
    "flag_state": ["FRA", None],
    "width": [5.23, None],
    "length": [12.56, 23.6],
    "district": ["Le Guilvinec", None],
    "district_code": ["GV", None],
    "gauge": [125.2, None],
    "registry_port": ["Guilvinec", None],
    "power": [56.36, None],
    "vessel_type": ["Chalutier", "Dragueur"],
    "sailing_category": ["2ème", None],
    "sailing_type": ["Pêche au large, Pêche côtière", None],
    "declared_fishing_gears": [["OTM", "OTB", "DRB"], ["OTM", "PTB", "OTB", "DRB"]],
    "nav_licence_expiration_date": [datetime.datetime(2021, 6, 12, 0, 0, 0), None],
    "proprietor_name": ["Le propriétaire", "Rackham le Rouge"],
    "proprietor_phones": [["12345678910"], []],
    "proprietor_emails": [["proprio@peche.fish"], ["proprio@fish.net"]],
    "operator_name": ["name_pos_123", "The Fishing Co."],
    "operator_phones": [
        ["phone_pos_123", "phone_pos_456", "mobile_phone_pos_789"],
        ["06789_nf"],
    ],
    "operator_mobile_phone": ["mobile_phone_pos_789", "06789_nf"],
    "operator_email": ["email_pos_123", "email@operator.ne"],
    "operator_fax": ["fax-123456", "fax_pos_123"],
    "vessel_phones": [["0123456789", "9876543210"], ["321654987", "0123456"]],
    "vessel_mobile_phone": [None, "0123456"],
    "vessel_emails": [[], ["vessel@email.me", "vessel_bis@email.me"]],
    "vessel_fax": ["+123456789", "faxne_999"],
    "vessel_telex": ["4-000-000", "444444444"],
    "beacon_number": [None, "beacbeac"],
    "beacon_status": [None, "ACTIVATED"],
    "under_charter": [True, False],
}


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


def test_extract_control_charters(reset_test_data):
    vessels_under_charter = extract_control_charters.run()
    expected_vessels_under_charter = pd.DataFrame(
        {
            "id": [1, 2, 4],
            "under_charter": [False, False, True],
        }
    )

    pd.testing.assert_frame_equal(vessels_under_charter, expected_vessels_under_charter)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_beacons(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_beacons.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


def test_transform_beacons():
    beacons = pd.DataFrame(
        {
            "id_nav_flotteur_bn": [1, 2, 3, 4, 5, 6],
            "beacon_number": ["A", "B", "C", "D", "E", "F"],
            "beacon_status": [
                "Activée",
                "Désactivée",
                "En test",
                "Non agréée",
                "Non surveillée",
                None,
            ],
        }
    )

    transformed_beacons = transform_beacons.run(beacons)
    expected_transformed_beacons = pd.DataFrame(
        {
            "id_nav_flotteur_bn": [1, 2, 3, 4, 5, 6],
            "beacon_number": ["A", "B", "C", "D", "E", "F"],
            "beacon_status": [
                "ACTIVATED",
                "DEACTIVATED",
                "IN_TEST",
                "NON_APPROVED",
                "UNSUPERVISED",
                None,
            ],
        }
    )

    pd.testing.assert_frame_equal(transformed_beacons, expected_transformed_beacons)


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
            "length_nf": [12.56, None],
            "width_nf": [5.23, None],
            "gauge_nf": [125.2, None],
            "power_nf": [56.36, None],
            "vessel_phone_1_nf": ["0123456789", None],
            "vessel_phone_2_nf": ["0123456789", None],
            "vessel_phone_3_nf": ["9876543210", None],
            "vessel_mobile_phone_nf": [None, None],
            "vessel_fax_nf": ["+123456789", None],
            "vessel_telex_nf": ["4-000-000", None],
            "vessel_email_1_nf": [None, None],
            "vessel_email_2_nf": [None, None],
            "vessel_type_nf": ["Chalutier", None],
            "registry_port_nf": ["Guilvinec", None],
            "sailing_types_nf": ["Pêche au large, Pêche côtière", None],
            "operator_name_nf": ["Opé pêche", None],
            "operator_email_nf": ["lepecheur@email.fish", None],
            "operator_phone_nf": ["123456789", None],
            "operator_mobile_phone_nf": ["123456789", "06789_nf"],
            "operator_fax_nf": ["fax-123456", None],
            "proprietor_name_nf": ["Le propriétaire", None],
            "proprietor_email_nf": ["proprio@peche.fish", None],
            "proprietor_phone_nf": ["12345678910", None],
            "proprietor_mobile_phone_nf": ["12345678910", None],
            "fishing_gear_main_nfp": ["OTM", None],
            "fishing_gear_secondary_nfp": ["OTB", None],
            "fishing_gear_third_nfp": ["DRB", None],
            "length_ne": [None, 23.6],
            "vessel_phone_1_ne": [None, "321654987"],
            "vessel_phone_2_ne": [None, None],
            "vessel_phone_3_ne": [None, "321654987"],
            "vessel_mobile_phone_ne": [None, "0123456"],
            "vessel_email_1_ne": [None, "vessel@email.me"],
            "vessel_email_2_ne": [None, "vessel_bis@email.me"],
            "vessel_fax_ne": [None, "faxne_999"],
            "vessel_telex_ne": [None, "444444444"],
            "operator_name_ne": [None, "The Fishing Co."],
            "operator_phone_1_ne": [None, None],
            "operator_phone_2_ne": [None, "phone_5555"],
            "operator_mobile_phone_ne": [None, "mobile_5555"],
            "operator_email_1_ne": [None, "email@operator.ne"],
            "operator_email_2_ne": [None, "email_2@operator.ne"],
            "operator_fax_ne": [None, "+810-123-123"],
            "proprietor_name_ne": [None, "Rackham le Rouge"],
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
            "fishing_gear_main_nep": [None, "PTB"],
            "nav_licence_expiration_date": [
                datetime.datetime(2021, 6, 12, 0, 0, 0),
                None,
            ],
            "sailing_category": ["2ème", None],
            "beacon_number": [None, "beacbeac"],
            "beacon_status": [None, beaconStatus.ACTIVATED.value],
            "under_charter": [True, False],
            "operator_name_pos": ["name_pos_123", None],
            "operator_email_pos": ["email_pos_123", None],
            "operator_phone_1_pos": ["phone_pos_123", None],
            "operator_phone_2_pos": ["phone_pos_456", None],
            "operator_phone_3_pos": ["phone_pos_123", None],
            "operator_mobile_phone_pos": ["mobile_phone_pos_789", None],
            "operator_fax_pos": [None, "fax_pos_123"],
        }
    )

    cleaned_vessels = clean_vessels.run(all_vessels)

    expected_cleaned_vessels = pd.DataFrame(cleaned_vessels_data)

    pd.testing.assert_frame_equal(
        cleaned_vessels, expected_cleaned_vessels, check_dtype=False
    )


def test_load_vessels(reset_test_data):

    dtypes = {
        "id": "int64",
        "imo": "category",
        "cfr": "category",
        "external_immatriculation": "category",
        "mmsi": "category",
        "ircs": "category",
        "vessel_name": "category",
        "flag_state": "category",
        "width": pd.SparseDtype("float", None),
        "length": object,
        "district": object,
        "district_code": "category",
        "gauge": object,
        "registry_port": "category",
        "power": object,
        "vessel_type": object,
        "sailing_category": "category",
        "sailing_type": "category",
        "declared_fishing_gears": object,
        "nav_licence_expiration_date": "category",
        "proprietor_name": object,
        "proprietor_phones": object,
        "proprietor_emails": object,
        "operator_name": object,
        "operator_phones": object,
        "operator_mobile_phone": object,
        "operator_email": object,
        "operator_fax": object,
        "vessel_phones": object,
        "vessel_mobile_phone": object,
        "vessel_emails": object,
        "vessel_fax": object,
        "vessel_telex": object,
        "beacon_number": object,
        "beacon_status": object,
        "under_charter": bool,
    }

    dummy_vessels = pd.DataFrame(cleaned_vessels_data)
    dummy_vessels = dummy_vessels.astype(dtypes)
    load_vessels.run(dummy_vessels)
