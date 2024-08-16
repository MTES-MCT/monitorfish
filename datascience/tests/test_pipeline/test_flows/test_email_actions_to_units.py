import dataclasses
from datetime import datetime, timedelta
from email.message import EmailMessage
from smtplib import SMTPDataError
from typing import List
from unittest.mock import patch

import pandas as pd
import pytest
from dateutil import relativedelta
from jinja2 import Template
from prefect import task

from config import (
    CNSP_FRANCE_EMAIL_ADDRESS,
    MONITORFISH_EMAIL_ADDRESS,
    TEST_DATA_LOCATION,
)
from src.pipeline.entities.control_units import (
    ControlUnitActions,
    ControlUnitActionsSentMessage,
    ControlUnitWithEmails,
)
from src.pipeline.entities.missions import FlightGoal
from src.pipeline.flows.email_actions_to_units import (
    control_unit_actions_list_to_df,
    create_email,
    extract_mission_actions,
    filter_control_units_contacts,
    flow,
    get_actions_period,
    get_control_unit_ids,
    get_template,
    load_emails_sent_to_control_units,
    render,
    send_mission_actions_email,
    to_control_unit_actions,
)
from src.pipeline.helpers.dates import Period
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@task(checkpoint=False)
def mock_fetch_control_units_contacts():
    return pd.DataFrame(
        {
            "control_unit_id": [3, 5, 8],
            "control_unit_name": ["Unité 3", "Unité 5", "Unité 8"],
            "emails": [
                ["alternative@email", "some.email@control.unit.4"],
                [],
                ["email8@email.com"],
            ],
            "phone_numbers": [
                ["'00 11 22 33 44 55"],
                ["44 44 44 44 44"],
                [],
            ],
        }
    )


flow.replace(
    flow.get_tasks("fetch_control_units_contacts")[0], mock_fetch_control_units_contacts
)


