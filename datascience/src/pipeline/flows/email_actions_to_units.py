from datetime import datetime, timedelta
from email.message import EmailMessage
from pathlib import Path
from typing import List

import css_inline
import pandas as pd
import prefect
from jinja2 import Environment, FileSystemLoader, Template, select_autoescape
from prefect import Flow, Parameter, case, flatten, task, unmapped
from prefect.engine.signals import SKIP
from prefect.executors import LocalDaskExecutor

from config import (
    CNSP_FRANCE_EMAIL_ADDRESS,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
)
from src.pipeline.entities.control_units import (
    ControlUnitActions,
    ControlUnitActionsSentMessage,
    ControlUnitWithEmails,
)
from src.pipeline.entities.missions import FlightGoal, MissionActionType
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.dates import Period
from src.pipeline.helpers.emails import (
    CommunicationMeans,
    create_html_email,
    send_email_or_sms_or_fax_message,
)
from src.pipeline.shared_tasks.control_flow import (
    check_flow_not_running,
    filter_results,
)
from src.pipeline.shared_tasks.control_units import fetch_control_units_contacts
from src.pipeline.shared_tasks.dates import get_utcnow


@task(checkpoint=False)
def get_actions_period(
    utcnow: datetime,
    start_days_ago: int,
    end_days_ago: int,
) -> Period:
    assert isinstance(start_days_ago, int)
    assert isinstance(end_days_ago, int)
    assert start_days_ago >= end_days_ago

    today = utcnow.date()

    start_day = today - timedelta(days=start_days_ago)
    end_day = today - timedelta(days=end_days_ago - 1)  # -1 to include the last day

    return Period(
        start=datetime(year=start_day.year, month=start_day.month, day=start_day.day),
        end=datetime(year=end_day.year, month=end_day.month, day=end_day.day),
    )


@task(checkpoint=False)
def extract_mission_actions(period: Period) -> pd.DataFrame:
    logger = prefect.context.get("logger")

    df = extract(
        "monitorfish_remote",
        "monitorfish/mission_actions_to_email.sql",
        params={
            "min_datetime_utc": period.start,
            "max_datetime_utc": period.end,
        },
    )

    def convert_flight_goal(s: str) -> FlightGoal:
        try:
            return FlightGoal(s).label
        except ValueError:
            logger.error(f"Unkown flight goal {s}.")
            return s

    def convert_flight_goals(li: List[str]) -> List[str]:
        return [convert_flight_goal(s) for s in li]

    df["flight_goals"] = df.flight_goals.map(convert_flight_goals)

    return df


@task(checkpoint=False)
def get_control_unit_ids(env_action: pd.DataFrame) -> List[int]:
    # Warning : using `set` and not `.unique()` on `control_unit_id ` in order to
    # return `int` and not `numpy.int64` values, which are not handled by psycopg2 when
    # passed as query parameters.
    return sorted(set(env_action.control_unit_id))


@task(checkpoint=False)
def filter_control_units_contacts(
    all_control_units_contacts: pd.DataFrame, control_unit_ids: List[str]
) -> List[ControlUnitWithEmails]:
    if len(control_unit_ids) == 0:
        raise SKIP("No control units to extract.")

    control_units = all_control_units_contacts.loc[
        (
            all_control_units_contacts.control_unit_id.isin(control_unit_ids)
            & (all_control_units_contacts.emails.map(len) > 0)
        ),
        ["control_unit_id", "control_unit_name", "emails"],
    ]
    records = control_units.to_dict(orient="records")
    return [ControlUnitWithEmails(**control_unit) for control_unit in records]


