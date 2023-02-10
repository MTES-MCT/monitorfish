import datetime
from unittest.mock import patch

import pandas as pd
import sqlalchemy

from src.pipeline.flows.vessels import (
    clean_vessels,
    concat_merge_vessels,
    extract_control_charters,
    extract_eu_vessels,
    extract_french_vessels,
    extract_french_vessels_navigation_licences,
    extract_non_eu_vessels,
    extract_vessels_operators,
    load_vessels,
)
from tests.mocks import mock_extract_side_effect

french_vessels_data = {
    "id": [1, 2],
    "imo": [None, "1010"],
    "cfr": ["FRA123456", "FRA666"],
    "external_immatriculation": ["IM12345", "MA951357"],
    "vessel_name": ["PECHE", "BOAT"],
    "ircs": ["CALLZ", "RADIO"],
    "mmsi": ["123456789", None],
    "flag_state": ["FR", "FR"],
    "district_code": ["LS", "PP"],
    "district": ["Sables D'O", "Pointe A Pitre"],
    "length": [17.5, 6.4],
    "width": [3.8, 2.1],
    "gauge": [10.7, 2.12],
    "power": [1730.0, 170.0],
    "vessel_phone_1": ["1234567890", None],
    "vessel_phone_2": [None, None],
    "vessel_phone_3": ["0000000000", None],
    "vessel_mobile_phone": [None, "mobile_phone_000"],
    "vessel_fax": [None, "159753"],
    "vessel_telex": [None, "555"],
    "vessel_email_1": [None, "email@me"],
    "vessel_email_2": [None, "email@me2"],
    "vessel_type": ["Canot", "Canot"],
    "registry_port": ["Sables D'O", None],
    "sailing_type": ["Petite pêche", None],
    "operator_name": ["JP Belmondo", "Felix"],
    "operator_email": ["jpb@wan.fr", None],
    "operator_phone": ["op_nav_fon_1", "op_nav_fon_2"],
    "operator_mobile_phone": ["0600000000", "op00"],
    "operator_fax": ["navpro_fax_1", None],
    "proprietor_name": ["JP Belmondo", "Arthur Rimbaud"],
    "proprietor_email": ["jpb@wan.fr", "a.rim@m.com"],
    "proprietor_phone": [None, "999999999"],
    "proprietor_mobile_phone": ["07000", "07555"],
    "fishing_gear_main": ["LLS", "FPO"],
    "fishing_gear_secondary": ["NK", "NO"],
    "fishing_gear_third": ["FPO", None],
}

eu_vessels_data = {
    "id": [3, 4],
    "imo": ["10", "12"],
    "cfr": ["BGR0im", "ESP000000000"],
    "external_immatriculation": ["AA12", "fakim"],
    "vessel_name": ["Fishing", "Boat"],
    "ircs": [None, "ELDORADO"],
    "mmsi": [None, "111"],
    "flag_state": ["BG", "ES"],
    "district": ["Primorsko", None],
    "length": [14.6, 19.65],
    "gauge": [0.12, 60.5],
    "power": [5.18, 172],
    "vessel_type": [None, "Non spécif"],
    "operator_name": ["Fishing Co.", "Tuna Co."],
    "operator_email": ["someemail@fake.com", None],
    "proprietor_email": [None, "prop_1@mail"],
    "fishing_gear_main": ["GNS", "OTB"],
    "fishing_gear_secondary": ["LHP", None],
    "fishing_gear_third": [None, "NO"],
}

non_eu_vessels_data = {
    "id": [5, 6],
    "imo": ["951", None],
    "cfr": [None, "FRA000834352"],
    "external_immatriculation": ["ABC0", None],
    "vessel_name": ["CAPTAIN DEL MARE", "YEAH NO"],
    "ircs": ["RADIO1", "ABCDEF"],
    "mmsi": [None, "954"],
    "flag_state": ["VE", "SN"],
    "length": [24.0, None],
    "gauge": [40.77, None],
    "power": [760.0, None],
    "vessel_phone_1": ["phone1", None],
    "vessel_phone_2": ["phone2", None],
    "vessel_phone_3": ["phone3", None],
    "vessel_mobile_phone": ["non_eu_5", "mob6"],
    "vessel_fax": [None, None],
    "vessel_telex": [None, None],
    "vessel_email_1": ["contact@email.com", None],
    "vessel_email_2": ["contact_2@email.com", None],
    "operator_name": [None, "o6"],
    "operator_email_1": ["contact@email.com", None],
    "operator_email_2": ["contact_2@email.com", None],
    "operator_phone_1": ["123", "789"],
    "operator_phone_2": ["456", "101112"],
    "operator_mobile_phone": ["mob_non_eu_op", None],
    "operator_fax": [None, "fax12"],
    "proprietor_name": [None, None],
    "fishing_gear_main": ["LLS", None],
    "fishing_gear_secondary": [None, None],
}

