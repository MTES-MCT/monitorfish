import dataclasses
from datetime import datetime
from email.policy import EmailPolicy
from itertools import chain
from pathlib import Path
from typing import List, Tuple

import numpy as np
import pandas as pd
import prefect
import prefect.engine
import prefect.engine.signals
import prefect.exceptions
import requests
import weasyprint
from jinja2 import Environment, FileSystemLoader, Template, select_autoescape
from prefect import Flow, Parameter, case, flatten, task, unmapped
from prefect.executors import LocalDaskExecutor
from sqlalchemy import Executable, bindparam, text

from config import (
    CNSP_CROSSA_CACEM_LOGOS_PATH,
    CNSP_FRANCE_EMAIL_ADDRESS,
    CNSP_LOGO_PATH,
    CNSP_SIP_DEPARTMENT_MOBILE_PHONE,
    EMAIL_FONTS_LOCATION,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
    LIBERTE_EGALITE_FRATERNITE_LOGO_PATH,
    MARIANNE_LOGO_PATH,
    MONITORENV_API_ENDPOINT,
    MONITORFISH_EMAIL_ADDRESS,
    PNO_TEST_EMAIL,
    SE_MER_LOGO_PATH,
    SMS_TEMPLATES_LOCATION,
    STATE_FLAGS_ICONS_LOCATION,
    default_risk_factors,
)
from src.pipeline.entities.fleet_segments import FishingGear, FleetSegment
from src.pipeline.entities.missions import Infraction
from src.pipeline.entities.pnos import (
    PnoCatch,
    PnoSource,
    PnoToRender,
    PnoToSend,
    PreRenderedPno,
    PriorNotificationSentMessage,
    RenderedPno,
    ReturnToPortPurpose,
)
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.emails import (
    CommunicationMeans,
    create_html_email,
    create_sms_email,
    resize_pdf_to_A4,
    send_email_or_sms_or_fax_message,
)
from src.pipeline.processing import remove_nones_from_list
from src.pipeline.shared_tasks.control_flow import (
    check_flow_not_running,
    filter_results,
)
from src.pipeline.shared_tasks.dates import get_utcnow, make_timedelta
from src.pipeline.shared_tasks.infrastructure import execute_statement


@task(checkpoint=False)
def extract_species_names() -> dict:
    """
    Returns `dict` with species code as key and species name as value
    """
    species = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/species_names.sql",
    )
    return species.set_index("species_code").species_name.to_dict()


@task(checkpoint=False)
def extract_fishing_gear_names() -> dict:
    """
    Returns `dict` with fishing gear code as key and fishing gear name as value
    """
    fishing_gears = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fishing_gear_names.sql",
    )
    return fishing_gears.set_index("fishing_gear_code").fishing_gear_name.to_dict()


@task(checkpoint=False)
def extract_pnos_to_generate(
    start_datetime_utc: datetime, end_datetime_utc: datetime
) -> Tuple[pd.DataFrame, bool]:
    logger = prefect.context.get("logger")

    pnos = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pnos_to_generate.sql",
        params={
            "start_datetime_utc": start_datetime_utc,
            "end_datetime_utc": end_datetime_utc,
        },
    )
    logger.info(f"Extracted {len(pnos)} PNOs to generate.")

    generation_needed = len(pnos) > 0

    return (pnos, generation_needed)


@task(checkpoint=False)
def extract_pno_units_targeting_vessels() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pno_units_targeting_vessels.sql",
    )


@task(checkpoint=False)
def extract_pno_units_ports_and_segments_subscriptions() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pno_units_ports_and_segments_subscriptions.sql",
    )


@task(checkpoint=False)
def fetch_control_units_contacts() -> pd.DataFrame:
    r = requests.get(MONITORENV_API_ENDPOINT + "control_units")

    r.raise_for_status()
    df = pd.DataFrame(r.json())

    columns = {
        "id": "control_unit_id",
        "controlUnitContacts": "control_unit_contacts",
        "isArchived": "is_archived",
    }

    df = df[columns.keys()].rename(columns=columns)

    contacts = (
        df.loc[~df.is_archived, ["control_unit_id", "control_unit_contacts"]]
        .explode("control_unit_contacts")
        .dropna()
        .reset_index(drop=True)
    )
    contacts["email"] = contacts["control_unit_contacts"].apply(
        lambda x: x.get("email") if x.get("isEmailSubscriptionContact") else None
    )

    contacts["phone"] = contacts["control_unit_contacts"].apply(
        lambda x: x.get("phone") if x.get("isSmsSubscriptionContact") else None
    )

    email_and_phone_contacts = (
        contacts[["control_unit_id", "email", "phone"]]
        .dropna(subset=["email", "phone"], how="all")
        .groupby("control_unit_id")
        .agg({"email": "unique", "phone": "unique"})
        .rename(columns={"email": "emails", "phone": "phone_numbers"})
        .map(remove_nones_from_list)
        .map(sorted)
        .reset_index()
    )

    return email_and_phone_contacts