@pytest.fixture
def expected_mission_actions() -> pd.DataFrame:
    now = datetime.utcnow()

    return pd.DataFrame(
        {
            "id": [-199999, -144762, 1, 6, 6, 10, 11, 21, 22, 23],
            "control_unit_id": [8, 8, 5, 3, 8, 8, 8, 8, 8, 8],
            "control_unit": [
                "Bobby McDewis",
                "Bobby McDewis",
                "Mike The Buster",
                "Nozy Mary",
                "Bobby McDewis",
                "Bobby McDewis",
                "Bobby McDewis",
                "Bobby McDewis",
                "Bobby McDewis",
                "Bobby McDewis",
            ],
            "control_type": [
                "SEA_CONTROL",
                "SEA_CONTROL",
                "SEA_CONTROL",
                "LAND_CONTROL",
                "LAND_CONTROL",
                "LAND_CONTROL",
                "SEA_CONTROL",
                "LAND_CONTROL",
                "LAND_CONTROL",
                "LAND_CONTROL",
            ],
            "control_datetime_utc": [
                now - relativedelta.relativedelta(months=3, days=1),
                now - relativedelta.relativedelta(months=3),
                now - relativedelta.relativedelta(weeks=3),
                now - relativedelta.relativedelta(months=9),
                now - relativedelta.relativedelta(months=9),
                now - relativedelta.relativedelta(weeks=2),
                now - relativedelta.relativedelta(months=5),
                now - relativedelta.relativedelta(weeks=1),
                now - relativedelta.relativedelta(weeks=1, days=3),
                now - relativedelta.relativedelta(weeks=1, days=2),
            ],
            "vessel_name": [None, None, None, None, None, None, None, None, None, None],
            "flag_state": [
                "UNDEFINED",
                "UNDEFINED",
                "FR",
                "FR",
                "FR",
                "FR",
                "FR",
                "NL",
                "FR",
                "FR",
            ],
            "longitude": [
                53.12,
                53.12,
                -1.566,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "latitude": [6.85, 6.85, 46.0, None, None, None, None, None, None, None],
            "port_name": [
                None,
                None,
                None,
                "Somewhere over the rainbow",
                "Somewhere over the rainbow",
                "Somewhere over the ocean",
                None,
                "Somewhere over the swell",
                "Somewhere over the top",
                "Somewhere over the top",
            ],
            "port_locode": [
                None,
                None,
                None,
                "FRCQF",
                "FRCQF",
                "FRLEH",
                None,
                "FRDKK",
                "FRZJZ",
                "FRZJZ",
            ],
            "infraction": [
                False,
                False,
                True,
                True,
                True,
                True,
                False,
                False,
                True,
                False,
            ],
            "infraction_report": [
                False,
                False,
                True,
                False,
                False,
                True,
                False,
                False,
                True,
                False,
            ],
            "number_of_vessels_flown_over": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "flight_goals": [
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
            ],
            "segments": [
                ["Hors segment"],
                ["Hors segment"],
                ["SWW01/02/03"],
                ["NS13", "NWW08"],
                ["NS13", "NWW08"],
                ["FR_SCE"],
                ["Hors segment"],
                ["Hors segment"],
                ["Hors segment"],
                ["Hors segment"],
            ],
        }
    )


@pytest.fixture
def sample_mission_actions(expected_mission_actions) -> pd.DataFrame:
    now = datetime.utcnow()

    df = pd.concat(
        [
            expected_mission_actions,
            pd.DataFrame(
                {
                    "id": [24, 25],
                    "control_unit_id": [3, 3],
                    "control_unit": [
                        "Bobby McDewis",
                        "Bobby McDewis",
                    ],
                    "control_type": [
                        "AIR_CONTROL",
                        "AIR_SURVEILLANCE",
                    ],
                    "control_datetime_utc": [
                        now - relativedelta.relativedelta(days=3),
                        now - relativedelta.relativedelta(days=2),
                    ],
                    "vessel_name": ["El barco", "La Caravella"],
                    "flag_state": [
                        "NL",
                        "FR",
                    ],
                    "longitude": [45.12, None],
                    "latitude": [-6.85, None],
                    "port_name": [
                        None,
                        None,
                    ],
                    "infraction": [
                        False,
                        False,
                    ],
                    "infraction_report": [
                        False,
                        False,
                    ],
                    "number_of_vessels_flown_over": [None, 27],
                    "flight_goals": [
                        [],
                        [FlightGoal.VMS_AIS_CHECK.label, FlightGoal.CLOSED_AREA.label],
                    ],
                    "segments": [
                        ["NS13", "NWW08"],
                        ["FR_SCE"],
                    ],
                }
            ),
        ]
    ).reset_index(drop=True)

    d = datetime(2022, 5, 6, 15, 23, 40)

    df.loc[:, "control_datetime_utc"] = [
        d - relativedelta.relativedelta(months=3, days=1),
        d - relativedelta.relativedelta(months=3),
        d - relativedelta.relativedelta(weeks=3),
        d - relativedelta.relativedelta(months=9),
        d - relativedelta.relativedelta(months=9),
        d - relativedelta.relativedelta(weeks=2),
        d - relativedelta.relativedelta(months=5),
        d - relativedelta.relativedelta(weeks=1),
        d - relativedelta.relativedelta(weeks=1, days=3),
        d - relativedelta.relativedelta(weeks=1, days=2),
        d - relativedelta.relativedelta(days=3),
        d - relativedelta.relativedelta(days=2),
    ]

    return df


@pytest.fixture
def expected_control_unit_ids() -> List[int]:
    return [3, 5, 8]


@pytest.fixture
def sample_control_units() -> pd.DataFrame:
    return [
        ControlUnitWithEmails(
            control_unit_id=3,
            control_unit_name="Unité 3",
            emails=["unité_3@email.fr", "unité_3_bis@email.fr"],
        ),
        ControlUnitWithEmails(
            control_unit_id=5, control_unit_name="Unité 5", emails=["unité_5@email.fr"]
        ),
        ControlUnitWithEmails(
            control_unit_id=8,
            control_unit_name="Unité 8",
            emails=["unité_8@email.fr", "unité_8_bis@email.fr"],
        ),
    ]


@pytest.fixture
def expected_all_control_units() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "control_unit_id": [10002, 10018, 10019],
            "control_unit_name": ["DML – DDTM 59", "P602 Verdon", "BN Toulon"],
            "email_addresses": [
                ["dml59@surveillance.fr"],
                ["diffusion.p602@email.fr", "diffusion_bis.p602@email.fr"],
                ["bn_toulon@email.fr"],
            ],
        }
    )


@pytest.fixture
def sample_control_unit_actions(sample_mission_actions) -> ControlUnitActions:
    return ControlUnitActions(
        control_unit=ControlUnitWithEmails(
            control_unit_id=13,
            control_unit_name="Nom de l'unité",
            emails=["email@email.com", "email2@email.com"],
        ),
        period=Period(
            start=datetime(2020, 6, 23, 0, 0, 0),
            end=datetime(2020, 5, 6, 18, 45, 6),
        ),
        sea_controls=sample_mission_actions.iloc[[0, 1, 6]].reset_index(drop=True),
        land_controls=sample_mission_actions.iloc[[4, 5, 7, 8, 9]].reset_index(
            drop=True
        ),
        air_controls=sample_mission_actions.iloc[[10]].reset_index(drop=True),
        air_surveillances=sample_mission_actions.iloc[[11]].reset_index(drop=True),
    )