vessels_operators_data = {
    "id": [1, 3],
    "operator_name_pos": ["op1 pos", "op3 pos"],
    "operator_email_pos": [None, "operator_pos@mail"],
    "operator_phone_1_pos": ["pos_01", None],
    "operator_phone_2_pos": ["pos_01", None],
    "operator_phone_3_pos": ["pos_02", None],
    "operator_mobile_phone_pos": ["pos_06", "pos_061"],
    "operator_fax_pos": [None, "pos_fax3"],
}

licences_data = {
    "id": [2],
    "nav_licence_expiration_date": [datetime.datetime(2023, 5, 15)],
    "sailing_category": ["3ème"],
}

control_charters_data = {
    "id": [1, 2, 4],
    "under_charter": [False, False, True],
}

concat_merged_data = {
    "id": [1, 2, 3, 4, 5, 6],
    "imo": [None, "1010", "10", "12", "951", None],
    "cfr": ["FRA123456", "FRA666", "BGR0im", "ESP000000000", None, "FRA000834352"],
    "external_immatriculation": ["IM12345", "MA951357", "AA12", "fakim", "ABC0", None],
    "vessel_name": ["PECHE", "BOAT", "Fishing", "Boat", "CAPTAIN DEL MARE", "YEAH NO"],
    "ircs": ["CALLZ", "RADIO", None, "ELDORADO", "RADIO1", "ABCDEF"],
    "mmsi": ["123456789", None, None, "111", None, "954"],
    "flag_state": ["FR", "FR", "BG", "ES", "VE", "SN"],
    "district_code": ["LS", "PP", None, None, None, None],
    "district": ["Sables D'O", "Pointe A Pitre", "Primorsko", None, None, None],
    "length": [17.5, 6.4, 14.6, 19.65, 24.0, None],
    "width": [3.8, 2.1, None, None, None, None],
    "gauge": [10.7, 2.12, 0.12, 60.5, 40.77, None],
    "power": [1730.0, 170.0, 5.18, 172.0, 760.0, None],
    "vessel_phone_1": ["1234567890", None, None, None, "phone1", None],
    "vessel_phone_2": [None, None, None, None, "phone2", None],
    "vessel_phone_3": ["0000000000", None, None, None, "phone3", None],
    "vessel_mobile_phone": [None, "mobile_phone_000", None, None, "non_eu_5", "mob6"],
    "vessel_fax": [None, "159753", None, None, None, None],
    "vessel_telex": [None, "555", None, None, None, None],
    "vessel_email_1": [None, "email@me", None, None, "contact@email.com", None],
    "vessel_email_2": [None, "email@me2", None, None, "contact_2@email.com", None],
    "vessel_type": ["Canot", "Canot", None, "Non spécif", None, None],
    "registry_port": ["Sables D'O", None, None, None, None, None],
    "sailing_type": ["Petite pêche", None, None, None, None, None],
    "operator_name": ["JP Belmondo", "Felix", "Fishing Co.", "Tuna Co.", None, "o6"],
    "operator_email": ["jpb@wan.fr", None, "someemail@fake.com", None, None, None],
    "operator_phone": ["op_nav_fon_1", "op_nav_fon_2", None, None, None, None],
    "operator_mobile_phone": ["0600000000", "op00", None, None, "mob_non_eu_op", None],
    "operator_fax": ["navpro_fax_1", None, None, None, None, "fax12"],
    "proprietor_name": ["JP Belmondo", "Arthur Rimbaud", None, None, None, None],
    "proprietor_email": ["jpb@wan.fr", "a.rim@m.com", None, "prop_1@mail", None, None],
    "proprietor_phone": [None, "999999999", None, None, None, None],
    "proprietor_mobile_phone": ["07000", "07555", None, None, None, None],
    "fishing_gear_main": ["LLS", "FPO", "GNS", "OTB", "LLS", None],
    "fishing_gear_secondary": ["NK", "NO", "LHP", None, None, None],
    "fishing_gear_third": ["FPO", None, None, "NO", None, None],
    "operator_email_1": [None, None, None, None, "contact@email.com", None],
    "operator_email_2": [None, None, None, None, "contact_2@email.com", None],
    "operator_phone_1": [None, None, None, None, "123", "789"],
    "operator_phone_2": [None, None, None, None, "456", "101112"],
    "operator_name_pos": ["op1 pos", None, "op3 pos", None, None, None],
    "operator_email_pos": [None, None, "operator_pos@mail", None, None, None],
    "operator_phone_1_pos": ["pos_01", None, None, None, None, None],
    "operator_phone_2_pos": ["pos_01", None, None, None, None, None],
    "operator_phone_3_pos": ["pos_02", None, None, None, None, None],
    "operator_mobile_phone_pos": ["pos_06", None, "pos_061", None, None, None],
    "operator_fax_pos": [None, None, "pos_fax3", None, None, None],
    "nav_licence_expiration_date": [
        None,
        datetime.datetime(2023, 5, 15),
        None,
        None,
        None,
        None,
    ],
    "sailing_category": [None, "3ème", None, None, None, None],
    "under_charter": [False, False, False, True, False, False],
}