@task(checkpoint=False)
def to_pnos_to_render(pnos: pd.DataFrame) -> List[PnoToRender]:
    records = pnos.to_dict(orient="records")
    return [PnoToRender(**record) for record in records]


@task(checkpoint=False)
def pre_render_pno(
    pno: PnoToRender, species_names: dict, fishing_gear_names: dict
) -> PreRenderedPno:
    logger = prefect.context.get("logger")

    trip_gears = [
        FishingGear(
            code=g.get("gear"),
            name=fishing_gear_names.get(g.get("gear")),
            mesh=g.get("mesh"),
        )
        for g in pno.trip_gears
    ]

    trip_segments = [
        FleetSegment(
            code=s.get("segment"),
            name=s.get("segmentName"),
        )
        for s in pno.trip_segments
    ]

    pno_types = [t.get("pnoTypeName") for t in pno.pno_types]

    if pno.catch_onboard:
        catches_list = [
            PnoCatch(
                species_code=c.get("species"),
                species_name=species_names.get(c.get("species")),
                number_of_fish=c.get("nbFish"),
                weight=c.get("weight"),
                fao_area=c.get("faoZone"),
                statistical_rectangle=c.get("statisticalRectangle"),
            )
            for c in pno.catch_onboard
            if c.get("species") is not None
        ]

        df = pd.DataFrame(catches_list)
        df["fao_area"] = df.fao_area.fillna("-")
        sum_by_area = (
            df.groupby(["species_name_code", "fao_area"], dropna=False)
            .agg(
                {
                    "weight": sum,
                    "number_of_fish": sum,
                    "statistical_rectangle": "unique",
                }
            )
            .reset_index()
        )

        def format_list(li: list) -> str:
            li = [x for x in li if x is not None]
            return f"{', '.join(li)}"

        def format_sr_list(sr_list: list) -> str:
            res = format_list(sr_list)
            return f" ({res})" if res else ""

        sum_by_area["area_sr"] = sum_by_area.apply(
            lambda row: f"{row.fao_area}{format_sr_list(row.statistical_rectangle)}",
            axis=1,
        )
        sum_by_species = (
            sum_by_area.groupby("species_name_code")
            .agg({"area_sr": list, "weight": sum, "number_of_fish": sum})
            .reset_index()
            .sort_values("weight", ascending=False)
            .reset_index(drop=True)
        )

        sum_by_species["area_sr"] = sum_by_species.area_sr.map(format_list)
        sum_by_species = sum_by_species.astype({"number_of_fish": int, "weight": int})
        sum_by_species["number_of_fish"] = sum_by_species.number_of_fish.where(
            sum_by_species.number_of_fish > 0, "-"
        )

        sum_by_species = sum_by_species.rename(
            columns={
                "species_name_code": "Espèces",
                "area_sr": "Zones de pêche",
                "weight": "Qtés (kg)",
                "number_of_fish": "Nb",
            }
        )
    else:
        sum_by_species = None

    try:
        purpose = ReturnToPortPurpose(pno.purpose).label()
    except (ValueError, KeyError) as e:
        error_message = str(e)
        logger.error(f"Failed to interpret purpose code with error {error_message}.")
        purpose = pno.purpose

    last_control_logbook_infractions = [
        Infraction(natinf=inf.get("natinf"), comments=inf.get("comments"))
        for inf in pno.last_control_logbook_infractions
    ]
    last_control_gear_infractions = [
        Infraction(natinf=inf.get("natinf"), comments=inf.get("comments"))
        for inf in pno.last_control_gear_infractions
    ]
    last_control_species_infractions = [
        Infraction(natinf=inf.get("natinf"), comments=inf.get("comments"))
        for inf in pno.last_control_species_infractions
    ]
    last_control_other_infractions = [
        Infraction(natinf=inf.get("natinf"), comments=inf.get("comments"))
        for inf in pno.last_control_other_infractions
    ]

    return PreRenderedPno(
        id=pno.id,
        operation_datetime_utc=pno.operation_datetime_utc,
        report_id=pno.report_id,
        report_datetime_utc=pno.report_datetime_utc,
        vessel_id=pno.vessel_id,
        cfr=pno.cfr,
        ircs=pno.ircs,
        external_identification=pno.external_identification,
        vessel_name=pno.vessel_name,
        flag_state=pno.flag_state,
        purpose=purpose,
        catch_onboard=sum_by_species,
        port_locode=pno.port_locode,
        port_name=pno.port_name,
        predicted_arrival_datetime_utc=pno.predicted_arrival_datetime_utc,
        predicted_landing_datetime_utc=pno.predicted_landing_datetime_utc,
        trip_gears=trip_gears,
        trip_segments=trip_segments,
        pno_types=pno_types,
        note=pno.note,
        vessel_length=pno.vessel_length,
        mmsi=pno.mmsi,
        risk_factor=pno.risk_factor or default_risk_factors["risk_factor"],
        last_control_datetime_utc=pno.last_control_datetime_utc,
        last_control_logbook_infractions=last_control_logbook_infractions,
        last_control_gear_infractions=last_control_gear_infractions,
        last_control_species_infractions=last_control_species_infractions,
        last_control_other_infractions=last_control_other_infractions,
        is_verified=pno.is_verified,
        is_being_sent=pno.is_being_sent,
        source=pno.source,
    )