@pytest.fixture
def sample_control_unit_actions_without_actions(
    sample_control_unit_actions,
) -> ControlUnitActions:
    return dataclasses.replace(
        sample_control_unit_actions,
        sea_controls=sample_control_unit_actions.sea_controls.head(0),
        land_controls=sample_control_unit_actions.land_controls.head(0),
        air_controls=sample_control_unit_actions.air_controls.head(0),
        air_surveillances=sample_control_unit_actions.air_surveillances.head(0),
    )


@pytest.fixture
def control_unit_actions_sent_messages() -> List[ControlUnitActionsSentMessage]:
    return [
        ControlUnitActionsSentMessage(
            control_unit_id=13,
            control_unit_name="Nom de l'unité",
            email_address="email@email.com",
            sending_datetime_utc=datetime(2024, 3, 19, 14, 37, 24, 497093),
            actions_min_datetime_utc=datetime(2020, 6, 23, 0, 0),
            actions_max_datetime_utc=datetime(2020, 5, 6, 18, 45, 6),
            number_of_actions=2,
            success=True,
            error_code=None,
            error_message=None,
        ),
        ControlUnitActionsSentMessage(
            control_unit_id=13,
            control_unit_name="Nom de l'unité",
            email_address="email2@email.com",
            sending_datetime_utc=datetime(2024, 3, 19, 14, 37, 24, 497093),
            actions_min_datetime_utc=datetime(2020, 6, 23, 0, 0),
            actions_max_datetime_utc=datetime(2020, 5, 6, 18, 45, 6),
            number_of_actions=2,
            success=False,
            error_code=550,
            error_message="Email cound not be sent.",
        ),
    ]


@pytest.fixture
def control_unit_actions_sent_messages_df() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "control_unit_id": [13, 13],
            "control_unit_name": ["Nom de l'unité", "Nom de l'unité"],
            "email_address": ["email@email.com", "email2@email.com"],
            "sending_datetime_utc": [
                datetime(
                    year=2024,
                    month=3,
                    day=19,
                    hour=14,
                    minute=37,
                    second=24,
                    microsecond=497093,
                ),
                datetime(
                    year=2024,
                    month=3,
                    day=19,
                    hour=14,
                    minute=37,
                    second=24,
                    microsecond=497093,
                ),
            ],
            "actions_min_datetime_utc": [
                datetime(year=2020, month=6, day=23, hour=00, minute=00, second=00),
                datetime(year=2020, month=6, day=23, hour=00, minute=00, second=00),
            ],
            "actions_max_datetime_utc": [
                datetime(year=2020, month=5, day=6, hour=18, minute=45, second=6),
                datetime(year=2020, month=5, day=6, hour=18, minute=45, second=6),
            ],
            "number_of_actions": [2, 2],
            "success": [True, False],
            "error_code": [None, 550.0],
            "error_message": [None, "Email cound not be sent."],
        }
    )


@pytest.fixture
def expected_email(sample_control_unit_actions) -> EmailMessage:
    email = EmailMessage()
    email["Subject"] = "Bilan hebdomadaire contrôle des pêches"
    email["From"] = MONITORFISH_EMAIL_ADDRESS
    email["To"] = ", ".join(sample_control_unit_actions.control_unit.emails)
    email["Reply-To"] = CNSP_FRANCE_EMAIL_ADDRESS
    email.set_content("<html>Bonjour ceci est un email test.</html>\n", subtype="html")

    return email


def test_get_actions_period():
    period = get_actions_period.run(
        utcnow=datetime(2021, 2, 21, 16, 10, 0),
        start_days_ago=5,
        end_days_ago=2,
    )
    assert period == Period(
        start=datetime(2021, 2, 16, 0, 0), end=datetime(2021, 2, 20, 0, 0)
    )


def test_extract_mission_actions(reset_test_data, expected_mission_actions):
    # Dates with some data
    now = datetime.utcnow()
    y = relativedelta.relativedelta(years=1)
    actions = extract_mission_actions.run(period=Period(start=now - y, end=now))
    pd.testing.assert_frame_equal(
        actions.drop(columns=["control_datetime_utc"]),
        expected_mission_actions.drop(columns=["control_datetime_utc"]),
    )
    assert (
        (
            actions.control_datetime_utc - expected_mission_actions.control_datetime_utc
        ).abs()
        < timedelta(seconds=10)
    ).all()


