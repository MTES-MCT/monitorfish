from datetime import datetime
from pathlib import Path
from typing import List

import pandas as pd
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.entities.fleet_segments import FishingGear, FleetSegment
from src.pipeline.entities.pnos import PnoCatch, PnoToRender, PreRenderedPno
from src.pipeline.generic_tasks import extract
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
def extract_pnos_to_distribute(
    start_datetime_utc: datetime, end_datetime_utc: datetime
) -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pnos_to_distribute.sql",
        params={
            "start_datetime_utc": start_datetime_utc,
            "end_datetime_utc": end_datetime_utc,
        },
    )


@task(checkpoint=False)
def to_pnos_to_render(
    pnos: pd.DataFrame, species_names: dict, fishing_gear_names: dict
) -> List[PnoToRender]:
    records = pnos.to_dict(orient="records")
    return [PnoToRender(**record) for record in records]


@task(checkpoint=False)
def pre_render_pno(
    pno: PnoToRender, species_names: dict, fishing_gear_names: dict
) -> PreRenderedPno:
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
        .agg({"weight": sum, "number_of_fish": sum, "statistical_rectangle": "unique"})
        .reset_index()
    )

    def format_list(li: list) -> str:
        li = [x for x in li if x is not None]
        return f"{', '.join(li)}"

    def format_sr_list(sr_list: list) -> str:
        res = format_list(sr_list)
        return f" ({res})" if res else ""

    sum_by_area["area_sr"] = sum_by_area.apply(
        lambda row: f"{row.fao_area}{format_sr_list(row.statistical_rectangle)}", axis=1
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

    sum_by_species["weight"] = sum_by_species.weight.map(lambda x: f"{x} kg")

    sum_by_species = sum_by_species.rename(
        columns={
            "species_name_code": "Espèces",
            "area_sr": "Zones de pêche",
            "weight": "Qtés",
            "number_of_fish": "Nb",
        }
    )

    return PreRenderedPno(
        id=pno.id,
        operation_number=pno.operation_number,
        operation_datetime_utc=pno.operation_datetime_utc,
        operation_type=pno.operation_type,
        report_id=pno.report_id,
        report_datetime_utc=pno.report_datetime_utc,
        cfr=pno.cfr,
        ircs=pno.ircs,
        external_identification=pno.external_identification,
        vessel_name=pno.vessel_name,
        flag_state=pno.flag_state,
        purpose=pno.purpose,
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
        risk_factor=pno.risk_factor,
        last_control_datetime_utc=pno.last_control_datetime_utc,
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
        pnos = extract_pnos_to_distribute(
            start_datetime_utc=start_datetime_utc,
            end_datetime_utc=end_datetime_utc,
        )


flow.file_name = Path(__file__).name