@task(checkpoint=False)
def get_html_for_pdf_template() -> Template:
    templates_locations = [
        EMAIL_TEMPLATES_LOCATION / "prior_notifications",
        EMAIL_STYLESHEETS_LOCATION,
    ]

    env = Environment(
        loader=FileSystemLoader(templates_locations), autoescape=select_autoescape()
    )

    def pluralize(value, singular="", plural="s"):
        if value == 1:
            return singular
        else:
            return plural

    env.filters["pluralize"] = pluralize

    return env.get_template("base_template.jinja")


@task(checkpoint=False)
def get_email_body_template() -> Template:
    templates_locations = [EMAIL_TEMPLATES_LOCATION / "prior_notifications"]

    env = Environment(
        loader=FileSystemLoader(templates_locations), autoescape=select_autoescape()
    )

    def pluralize(value, singular="", plural="s"):
        if value == 1:
            return singular
        else:
            return plural

    env.filters["pluralize"] = pluralize

    return env.get_template("email_body_template.jinja")


@task(checkpoint=False)
def get_sms_template() -> Template:
    templates_locations = [SMS_TEMPLATES_LOCATION]

    env = Environment(
        loader=FileSystemLoader(templates_locations), autoescape=select_autoescape()
    )

    def pluralize(value, singular="", plural="s"):
        if value == 1:
            return singular
        else:
            return plural

    env.filters["pluralize"] = pluralize

    return env.get_template("prior_notification.jinja")