@task(checkpoint=False)
def to_control_unit_actions(
    mission_actions: pd.DataFrame,
    period: Period,
    control_units: List[ControlUnitWithEmails],
) -> List[ControlUnitActions]:
    return [
        ControlUnitActions(
            control_unit=control_unit,
            period=period,
            land_controls=mission_actions[
                (mission_actions.control_type == MissionActionType.LAND_CONTROL.value)
                & (mission_actions.control_unit_id == control_unit.control_unit_id)
            ].reset_index(drop=True),
            sea_controls=mission_actions[
                (mission_actions.control_type == MissionActionType.SEA_CONTROL.value)
                & (mission_actions.control_unit_id == control_unit.control_unit_id)
            ].reset_index(drop=True),
            air_controls=mission_actions[
                (mission_actions.control_type == MissionActionType.AIR_CONTROL.value)
                & (mission_actions.control_unit_id == control_unit.control_unit_id)
            ].reset_index(drop=True),
            air_surveillances=mission_actions[
                (
                    mission_actions.control_type
                    == MissionActionType.AIR_SURVEILLANCE.value
                )
                & (mission_actions.control_unit_id == control_unit.control_unit_id)
            ].reset_index(drop=True),
        )
        for control_unit in control_units
    ]


@task(checkpoint=False)
def get_template() -> Template:
    templates_locations = [
        EMAIL_TEMPLATES_LOCATION / "email_actions_to_units",
        EMAIL_STYLESHEETS_LOCATION,
    ]

    env = Environment(
        loader=FileSystemLoader(templates_locations),
        autoescape=select_autoescape(),
    )

    return env.get_template("email_actions_to_units.jinja")


