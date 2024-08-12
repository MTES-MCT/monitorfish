import pandas as pd
import pytest


@pytest.fixture
def pno_units_targeting_vessels():
    return pd.DataFrame(
        {
            "vessel_id": [2, 4, 7],
            "cfr": ["ABC000542519", None, "___TARGET___"],
            "control_unit_ids_targeting_vessel": [[4], [1, 2], [4]],
        }
    )


@pytest.fixture
def pno_units_ports_and_segments_subscriptions():
    return pd.DataFrame(
        {
            "port_locode": [
                "FRCQF",
                "FRDKK",
                "FRDPE",
                "FRLEH",
                "FRLEH",
                "FRZJZ",
                "FRZJZ",
            ],
            "control_unit_id": [1, 2, 4, 2, 3, 2, 3],
            "receive_all_pnos_from_port": [
                False,
                False,
                True,
                False,
                False,
                False,
                False,
            ],
            "unit_subscribed_segments": [
                ["SWW01/02/03"],
                [],
                [],
                [],
                ["SWW01/02/03", "NWW01"],
                [],
                ["SWW01/02/03", "NWW01"],
            ],
        }
    )


@pytest.fixture
def monitorenv_control_units_api_response() -> list:
    return [
        {
            "id": 1,
            "controlUnitContacts": [],
            "isArchived": False,
            "name": "Unité 1",
            "otherUneededField_1": [1250],
            "otherUneededField_2": None,
        },
        {
            "id": 2,
            "controlUnitContacts": [
                {
                    "id": 559,
                    "controlUnitId": 2,
                    "email": "some.email@control.unit.4",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "otherUneededField_1": [1250],
                    "otherUneededField_2": None,
                    "name": "OFFICE",
                    "phone": "'00 11 22 33 44 55",
                },
                {
                    "id": 556,
                    "controlUnitId": 2,
                    "email": "alternative@email",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HNO",
                    "phone": "11 11 11 11 11",
                },
                {
                    "id": 557,
                    "controlUnitId": 2,
                    "email": "unused_email.adresse@somewhere",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HO",
                    "phone": "xx xx xx xx xx",
                },
            ],
            "isArchived": False,
            "name": "Unité 2",
            "otherUneededField_1": [1250],
            "otherUneededField_2": None,
        },
        {
            "id": 3,
            "controlUnitContacts": [
                {
                    "id": 320,
                    "controlUnitId": 3,
                    "email": "com.email@bla1",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "22 22 22 22 22",
                },
                {
                    "id": 321,
                    "controlUnitId": 3,
                    "email": "com.email@bla2",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "33 33 33 33 33",
                },
                {
                    "id": 322,
                    "controlUnitId": 3,
                    "email": None,
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "name": "UNKNOWN",
                    "phone": "44 44 44 44 44",
                },
            ],
            "isArchived": False,
            "name": "Unité 3",
        },
        {
            "id": 4,
            "controlUnitContacts": [
                {
                    "id": 1182,
                    "controlUnitId": 4,
                    "email": None,
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "PERMANENT_CONTACT_ONBOARD",
                    "phone": "77 77 77 77 77",
                },
                {
                    "id": 1180,
                    "controlUnitId": 4,
                    "email": "--",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "88 88 88 88 88 (HO) / 99 99 99 99 99 (HNO)",
                },
                {
                    "id": 1181,
                    "controlUnitId": 4,
                    "email": "email4@email.com",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "name": "Unité",
                },
            ],
            "isArchived": False,
            "name": "Unité 4",
        },
        {
            "id": 5,
            "controlUnitContacts": [
                {
                    "id": 382,
                    "controlUnitId": 5,
                    "email": "------",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OFFICE",
                    "phone": "0000000000",
                },
                {
                    "id": 381,
                    "controlUnitId": 5,
                    "email": None,
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "ONBOARD_PHONE",
                    "phone": "0000000000",
                },
                {
                    "id": 379,
                    "controlUnitId": 5,
                    "email": "----",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HNO",
                    "phone": "00000000000",
                },
                {
                    "id": 380,
                    "controlUnitId": 5,
                    "email": "--",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HO",
                    "phone": "00000000000",
                },
            ],
            "isArchived": False,
            "name": "Unité 5",
        },
        {
            "id": 6,
            "controlUnitContacts": [
                {
                    "id": 631,
                    "controlUnitId": 6,
                    "email": "****",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": True,
                    "name": "UNKNOWN",
                },
                {
                    "id": 1540,
                    "controlUnitId": 6,
                    "email": "-----",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": None,
                },
                {
                    "id": 1541,
                    "controlUnitId": 6,
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": False,
                    "name": "Référent police",
                    "phone": None,
                },
            ],
            "isArchived": False,
            "name": "Unité 6",
        },
        {
            "id": 7,
            "controlUnitContacts": [
                {
                    "id": 1540,
                    "controlUnitId": 7,
                    "email": "archived.email",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "55 55 55 55 55",
                },
            ],
            "isArchived": True,
            "name": "Unité 7 (historique)",
        },
    ]


@pytest.fixture
def control_units_contacts() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "control_unit_id": [2, 3, 4],
            "emails": [
                ["alternative@email", "some.email@control.unit.4"],
                [],
                ["email4@email.com"],
            ],
            "phone_numbers": [
                ["'00 11 22 33 44 55"],
                ["44 44 44 44 44"],
                [],
            ],
        }
    )