@task(checkpoint=False)
def render_pno(
    pno: PreRenderedPno,
    html_for_pdf_template: Template,
    email_body_template: Template,
    sms_template: Template,
) -> RenderedPno:
    fonts_directory = EMAIL_FONTS_LOCATION.as_uri()

    state_flag_icon_src = (
        STATE_FLAGS_ICONS_LOCATION / Path(f"{pno.flag_state}.svg")
    ).as_uri()

    risk_factor_thresholds = np.array([1.75, 2.5, 3.25])
    thresholds_exceeded = (pno.risk_factor >= risk_factor_thresholds).sum()
    risk_factor_description_scale = [
        "faible",
        "moyenne",
        "élevée",
        "très élevée",
    ]

    risk_factor_color_scale = [
        "cadet-grey",
        "grullo",
        "copper-red",
        "chinese-red",
    ]

    risk_factor_description = risk_factor_description_scale[thresholds_exceeded]
    risk_factor_color = risk_factor_color_scale[thresholds_exceeded]

    if isinstance(pno.catch_onboard, pd.DataFrame):
        catch_onboard = pno.catch_onboard.to_html(index=False, border=1, justify="left")
    else:
        catch_onboard = None

    date_format = "%d/%m/%Y à %Hh%M UTC"

    def format_nullable_datetime(d: datetime, format: str = date_format):
        if d:
            return d.strftime(format)
        else:
            return ""

    html_for_pdf = html_for_pdf_template.render(
        fonts_directory=fonts_directory,
        cnsp_logo_src=CNSP_LOGO_PATH.as_uri(),
        se_mer_logo_src=SE_MER_LOGO_PATH.as_uri(),
        state_flag_icon_src=state_flag_icon_src,
        report_id=pno.report_id,
        report_datetime_utc=format_nullable_datetime(pno.report_datetime_utc),
        cfr=pno.cfr or "",
        ircs=pno.ircs or "",
        external_identification=pno.external_identification or "",
        vessel_name=pno.vessel_name,
        purpose=pno.purpose,
        catch_onboard=catch_onboard,
        port_locode=pno.port_locode,
        port_name=pno.port_name,
        predicted_arrival_datetime_utc=format_nullable_datetime(
            pno.predicted_arrival_datetime_utc
        ),
        predicted_landing_datetime_utc=format_nullable_datetime(
            pno.predicted_landing_datetime_utc
        ),
        trip_gears="<br>".join(
            [
                f"{g.name} ({g.code})" + (f" - Maillage {g.mesh} mm" if g.mesh else "")
                for g in pno.trip_gears
            ]
        ),
        trip_segments="<br>".join([f"{s.code} - {s.name}" for s in pno.trip_segments]),
        pno_types=", ".join(pno.pno_types),
        note=pno.note,
        vessel_length=pno.vessel_length,
        mmsi=pno.mmsi,
        risk_factor=pno.risk_factor,
        risk_factor_description=risk_factor_description,
        risk_factor_color=risk_factor_color,
        last_control_datetime_utc=format_nullable_datetime(
            pno.last_control_datetime_utc
        ),
        last_control_logbook_infractions=pno.last_control_logbook_infractions,
        last_control_gear_infractions=pno.last_control_gear_infractions,
        last_control_species_infractions=pno.last_control_species_infractions,
        last_control_other_infractions=pno.last_control_other_infractions,
        last_control_compliant=(
            isinstance(pno.last_control_datetime_utc, datetime)
            and (pno.last_control_logbook_infractions == [])
            and (pno.last_control_gear_infractions == [])
            and (pno.last_control_species_infractions == [])
            and (pno.last_control_other_infractions == [])
        ),
    )

    html_email_body = email_body_template.render(
        vessel_name=pno.vessel_name,
        cfr=pno.cfr,
        trip_segments=", ".join([f"{s.code} - {s.name}" for s in pno.trip_segments]),
        risk_factor=pno.risk_factor,
        cnsp_crossa_cacem_logos_src=f"cid:{CNSP_CROSSA_CACEM_LOGOS_PATH.name}",
        liberte_egalite_fraternite_logo_src=f"cid:{LIBERTE_EGALITE_FRATERNITE_LOGO_PATH.name}",
        marianne_logo_src=f"cid:{MARIANNE_LOGO_PATH.name}",
        report_datetime_utc=format_nullable_datetime(pno.report_datetime_utc),
        predicted_arrival_datetime_utc=format_nullable_datetime(
            pno.predicted_arrival_datetime_utc
        ),
        predicted_landing_datetime_utc=format_nullable_datetime(
            pno.predicted_landing_datetime_utc
        ),
        port_name=pno.port_name,
        port_locode=pno.port_locode,
        pno_types=", ".join(pno.pno_types),
        note=pno.note,
    )

    sms_date_format = "%d/%m/%Y, %Hh%M UTC"
    sms_content = sms_template.render(
        vessel_name=pno.vessel_name,
        cfr=pno.cfr,
        trip_segments=", ".join([f"{s.code}" for s in pno.trip_segments]),
        risk_factor=pno.risk_factor,
        predicted_landing_datetime_utc=format_nullable_datetime(
            pno.predicted_landing_datetime_utc, format=sms_date_format
        ),
        predicted_arrival_datetime_utc=format_nullable_datetime(
            pno.predicted_arrival_datetime_utc, format=sms_date_format
        ),
        port_name=pno.port_name,
        note=pno.note,
    )

    pdf = weasyprint.HTML(string=html_for_pdf).write_pdf(
        optimize_size=("fonts", "images")
    )
    pdf = resize_pdf_to_A4(pdf)

    return RenderedPno(
        report_id=pno.report_id,
        vessel_id=pno.vessel_id,
        cfr=pno.cfr,
        vessel_name=pno.vessel_name,
        is_verified=pno.is_verified,
        is_being_sent=pno.is_being_sent,
        trip_segments=pno.trip_segments,
        port_locode=pno.port_locode,
        source=pno.source,
        html_for_pdf=html_for_pdf,
        pdf_document=pdf,
        generation_datetime_utc=datetime.utcnow(),
        html_email_body=html_email_body,
        sms_content=sms_content,
    )