@task(checkpoint=False)
def render(control_unit_actions: ControlUnitActions, template: Template) -> str:
    def format_segments(segments: list) -> str:
        return ", ".join(segments)

    def format_longitude_latitude(lon: float, lat: float) -> str:
        lon_direction = "E" if lon > 0 else "W"
        lat_direction = "N" if lat > 0 else "S"
        return f"{abs(lat): .4f}{lat_direction} {abs(lon): .4f}{lon_direction}"

    # Sea controls
    if len(control_unit_actions.sea_controls) > 0:
        sea_controls = control_unit_actions.sea_controls.copy(deep=True)

        sea_controls["vessel"] = sea_controls.apply(
            lambda row: f"{row['vessel_name']} ({row['flag_state']})", axis=1
        )

        sea_controls["infraction"] = sea_controls.infraction.map(
            {True: "Oui", False: "Non"}, na_action="ignore"
        ).fillna("-")

        sea_controls["infraction_report"] = sea_controls.infraction_report.map(
            {True: "Oui", False: "Non"}, na_action="ignore"
        ).fillna("-")

        sea_controls["position"] = sea_controls.apply(
            lambda row: format_longitude_latitude(row["longitude"], row["latitude"]),
            axis=1,
        )

        sea_controls["control_datetime_utc"] = sea_controls.control_datetime_utc.map(
            lambda d: d.strftime("%Y-%m-%d %H:%M")
        )

        sea_controls["segments"] = sea_controls.segments.map(format_segments)

        columns = {
            "control_datetime_utc": "Date du contrôle",
            "vessel": "Navire",
            "position": "Position",
            "infraction": "Infraction constatée",
            "infraction_report": "PV dressé",
            "segments": "Segment(s) de flotte",
        }

        sea_controls = sea_controls[columns.keys()].rename(columns=columns)
        sea_controls = sea_controls.to_html(index=False, border=1)

    else:
        sea_controls = "Aucun"

    # Land controls
    if len(control_unit_actions.land_controls) > 0:
        land_controls = control_unit_actions.land_controls.copy(deep=True)

        land_controls["vessel"] = land_controls.apply(
            lambda row: f"{row['vessel_name']} ({row['flag_state']})", axis=1
        )
        land_controls["infraction"] = land_controls.infraction.map(
            {True: "Oui", False: "Non"}, na_action="ignore"
        ).fillna("-")

        land_controls["infraction_report"] = land_controls.infraction_report.map(
            {True: "Oui", False: "Non"}, na_action="ignore"
        ).fillna("-")

        land_controls["control_datetime_utc"] = land_controls.control_datetime_utc.map(
            lambda d: d.strftime("%Y-%m-%d %H:%M")
        )

        land_controls["port"] = land_controls.apply(
            lambda row: f"{row['port_name']} ({row['port_locode']})", axis=1
        )

        land_controls["segments"] = land_controls.segments.map(format_segments)

        columns = {
            "control_datetime_utc": "Date du contrôle",
            "vessel": "Navire",
            "port": "Port",
            "infraction": "Infraction constatée",
            "infraction_report": "PV dressé",
            "segments": "Segment(s) de flotte",
        }

        land_controls = land_controls[columns.keys()].rename(columns=columns)
        land_controls = land_controls.to_html(index=False, border=1)
    else:
        land_controls = "Aucun"

    # Air controls
    if len(control_unit_actions.air_controls) > 0:
        air_controls = control_unit_actions.air_controls.copy(deep=True)

        air_controls["vessel"] = air_controls.apply(
            lambda row: f"{row['vessel_name']} ({row['flag_state']})", axis=1
        )
        air_controls["infraction"] = air_controls.infraction.map(
            {True: "Oui", False: "Non"}, na_action="ignore"
        ).fillna("-")

        air_controls["infraction_report"] = air_controls.infraction_report.map(
            {True: "Oui", False: "Non"}, na_action="ignore"
        ).fillna("-")

        air_controls["position"] = air_controls.apply(
            lambda row: format_longitude_latitude(row["longitude"], row["latitude"]),
            axis=1,
        )

        air_controls["control_datetime_utc"] = air_controls.control_datetime_utc.map(
            lambda d: d.strftime("%Y-%m-%d %H:%M")
        )

        columns = {
            "control_datetime_utc": "Date du contrôle",
            "vessel": "Navire",
            "position": "Position",
            "infraction": "Infraction constatée",
            "infraction_report": "PV dressé",
        }

        air_controls = air_controls[columns.keys()].rename(columns=columns)
        air_controls = air_controls.to_html(index=False, border=1)
    else:
        air_controls = "Aucun"

    # Air surveillances
    if len(control_unit_actions.air_surveillances) > 0:
        air_surveillances = control_unit_actions.air_surveillances.copy(deep=True)

        air_surveillances[
            "control_datetime_utc"
        ] = air_surveillances.control_datetime_utc.map(
            lambda d: d.strftime("%Y-%m-%d %H:%M")
        )

        air_surveillances["segments"] = air_surveillances.segments.map(format_segments)
        air_surveillances["flight_goals"] = air_surveillances.flight_goals.map(
            lambda li: ", ".join(li), na_action="ignore"
        )

        columns = {
            "control_datetime_utc": "Date du vol",
            "number_of_vessels_flown_over": "Navires survolés",
            "flight_goals": "Objectifs du vols",
            "segments": "Segments ciblés",
        }

        air_surveillances = air_surveillances[columns.keys()].rename(columns=columns)
        air_surveillances = air_surveillances.to_html(index=False, border=1)
    else:
        air_surveillances = "Aucune"

    html = template.render(
        control_unit_name=control_unit_actions.control_unit.control_unit_name,
        land_controls=land_controls,
        sea_controls=sea_controls,
        air_controls=air_controls,
        air_surveillances=air_surveillances,
        from_date=control_unit_actions.period.start.strftime("%d/%m/%Y %H:%M UTC"),
        to_date=control_unit_actions.period.end.strftime("%d/%m/%Y %H:%M UTC"),
        cnsp_france_email_address=CNSP_FRANCE_EMAIL_ADDRESS,
    )

    html = css_inline.inline(html)
    return html


@task(checkpoint=False)
def create_email(
    html: str, actions: ControlUnitActions, test_mode: bool
) -> EmailMessage:
    to = CNSP_FRANCE_EMAIL_ADDRESS if test_mode else actions.control_unit.emails

    message = create_html_email(
        to=to,
        subject="Bilan hebdomadaire contrôle des pêches",
        html=html,
        reply_to=CNSP_FRANCE_EMAIL_ADDRESS,
    )

    return message