concat_merged_dtype = {
    "imo": "category",
    "mmsi": "category",
    "flag_state": "category",
    "district_code": "category",
    "district": "category",
    "vessel_phone_1": "category",
    "vessel_phone_2": "category",
    "vessel_phone_3": "category",
    "vessel_mobile_phone": "category",
    "vessel_fax": "category",
    "vessel_telex": "category",
    "vessel_email_1": "category",
    "vessel_email_2": "category",
    "vessel_type": "category",
    "registry_port": "category",
    "sailing_category": "category",
    "sailing_type": "category",
    "operator_email": "category",
    "operator_phone": "category",
    "operator_mobile_phone": "category",
    "operator_fax": "category",
    "proprietor_name": "category",
    "proprietor_email": "category",
    "proprietor_phone": "category",
    "proprietor_mobile_phone": "category",
    "fishing_gear_main": "category",
    "fishing_gear_secondary": "category",
    "fishing_gear_third": "category",
    "operator_email_1": "category",
    "operator_email_2": "category",
    "operator_phone_1": "category",
    "operator_phone_2": "category",
    "operator_name_pos": "category",
    "operator_email_pos": "category",
    "operator_phone_1_pos": "category",
    "operator_phone_2_pos": "category",
    "operator_phone_3_pos": "category",
    "operator_mobile_phone_pos": "category",
    "operator_fax_pos": "category",
    "under_charter": bool,
}

cleaned_vessels_data = {
    "id": [1, 2, 3, 4, 5, 6],
    "imo": [None, "1010", "10", "12", "951", None],
    "cfr": ["FRA123456", "FRA666", "BGR0im", "ESP000000000", None, "FRA000834352"],
    "external_immatriculation": ["IM12345", "MA951357", "AA12", "fakim", "ABC0", None],
    "mmsi": ["123456789", None, None, "111", None, "954"],
    "ircs": ["CALLZ", "RADIO", None, "ELDORADO", "RADIO1", "ABCDEF"],
    "vessel_name": ["PECHE", "BOAT", "Fishing", "Boat", "CAPTAIN DEL MARE", "YEAH NO"],
    "flag_state": ["FR", "FR", "BG", "ES", "VE", "SN"],
    "width": [3.8, 2.1, None, None, None, None],
    "length": [17.5, 6.4, 14.6, 19.65, 24.0, None],
    "district": ["Sables D'O", "Pointe A Pitre", "Primorsko", None, None, None],
    "district_code": ["LS", "PP", None, None, None, None],
    "gauge": [10.7, 2.12, 0.12, 60.5, 40.77, None],
    "registry_port": ["Sables D'O", None, None, None, None, None],
    "power": [1730.0, 170.0, 5.18, 172.0, 760.0, None],
    "vessel_type": ["Canot", "Canot", None, "Non spécif", None, None],
    "sailing_category": [None, "3ème", None, None, None, None],
    "sailing_type": ["Petite pêche", None, None, None, None, None],
    "declared_fishing_gears": [
        ["LLS", "NK", "FPO"],
        ["FPO", "NO"],
        ["GNS", "LHP"],
        ["OTB", "NO"],
        ["LLS"],
        [],
    ],
    "nav_licence_expiration_date": [
        None,
        datetime.datetime(2023, 5, 15),
        None,
        None,
        None,
        None,
    ],
    "proprietor_name": ["JP Belmondo", "Arthur Rimbaud", None, None, None, None],
    "proprietor_phones": [["07000"], ["999999999", "07555"], [], [], [], []],
    "proprietor_emails": [["jpb@wan.fr"], ["a.rim@m.com"], [], ["prop_1@mail"], [], []],
    "operator_name": ["op1 pos", "Felix", "op3 pos", "Tuna Co.", None, "o6"],
    "operator_phones": [
        ["pos_01", "pos_02", "pos_06"],
        ["op_nav_fon_2", "op00"],
        ["pos_061"],
        None,
        ["123", "456", "mob_non_eu_op"],
        ["789", "101112"],
    ],
    "operator_mobile_phone": ["pos_06", "op00", "pos_061", None, "mob_non_eu_op", None],
    "operator_email": [
        "jpb@wan.fr",
        None,
        "operator_pos@mail",
        None,
        "contact@email.com",
        None,
    ],
    "operator_fax": ["navpro_fax_1", None, "pos_fax3", None, None, "fax12"],
    "vessel_phones": [
        ["1234567890", "0000000000"],
        ["mobile_phone_000"],
        [],
        [],
        ["phone1", "phone2", "phone3", "non_eu_5"],
        ["mob6"],
    ],
    "vessel_mobile_phone": [None, "mobile_phone_000", None, None, "non_eu_5", "mob6"],
    "vessel_emails": [
        [],
        ["email@me", "email@me2"],
        [],
        [],
        ["contact@email.com", "contact_2@email.com"],
        [],
    ],
    "vessel_fax": [None, "159753", None, None, None, None],
    "vessel_telex": [None, "555", None, None, None, None],
    "under_charter": [False, False, False, True, False, False],
}

