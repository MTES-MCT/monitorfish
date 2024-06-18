import dataclasses
import os
from datetime import datetime
from pathlib import Path
from typing import List

import numpy as np
import pandas as pd
import prefect
import requests
import weasyprint
from jinja2 import Environment, FileSystemLoader, Template, select_autoescape
from prefect import Flow, Parameter, case, task, unmapped
from prefect.executors import LocalDaskExecutor

from config import (
    CNSP_LOGO_PATH,
    EMAIL_FONTS_LOCATION,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
    MONITORENV_API_ENDPOINT,
    SE_MER_LOGO_PATH,
    STATE_FLAGS_ICONS_LOCATION,
    default_risk_factors,
)
from src.pipeline.entities.fleet_segments import FishingGear, FleetSegment
from src.pipeline.entities.missions import Infraction
from src.pipeline.entities.pnos import (
    PnoCatch,
    PnoToRender,
    PreRenderedPno,
    RenderedPno,
    ReturnToPortPurpose,
)
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.emails import resize_pdf_to_A4
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.dates import get_utcnow, make_timedelta


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
) -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pnos_to_generate.sql",
        params={
            "start_datetime_utc": start_datetime_utc,
            "end_datetime_utc": end_datetime_utc,
        },
    )


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

    email_contacts = (
        contacts[["control_unit_id", "email"]]
        .dropna()
        .groupby("control_unit_id")["email"]
        .unique()
        .map(sorted)
        .reset_index()
    )

    return email_contacts


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
        operation_number=pno.operation_number,
        operation_datetime_utc=pno.operation_datetime_utc,
        operation_type=pno.operation_type,
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
def get_template() -> Template:
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
def render_pno(pno: PreRenderedPno, template: Template) -> RenderedPno:
    fonts_directory = EMAIL_FONTS_LOCATION.as_uri()
    cnsp_logo_src = CNSP_LOGO_PATH.as_uri()
    se_mer_logo_src = SE_MER_LOGO_PATH.as_uri()
    state_flags_icons = os.listdir(STATE_FLAGS_ICONS_LOCATION)
    if f"{pno.flag_state}.png" in state_flags_icons:
        state_flag_icon_src = (
            STATE_FLAGS_ICONS_LOCATION / Path(f"{pno.flag_state}.png")
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

    html = template.render(
        fonts_directory=fonts_directory,
        cnsp_logo_src=cnsp_logo_src,
        se_mer_logo_src=se_mer_logo_src,
        state_flag_icon_src=state_flag_icon_src,
        operation_datetime_utc=format_nullable_datetime(pno.operation_datetime_utc),
        operation_type=pno.operation_type,
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
            [f"{g.name} ({g.code}) - Maillage {g.mesh} mm" for g in pno.trip_gears]
        ),
        trip_segments="<br>".join([f"{s.code} - {s.name}" for s in pno.trip_segments]),
        pno_types=", ".join(pno.pno_types),
        vessel_length=pno.vessel_length,
        mmsi=pno.mmsi,
        risk_factor=f"{pno.risk_factor:.1f}",
        risk_factor_description=risk_factor_description,
        risk_factor_color=risk_factor_color,
        last_control_datetime_utc=format_nullable_datetime(
            pno.last_control_datetime_utc
        ),
        last_control_logbook_infractions=pno.last_control_logbook_infractions,
        last_control_gear_infractions=pno.last_control_gear_infractions,
        last_control_species_infractions=pno.last_control_species_infractions,
        last_control_other_infractions=pno.last_control_other_infractions,
    )

    return RenderedPno(
        report_id=pno.report_id,
        vessel_id=pno.vessel_id,
        cfr=pno.cfr,
        is_verified=pno.is_verified,
        is_being_sent=pno.is_being_sent,
        trip_segments=pno.trip_segments,
        port_locode=pno.port_locode,
        source=pno.source,
        html_for_pdf=html,
    )