@task(checkpoint=False)
def send_mission_actions_email(
    message: EmailMessage, actions: ControlUnitActions, is_integration: bool
) -> List[ControlUnitActionsSentMessage]:
    """
    Sends input email using the contents of `From` header as sender and `To`, `Cc`
    and `Bcc` headers as recipients.

    Args:
        message (EmailMessage): email message to send
        actions (ControlUnitActions): `ControlUnitActions` related to message
        is_integration (bool): if ``False``, the message is not actually sent

    Returns:
        List[ControlUnitActionsSentMessage]: List of sent messages and their error
        codes, if any.
    """

    logger = prefect.context.get("logger")
    addressees = actions.control_unit.emails

    send_errors = send_email_or_sms_or_fax_message(
        msg=message,
        communication_means=CommunicationMeans.EMAIL,
        is_integration=is_integration,
        logger=logger,
    )

    now = datetime.utcnow()

    sent_messages = []

    for addressee in addressees:
        if addressee in send_errors:
            success = False
            error_code = send_errors[addressee][0]
            error_message = send_errors[addressee][1]
        else:
            success = True
            error_code = None
            error_message = None

        sent_messages.append(
            ControlUnitActionsSentMessage(
                control_unit_id=actions.control_unit.control_unit_id,
                control_unit_name=actions.control_unit.control_unit_name,
                email_address=addressee,
                sending_datetime_utc=now,
                actions_min_datetime_utc=actions.period.start,
                actions_max_datetime_utc=actions.period.end,
                number_of_actions=(
                    len(actions.sea_controls)
                    + len(actions.land_controls)
                    + len(actions.air_controls)
                    + len(actions.air_surveillances)
                ),
                success=success,
                error_code=error_code,
                error_message=error_message,
            )
        )
    return sent_messages


@task(checkpoint=False)
def control_unit_actions_list_to_df(
    messages: List[ControlUnitActionsSentMessage],
) -> pd.DataFrame:
    messages = pd.DataFrame(messages)
    return messages


@task(checkpoint=False)
def load_emails_sent_to_control_units(
    emails_sent_to_control_units: pd.DataFrame,
):
    load(
        emails_sent_to_control_units,
        table_name="emails_sent_to_control_units",
        schema="public",
        db_name="monitorfish_remote",
        how="append",
        nullable_integer_columns=["error_code"],
        logger=prefect.context.get("logger"),
    )


with Flow("Email actions to units", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        test_mode = Parameter("test_mode")
        is_integration = Parameter("is_integration")
        start_days_ago = Parameter("start_days_ago")
        end_days_ago = Parameter("end_days_ago")

        template = get_template()
        utcnow = get_utcnow()

        period = get_actions_period(
            utcnow=utcnow,
            start_days_ago=start_days_ago,
            end_days_ago=end_days_ago,
        )
        mission_actions = extract_mission_actions(period=period)
        all_control_units_contacts = fetch_control_units_contacts()

        control_unit_ids = get_control_unit_ids(mission_actions)
        control_units_emails = filter_control_units_contacts(
            all_control_units_contacts, control_unit_ids
        )

        control_unit_actions = to_control_unit_actions(
            mission_actions, period, control_units_emails
        )

        html = render.map(control_unit_actions, template=unmapped(template))

        message = create_email.map(
            html=html,
            actions=control_unit_actions,
            test_mode=unmapped(test_mode),
        )
        message = filter_results(message)

        sent_messages = send_mission_actions_email.map(
            message,
            control_unit_actions,
            is_integration=unmapped(is_integration),
        )

        sent_messages = flatten(sent_messages)
        sent_messages = control_unit_actions_list_to_df(sent_messages)
        load_emails_sent_to_control_units(sent_messages)

flow.file_name = Path(__file__).name