@task(checkpoint=False)
def load_pno_pdf_documents(
    pno_pdf_documents: List[RenderedPno],
) -> Tuple[List[RenderedPno], bool]:
    """
    Loads input pno_pdf_documents to `prior_notification_pdf_documents` and returns
    the subset of the input that must be distributed, i.e. the list of `RenderedPno`
    on which `is_being_sent` is `True`.

    Args:
        pno_pdf_documents (List[RenderedPno]): RenderedPnos to load

    Returns:
        List[RenderedPno]: subset of input having `is_being_sent` equal to `True`.
    """
    logger = prefect.context.get("logger")

    df = pd.DataFrame(pno_pdf_documents)[
        ["report_id", "source", "generation_datetime_utc", "pdf_document"]
    ]

    logger.info(f"Loading {len(df)} generated PNO pdf documents.")

    load(
        df,
        table_name="prior_notification_pdf_documents",
        schema="public",
        logger=logger,
        how="upsert",
        db_name="monitorfish_remote",
        table_id_column="report_id",
        df_id_column="report_id",
        enum_columns=["source"],
        bytea_columns=["pdf_document"],
    )

    pnos_to_distribute = [
        dataclasses.replace(d) for d in pno_pdf_documents if d.is_being_sent == True
    ]

    logger.info(f"Returning {len(pnos_to_distribute)} PNOs to distribute.")

    distribution_needed = len(pnos_to_distribute) > 0

    return (pnos_to_distribute, distribution_needed)


@task(checkpoint=False)
def attribute_addressees(
    pno_to_distribute: RenderedPno,
    units_targeting_vessels: pd.DataFrame,
    units_ports_and_segments_subscriptions: pd.DataFrame,
    control_units_contacts: pd.DataFrame,
) -> RenderedPno:
    """
    Returns a copy of the input `RenderedPno`'s with its `control_unit_ids`,
    `email_addresses` and `phone_numbers` attributes updated, representing control
    units that should receive the PNO. The control units attributed to the PNO are :

      - control units who target the vessel
      - control units who subscribed to the port with the "receive all pnos"
        option
      - Plus :
        - control units who subscribed to the port, if the PNO is in
          verification scope
        - control units who subscribed to the port AND to a segment of the PNO
          if the PNO is not in verification scope

    Args:
        pno_to_distribute (RenderedPno): RenderedPno
        units_targeting_vessels (pd.DataFrame): DataFrame with columns
          `control_unit_ids_targeting_vessel` and `vessel_id`
        units_ports_and_segments_subscriptions (pd.DataFrame): DataFrame with columns
          `control_unit_id`, `port_locode`, `receive_all_pnos_from_port`, and
          `unit_subscribed_segments`
        control_units_contacts (pd.DataFrame): DataFrame with columns
          `control_unit_id`, `emails` and `phone_numbers`

    Returns:
        RenderedPno: copy of the input `pno_to_distribute` with addressees added
    """
    if pno_to_distribute.vessel_id in units_targeting_vessels.vessel_id.values:
        units_targeting_vessel = set(
            units_targeting_vessels.loc[
                units_targeting_vessels.vessel_id == pno_to_distribute.vessel_id,
                "control_unit_ids_targeting_vessel",
            ].values[0]
        )
    else:
        units_targeting_vessel = set()

    if pno_to_distribute.is_verified:
        units_subscribed_to_port = set(
            units_ports_and_segments_subscriptions.loc[
                (
                    units_ports_and_segments_subscriptions.port_locode
                    == pno_to_distribute.port_locode
                ),
                "control_unit_id",
            ].values
        )

    else:
        pno_segments = [s.code for s in pno_to_distribute.trip_segments]

        units_subscribed_to_port = set(
            units_ports_and_segments_subscriptions.loc[
                (
                    (
                        units_ports_and_segments_subscriptions.port_locode
                        == pno_to_distribute.port_locode
                    )
                    & (
                        units_ports_and_segments_subscriptions.receive_all_pnos_from_port
                        | (
                            units_ports_and_segments_subscriptions.unit_subscribed_segments.map(
                                set
                            ).map(
                                lambda s: not s.isdisjoint(pno_segments)
                            )
                        )
                    )
                ),
                "control_unit_id",
            ].values
        )

    control_unit_ids = units_subscribed_to_port.union(units_targeting_vessel)

    emails = sorted(
        set(
            chain.from_iterable(
                control_units_contacts.loc[
                    control_units_contacts.control_unit_id.isin(control_unit_ids),
                    "emails",
                ].tolist()
            )
        )
    )

    phone_numbers = sorted(
        set(
            chain.from_iterable(
                control_units_contacts.loc[
                    control_units_contacts.control_unit_id.isin(control_unit_ids),
                    "phone_numbers",
                ].tolist()
            )
        )
    )

    return dataclasses.replace(
        pno_to_distribute,
        control_unit_ids=control_unit_ids,
        emails=emails,
        phone_numbers=phone_numbers,
    )