@task(checkpoint=False)
def print_html_to_pdf(html_document: RenderedPno) -> RenderedPno:
    pdf = weasyprint.HTML(string=html_document.html_for_pdf).write_pdf(
        optimize_size=("fonts", "images")
    )
    pdf = resize_pdf_to_A4(pdf)
    return RenderedPno(
        report_id=html_document.report_id,
        vessel_id=html_document.vessel_id,
        cfr=html_document.cfr,
        is_verified=html_document.is_verified,
        is_being_sent=html_document.is_being_sent,
        trip_segments=html_document.trip_segments,
        port_locode=html_document.port_locode,
        source=html_document.source,
        generation_datetime_utc=datetime.utcnow(),
        pdf_document=pdf,
    )


@task(checkpoint=False)
def load_pno_pdf_documents(
    pno_pdf_documents: List[RenderedPno],
) -> List[RenderedPno]:
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

    return [
        dataclasses.replace(d) for d in pno_pdf_documents if d.is_being_sent == True
    ]


@task(checkpoint=False)
def attribute_addressees(
    pno_to_distribute: RenderedPno,
    units_targeting_vessels: pd.DataFrame,
    units_ports_and_segments_subscriptions: pd.DataFrame,
) -> RenderedPno:
    """
    Returns a copy of the input `RenderedPno`'s with its `control_unit_ids`
    attribute updated. The control units ids attributed to the PNO are :

      - ids of control units who target the vessel
      - ids of control units who subscribed to the port with the "receive all pnos"
        option
      - Plus :
        - ids of control units who subscribed to the port, if the PNO is in
          verification scope
        - ids of control units who subscribed to the port AND to a segment of the PNO
          if the PNO is not in verification scope

    Args:
        pno_to_distribute (RenderedPno): RenderedPno
        units_targeting_vessels (pd.DataFrame): DataFrame with columns
          `control_unit_ids_targeting_vessel` and `vessel_id`
        units_ports_and_segments_subscriptions (pd.DataFrame): DataFrame with columns
          `control_unit_id`, `port_locode`, `receive_all_pnos_from_port`, and
          `unit_subscribed_segments`

    Returns:
        RenderedPno: copy of the input `pno_to_distribute` with its
          `control_unit_ids` attribute updated
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

    return dataclasses.replace(
        pno_to_distribute,
        control_unit_ids=units_subscribed_to_port.union(units_targeting_vessel),
    )


with Flow("Distribute pnos", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        start_hours_ago = Parameter("start_hours_ago")
        end_hours_ago = Parameter("end_hours_ago")
        timedelta_from_start_to_now = make_timedelta(hours=start_hours_ago)
        timedelta_from_end_to_now = make_timedelta(hours=end_hours_ago)
        utcnow = get_utcnow()
        start_datetime_utc = utcnow - timedelta_from_start_to_now
        end_datetime_utc = utcnow - timedelta_from_end_to_now

        species_names = extract_species_names()
        fishing_gear_names = extract_fishing_gear_names()
        template = get_template()
        pnos = extract_pnos_to_generate(
            start_datetime_utc=start_datetime_utc,
            end_datetime_utc=end_datetime_utc,
        )
        units_targeting_vessels = extract_pno_units_targeting_vessels()
        units_ports_and_segments_subscriptions = (
            extract_pno_units_ports_and_segments_subscriptions()
        )

        pnos = to_pnos_to_render(pnos)
        pnos = pre_render_pno.map(
            pnos,
            species_names=unmapped(species_names),
            fishing_gear_names=unmapped(fishing_gear_names),
        )
        html_documents = render_pno.map(pnos, template=unmapped(template))
        pno_pdf_documents = print_html_to_pdf.map(html_documents)
        pnos_to_distribute = load_pno_pdf_documents(pno_pdf_documents)
        pnos_with_unit_ids = attribute_addressees.map(
            pnos_to_distribute,
            unmapped(units_targeting_vessels),
            unmapped(units_ports_and_segments_subscriptions),
        )


flow.file_name = Path(__file__).name