cleaned_vessels_dtype = {
    "imo": "category",
    "mmsi": "category",
    "flag_state": "category",
    "district_code": "category",
    "district": "category",
    "vessel_mobile_phone": "category",
    "vessel_fax": "category",
    "vessel_telex": "category",
    "vessel_type": "category",
    "registry_port": "category",
    "sailing_category": "category",
    "sailing_type": "category",
    "proprietor_name": "category",
    "under_charter": bool,
}


@patch("src.pipeline.flows.vessels.extract")
def test_extract_eu_vessels(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_eu_vessels.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_french_vessels(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_french_vessels.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_nav_licences(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_french_vessels_navigation_licences.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_non_eu_vessels(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_non_eu_vessels.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


def test_extract_control_charters(reset_test_data):
    vessels_under_charter = extract_control_charters.run()
    expected_vessels_under_charter = pd.DataFrame(control_charters_data)
    pd.testing.assert_frame_equal(vessels_under_charter, expected_vessels_under_charter)


@patch("src.pipeline.flows.vessels.extract")
def test_extract_vessels_operators(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_vessels_operators.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


def test_concat_merge_vessels():
    french_vessels = pd.DataFrame(french_vessels_data)
    eu_vessels = pd.DataFrame(eu_vessels_data)
    non_eu_vessels = pd.DataFrame(non_eu_vessels_data)
    vessels_operators = pd.DataFrame(vessels_operators_data)
    licences = pd.DataFrame(licences_data)
    control_charters = pd.DataFrame(control_charters_data)

    all_vessels = concat_merge_vessels.run(
        french_vessels,
        eu_vessels,
        non_eu_vessels,
        vessels_operators,
        licences,
        control_charters,
    )

    expected_all_vessels = pd.DataFrame(concat_merged_data)
    expected_all_vessels = expected_all_vessels.astype(concat_merged_dtype)

    pd.testing.assert_frame_equal(all_vessels, expected_all_vessels)


def test_clean_vessels():

    all_vessels = pd.DataFrame(concat_merged_data)
    all_vessels = all_vessels.astype(concat_merged_dtype)

    cleaned_vessels = clean_vessels.run(all_vessels)

    expected_cleaned_vessels = pd.DataFrame(cleaned_vessels_data)
    expected_cleaned_vessels = expected_cleaned_vessels.astype(cleaned_vessels_dtype)

    pd.testing.assert_frame_equal(cleaned_vessels, expected_cleaned_vessels)


def test_load_vessels(reset_test_data):

    cleaned_vessels = pd.DataFrame(cleaned_vessels_data)
    cleaned_vessels = cleaned_vessels.astype(cleaned_vessels_dtype)
    load_vessels.run(cleaned_vessels)