@task(checkpoint=False)
def create_email(pno: RenderedPno, test_mode: bool) -> PnoToSend:
    if pno.emails:
        if test_mode:
            if PNO_TEST_EMAIL:
                to = PNO_TEST_EMAIL
            else:
                return None
        else:
            to = pno.emails

        message = create_html_email(
            to=to,
            subject=f"Préavis de débarquement - {pno.vessel_name}",
            html=pno.html_email_body,
            from_=MONITORFISH_EMAIL_ADDRESS,
            images=[
                CNSP_CROSSA_CACEM_LOGOS_PATH,
                LIBERTE_EGALITE_FRATERNITE_LOGO_PATH,
                MARIANNE_LOGO_PATH,
            ],
            attachments={
                f"Preavis_{pno.vessel_name if pno.vessel_name else ''}.pdf": pno.pdf_document
            },
            reply_to=CNSP_FRANCE_EMAIL_ADDRESS,
        )
        return PnoToSend(
            pno=pno,
            message=message,
            communication_means=CommunicationMeans.EMAIL,
        )

    else:
        return None


@task(checkpoint=False)
def create_sms(pno: RenderedPno, test_mode: bool) -> PnoToSend:
    if pno.phone_numbers:
        if test_mode:
            if CNSP_SIP_DEPARTMENT_MOBILE_PHONE:
                to = CNSP_SIP_DEPARTMENT_MOBILE_PHONE
            else:
                return None
        else:
            to = pno.phone_numbers

        return PnoToSend(
            pno=pno,
            message=create_sms_email(to=to, text=pno.sms_content),
            communication_means=CommunicationMeans.SMS,
        )
    else:
        return None


@task(checkpoint=False)
def send_pno_message(
    pno_to_send: PnoToSend, is_integration: bool
) -> List[PriorNotificationSentMessage]:
    logger = prefect.context.get("logger")

    send_errors = send_email_or_sms_or_fax_message(
        pno_to_send.message, pno_to_send.communication_means, is_integration, logger
    )

    prior_notification_sent_messages = []

    policy = EmailPolicy()

    for addressee in pno_to_send.get_addressees():
        formatted_addressee = policy.header_factory("To", addressee)

        if formatted_addressee in send_errors:
            success = False
            error_message = send_errors[formatted_addressee][1]
        else:
            success = True
            error_message = None

        prior_notification_sent_messages.append(
            PriorNotificationSentMessage(
                prior_notification_report_id=pno_to_send.pno.report_id,
                prior_notification_source=pno_to_send.pno.source,
                date_time_utc=datetime.utcnow(),
                communication_means=pno_to_send.communication_means,
                recipient_address_or_number=addressee,
                success=success,
                error_message=error_message,
            )
        )
    return prior_notification_sent_messages


@task(checkpoint=False)
def load_prior_notification_sent_messages(
    prior_notification_sent_messages: List[PriorNotificationSentMessage],
):
    if prior_notification_sent_messages:
        load(
            pd.DataFrame(prior_notification_sent_messages),
            table_name="prior_notification_sent_messages",
            schema="public",
            logger=prefect.context.get("logger"),
            how="append",
            db_name="monitorfish_remote",
            enum_columns=[
                "prior_notification_source",
                "communication_means",
            ],
        )