def test_get_control_unit_ids(expected_mission_actions, expected_control_unit_ids):
    ids = get_control_unit_ids.run(expected_mission_actions)
    assert ids == expected_control_unit_ids


def test_filter_control_units_contacts(control_units_contacts):
    res = filter_control_units_contacts.run(
        all_control_units_contacts=control_units_contacts, control_unit_ids=[2, 3]
    )

    assert res == [
        ControlUnitWithEmails(
            control_unit_id=2,
            control_unit_name="Unité 2",
            emails=["alternative@email", "some.email@control.unit.4"],
        )
    ]


def test_to_control_unit_actions(sample_mission_actions, sample_control_units):
    period = Period(
        start=datetime(1996, 6, 11, 2, 52, 36),
        end=datetime(1996, 6, 13, 6, 17, 18),
    )

    control_unit_actions = to_control_unit_actions.run(
        mission_actions=sample_mission_actions,
        period=period,
        control_units=sample_control_units,
    )

    assert len(control_unit_actions) == 3

    assert isinstance(control_unit_actions[0], ControlUnitActions)
    assert control_unit_actions[0].control_unit.control_unit_id == 3
    assert control_unit_actions[0].period == period
    assert len(control_unit_actions[0].sea_controls) == 0

    pd.testing.assert_frame_equal(
        control_unit_actions[0].land_controls,
        sample_mission_actions.iloc[[3]].reset_index(drop=True),
    )
    pd.testing.assert_frame_equal(
        control_unit_actions[0].air_controls,
        sample_mission_actions.iloc[[10]].reset_index(drop=True),
    )
    pd.testing.assert_frame_equal(
        control_unit_actions[0].air_surveillances,
        sample_mission_actions.iloc[[11]].reset_index(drop=True),
    )

    assert control_unit_actions[1].control_unit.control_unit_id == 5
    assert control_unit_actions[1].period == period
    pd.testing.assert_frame_equal(
        control_unit_actions[1].sea_controls,
        sample_mission_actions.iloc[[2]].reset_index(drop=True),
    )
    assert len(control_unit_actions[1].land_controls) == 0
    assert len(control_unit_actions[1].air_controls) == 0
    assert len(control_unit_actions[1].air_surveillances) == 0

    assert control_unit_actions[2].control_unit.control_unit_id == 8
    assert control_unit_actions[2].period == period
    pd.testing.assert_frame_equal(
        control_unit_actions[2].sea_controls,
        sample_mission_actions.iloc[[0, 1, 6]].reset_index(drop=True),
    )
    pd.testing.assert_frame_equal(
        control_unit_actions[2].land_controls,
        sample_mission_actions.iloc[[4, 5, 7, 8, 9]].reset_index(drop=True),
    )

    assert len(control_unit_actions[2].air_controls) == 0
    assert len(control_unit_actions[2].air_surveillances) == 0


def test_get_template():
    template = get_template.run()
    assert isinstance(template, Template)


def test_render_html(sample_control_unit_actions):
    template = get_template.run()
    html = render.run(
        control_unit_actions=sample_control_unit_actions, template=template
    )

    # Uncomment to update the expected html file
    # with open((
    #     TEST_DATA_LOCATION /
    #     "emails/email_actions_to_units/expected_rendered_email.html"
    # ), "w") as f:
    #     f.write(html)

    with open(
        (
            TEST_DATA_LOCATION
            / "emails/email_actions_to_units/expected_rendered_email.html"
        ),
        "r",
    ) as f:
        expected_html = f.read()

    assert html == expected_html


def test_render_html_when_unit_has_no_actions(
    sample_control_unit_actions_without_actions,
):
    template = get_template.run()
    html = render.run(
        control_unit_actions=sample_control_unit_actions_without_actions,
        template=template,
    )

    # Uncomment to update the expected html file
    # with open((
    #     TEST_DATA_LOCATION /
    #     "emails/email_actions_to_units/expected_rendered_email_without_actions.html"),
    #     "w") as f:
    #     f.write(html)

    with open(
        (
            TEST_DATA_LOCATION
            / "emails/email_actions_to_units/expected_rendered_email_without_actions.html"
        ),
        "r",
    ) as f:
        expected_html = f.read()

    assert html == expected_html