@task(checkpoint=False)
def make_update_logbook_reports_statement(
    pnos_to_update: List[RenderedPno],
    sent_messages: List[PriorNotificationSentMessage],
    start_datetime_utc: datetime,
    end_datetime_utc: datetime,
) -> Executable:
    """
    Creates slqalchemy update statement to update `isBeingSent` and `isSent` fields of
    PNO of source `LOGBOOK` in table `logbook_reports`.

    Args:
        pnos_to_update (List[RenderedPno]): PNOs to update
        sent_messages (List[PriorNotificationSentMessage]): PNOs that were sent
        start_datetime_utc (datetime): start date
        end_datetime_utc (datetime): end date

    Raises:
        prefect.engine.signals.SKIP: If no PNOs with source = 'LOGBOOK' is in the input
          list

    Returns:
        Executable: SQLAlchemy Update Statement
    """
    logbook_pno_report_ids = tuple(
        pno.report_id for pno in pnos_to_update if pno.source == PnoSource.LOGBOOK
    )

    sent_pno_report_ids = tuple(
        sorted(
            set(
                m.prior_notification_report_id
                for m in sent_messages
                if (m.success and m.prior_notification_source == PnoSource.LOGBOOK)
            )
        )
    )

    logger = prefect.context.get("logger")

    if logbook_pno_report_ids:
        logger.info(
            (
                "Creating state change SQL statement for "
                f"{ len(logbook_pno_report_ids) } LOGBOOK PNOs."
            )
        )

        bind_params = [
            bindparam(
                "logbook_pno_report_ids", value=logbook_pno_report_ids, expanding=True
            ),
        ]

        # Empty tuple is not expanded correctly by SQLAlchemy so this case must be
        # handled separately
        if sent_pno_report_ids:
            is_sent_line = (
                "       (CASE WHEN report_id IN :sent_pno_report_ids "
                "THEN 'true' "
                "ELSE 'false' END)::jsonb"
            )
            bind_params.append(
                bindparam(
                    "sent_pno_report_ids", value=sent_pno_report_ids, expanding=True
                )
            )

        else:
            is_sent_line = "       false::text::jsonb"

        statement = text(
            "UPDATE public.logbook_reports "
            "   SET value = jsonb_set("
            "       jsonb_set("
            "           value, "
            "           '{isBeingSent}', "
            "           false::text::jsonb"
            "       ), "
            "       '{isSent}', "
            f"{is_sent_line}"
            "   ) "
            "WHERE "
            "   operation_datetime_utc >= :start_datetime_utc "
            "   AND operation_datetime_utc < :end_datetime_utc "
            "   AND report_id IN :logbook_pno_report_ids"
        ).bindparams(
            *bind_params,
            start_datetime_utc=start_datetime_utc,
            end_datetime_utc=end_datetime_utc,
        )

        return statement

    else:
        raise prefect.engine.signals.SKIP


@task(checkpoint=False)
def make_manual_prior_notifications_statement(
    pnos_to_update: List[RenderedPno],
    sent_messages: List[PriorNotificationSentMessage],
) -> Executable:
    """
    Creates slqalchemy update statement to update `isBeingSent` and `isSent` fields of
    PNO of source `MANUAL` in table `manual_prior_notifications`.

    Args:
        pnos_to_update (List[RenderedPno]): PNOs to update

    Raises:
        prefect.engine.signals.SKIP: If no PNOs with source = 'MANUAL' is in the input
          list

    Returns:
        Executable: SQLAlchemy Update Statement
    """
    manual_pno_report_ids = tuple(
        pno.report_id for pno in pnos_to_update if pno.source == PnoSource.MANUAL
    )

    sent_pno_report_ids = tuple(
        sorted(
            set(
                m.prior_notification_report_id
                for m in sent_messages
                if (m.success and m.prior_notification_source == PnoSource.MANUAL)
            )
        )
    )

    logger = prefect.context.get("logger")

    if manual_pno_report_ids:
        logger.info(
            (
                "Creating state change SQL statement for "
                f"{ len(manual_pno_report_ids) } MANUAL PNOs."
            )
        )

        bind_params = [
            bindparam(
                "manual_pno_report_ids", value=manual_pno_report_ids, expanding=True
            ),
        ]

        # Empty tuple is not expanded correctly by SQLAlchemy so this case must be
        # handled separately
        if sent_pno_report_ids:
            is_sent_line = (
                "       (CASE WHEN report_id IN :sent_pno_report_ids "
                "THEN 'true' "
                "ELSE 'false' END)::jsonb"
            )
            bind_params.append(
                bindparam(
                    "sent_pno_report_ids", value=sent_pno_report_ids, expanding=True
                )
            )

        else:
            is_sent_line = "       false::text::jsonb"

        statement = text(
            "UPDATE public.manual_prior_notifications "
            "   SET value = jsonb_set("
            "       jsonb_set("
            "           value, "
            "           '{isBeingSent}', "
            "           false::text::jsonb"
            "       ), "
            "       '{isSent}', "
            f"{is_sent_line}"
            "   ) "
            "WHERE report_id IN :manual_pno_report_ids"
        ).bindparams(*bind_params)

        return statement

    else:
        raise prefect.engine.signals.SKIP