@pytest.mark.parametrize("test_mode", [False, True])
def test_create_email(sample_control_unit_actions, expected_email, test_mode):
    email = create_email.run(
        html="<html>Bonjour ceci est un email test.</html>",
        actions=sample_control_unit_actions,
        test_mode=test_mode,
    )

    assert email["Subject"] == expected_email["Subject"]
    assert email["From"] == expected_email["From"]
    assert (
        email["To"] == CNSP_FRANCE_EMAIL_ADDRESS if test_mode else expected_email["To"]
    )
    assert email["Reply-To"] == expected_email["Reply-To"]
    assert email.get_content_type() == expected_email.get_content_type()

    body = email.get_body()
    expected_body = expected_email.get_body()
    assert body.get_content_type() == expected_body.get_content_type()

    assert body.get_charsets() == expected_body.get_charsets()
    assert body.get_content() == expected_body.get_content()


@pytest.mark.parametrize(
    "is_integration,send_email_outcome",
    [
        (False, SMTPDataError(100, "Erreur SMTP")),
        (False, dict()),
        (False, {"email2@email.com": (550, "Email cound not be sent.")}),
        (True, Exception("Autre erreur")),
    ],
)
@patch("src.pipeline.helpers.emails.send_email")
@patch("src.pipeline.helpers.emails.sleep")
def test_send_mission_actions_email(
    mock_sleep,
    mock_send_email,
    expected_email,
    sample_control_unit_actions,
    is_integration,
    send_email_outcome,
):
    def send_email_side_effect(message):
        if isinstance(send_email_outcome, Exception):
            raise send_email_outcome
        else:
            return send_email_outcome

    mock_send_email.side_effect = send_email_side_effect

    sent_messages = send_mission_actions_email.run(
        message=expected_email,
        actions=sample_control_unit_actions,
        is_integration=is_integration,
    )
    assert len(sent_messages) == 2
    for msg in sent_messages:
        success = True
        error_code = None
        error_message = None
        addressee = msg.email_address
        if not is_integration:
            if isinstance(send_email_outcome, SMTPDataError):
                success = False
                error_message = (
                    "The server replied with an unexpected error code "
                    "(other than a refusal of a recipient)."
                )
            else:
                if msg.email_address in send_email_outcome:
                    success = False
                    error_code, error_message = send_email_outcome[addressee]
        assert isinstance(msg, ControlUnitActionsSentMessage)
        assert (
            msg.control_unit_id
            == sample_control_unit_actions.control_unit.control_unit_id
        )
        assert (
            msg.control_unit_name
            == sample_control_unit_actions.control_unit.control_unit_name
        )
        assert msg.email_address == addressee
        assert msg.actions_min_datetime_utc == sample_control_unit_actions.period.start
        assert msg.actions_max_datetime_utc == sample_control_unit_actions.period.end
        assert msg.number_of_actions == (
            len(sample_control_unit_actions.sea_controls)
            + len(sample_control_unit_actions.land_controls)
            + len(sample_control_unit_actions.air_controls)
            + len(sample_control_unit_actions.air_surveillances)
        )
        assert msg.success == success
        assert msg.error_code == error_code
        assert msg.error_message == error_message


def test_control_unit_actions_list_to_df(
    control_unit_actions_sent_messages, control_unit_actions_sent_messages_df
):
    df = control_unit_actions_list_to_df.run(control_unit_actions_sent_messages)
    pd.testing.assert_frame_equal(df, control_unit_actions_sent_messages_df)


def test_load_emails_sent_to_control_units(
    reset_test_data, control_unit_actions_sent_messages_df
):
    query = "SELECT * FROM emails_sent_to_control_units ORDER BY email_address"

    initial_emails = read_query(db="monitorfish_remote", query=query)

    load_emails_sent_to_control_units.run(control_unit_actions_sent_messages_df)
    emails_after_one_run = read_query(db="monitorfish_remote", query=query)

    load_emails_sent_to_control_units.run(control_unit_actions_sent_messages_df)
    emails_after_two_runs = read_query(db="monitorfish_remote", query=query)

    assert len(initial_emails) == 0
    assert 2 * len(emails_after_one_run) == len(emails_after_two_runs) == 4


def test_flow(reset_test_data):
    start_days_ago = 365
    end_days_ago = 0

    query = "SELECT * FROM emails_sent_to_control_units ORDER BY email_address"
    initial_emails = read_query(db="monitorfish_remote", query=query)

    flow.schedule = None
    state = flow.run(
        test_mode=False,
        is_integration=True,
        start_days_ago=start_days_ago,
        end_days_ago=end_days_ago,
    )
    assert state.is_successful()

    final_emails = read_query(db="monitorfish_remote", query=query)
    assert len(initial_emails) == 0
    assert len(final_emails) == 3
    assert (final_emails.number_of_actions == [1, 8, 1]).all()
    assert (
        final_emails.email_address
        == ["alternative@email", "email8@email.com", "some.email@control.unit.4"]
    ).all()