with Flow("Distribute pnos", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        # Input parameters
        test_mode = Parameter("test_mode")
        is_integration = Parameter("is_integration")
        start_hours_ago = Parameter("start_hours_ago")
        end_hours_ago = Parameter("end_hours_ago")

        # Computed parameters
        timedelta_from_start_to_now = make_timedelta(hours=start_hours_ago)
        timedelta_from_end_to_now = make_timedelta(hours=end_hours_ago)
        utcnow = get_utcnow()
        start_datetime_utc = utcnow - timedelta_from_start_to_now
        end_datetime_utc = utcnow - timedelta_from_end_to_now

        # Extract PNOs
        pnos_to_generate, generation_needed = extract_pnos_to_generate(
            start_datetime_utc=start_datetime_utc,
            end_datetime_utc=end_datetime_utc,
        )

        with case(generation_needed, True):
            # Extract
            control_units_contacts = fetch_control_units_contacts()
            species_names = extract_species_names()
            fishing_gear_names = extract_fishing_gear_names()
            html_for_pdf_template = get_html_for_pdf_template()
            email_body_template = get_email_body_template()
            sms_template = get_sms_template()
            units_targeting_vessels = extract_pno_units_targeting_vessels()
            units_ports_and_segments_subscriptions = (
                extract_pno_units_ports_and_segments_subscriptions()
            )

            # Render pdf documents
            pnos_to_render = to_pnos_to_render(pnos_to_generate)
            pre_rendered_pnos = pre_render_pno.map(
                pnos_to_render,
                species_names=unmapped(species_names),
                fishing_gear_names=unmapped(fishing_gear_names),
            )
            rendered_pnos = render_pno.map(
                pre_rendered_pnos,
                html_for_pdf_template=unmapped(html_for_pdf_template),
                email_body_template=unmapped(email_body_template),
                sms_template=unmapped(sms_template),
            )

            # Load pdf documents
            pnos_to_distribute, distribution_needed = load_pno_pdf_documents(
                rendered_pnos
            )

            with case(distribution_needed, True):
                # Distribute PNOs
                pnos_with_addressees = attribute_addressees.map(
                    pnos_to_distribute,
                    unmapped(units_targeting_vessels),
                    unmapped(units_ports_and_segments_subscriptions),
                    control_units_contacts=unmapped(control_units_contacts),
                )

                email = create_email.map(
                    pnos_with_addressees, test_mode=unmapped(test_mode)
                )
                email = filter_results(email)

                sms = create_sms.map(
                    pnos_with_addressees, test_mode=unmapped(test_mode)
                )
                sms = filter_results(sms)

                messages_to_send = flatten([email, sms])

                sent_messages = send_pno_message.map(
                    messages_to_send, is_integration=unmapped(is_integration)
                )
                sent_messages = filter_results(sent_messages)
                loaded_prior_notification_sent_messages = (
                    load_prior_notification_sent_messages(flatten(sent_messages))
                )

                # Perform state changes
                update_logbook_reports_statement = (
                    make_update_logbook_reports_statement(
                        pnos_to_update=pnos_to_distribute,
                        sent_messages=flatten(sent_messages),
                        start_datetime_utc=start_datetime_utc,
                        end_datetime_utc=end_datetime_utc,
                        upstream_tasks=[loaded_prior_notification_sent_messages],
                    )
                )

                update_manual_pnos_statement = (
                    make_manual_prior_notifications_statement(
                        pnos_to_update=pnos_to_distribute,
                        sent_messages=flatten(sent_messages),
                        upstream_tasks=[loaded_prior_notification_sent_messages],
                    )
                )

                updated_logbook_reports_statement = execute_statement(
                    update_logbook_reports_statement
                )
                updated_manual_pnos_statement = execute_statement(
                    update_manual_pnos_statement
                )


flow.set_reference_tasks(
    [
        pnos_to_generate,
        pnos_to_distribute,
        pnos_with_addressees,
        loaded_prior_notification_sent_messages,
        updated_logbook_reports_statement,
        updated_manual_pnos_statement,
    ]
)

flow.file_name = Path(__file__).name
