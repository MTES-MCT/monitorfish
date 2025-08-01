from datetime import datetime, timedelta
from typing import List, Tuple

import pandas as pd
from geoalchemy2.functions import ST_Intersects
from prefect import flow, task
from sqlalchemy import Table, and_, or_, select
from sqlalchemy.sql import Select

from src.entities.alerts import (
    AdminAreasSpecification,
    AdminAreasSpecWithTable,
    AdministrativeAreaType,
    AreasTableMetadata,
    GearSpecification,
    RegulatoryAreaSpecification,
    SpeciesSpecification,
)
from src.generic_tasks import extract, read_query_task
from src.processing import join_on_multiple_keys
from src.shared_tasks.alerts import (
    extract_silenced_alerts,
    filter_alerts,
    load_alerts,
    make_alerts,
)
from src.shared_tasks.infrastructure import get_table
from src.shared_tasks.positions import add_depth, add_vessel_identifier
from src.shared_tasks.risk_factors import extract_current_risk_factors
from src.shared_tasks.vessels import add_vessel_id, add_vessels_columns


@task
def to_admin_areas_table_metadata(
    admin_area_spec: AdminAreasSpecification,
) -> AreasTableMetadata:
    area_tables_metadata = {
        AdministrativeAreaType.FAO_AREA: AreasTableMetadata(
            table_name="fao_areas",
            geometry_column="wkb_geometry",
            filter_column="f_code",
        ),
        AdministrativeAreaType.EEZ_AREA: AreasTableMetadata(
            table_name="eez_areas",
            geometry_column="wkb_geometry",
            filter_column="iso_sov1",
        ),
        AdministrativeAreaType.NEAFC_AREA: AreasTableMetadata(
            table_name="neafc_regulatory_area",
            geometry_column="wkb_geometry",
            filter_column="ogc_fid",
        ),
        AdministrativeAreaType.DISTANCE_TO_SHORE: AreasTableMetadata(
            table_name="n_miles_to_shore_areas_subdivided",
            geometry_column="geometry",
            filter_column="miles_to_shore",
        ),
    }

    return area_tables_metadata[admin_area_spec.area_type]


@task
def to_admin_areas_spec_with_table(
    spec: AdminAreasSpecification, table_metadata: AreasTableMetadata, table: Table
) -> AdminAreasSpecWithTable:
    return AdminAreasSpecWithTable(
        area_type=spec.area_type,
        areas=spec.areas,
        metadata=table_metadata,
        table=table,
    )


#     alert_type_zones_tables = {
#         AlertType.THREE_MILES_TRAWLING_ALERT: {
#             "table": "n_miles_to_shore_areas_subdivided",
#             "filter_column": "miles_to_shore",
#             "geometry_column": "geometry",
#         },
#         AlertType.TWELVE_MILES_FISHING_ALERT: {
#             "table": "n_miles_to_shore_areas_subdivided",
#             "filter_column": "miles_to_shore",
#             "geometry_column": "geometry",
#         },
#         AlertType.FRENCH_EEZ_FISHING_ALERT: {
#             "table": "eez_areas",
#             "filter_column": "iso_sov1",
#             "geometry_column": "wkb_geometry",
#         },
#         AlertType.RTC_FISHING_ALERT: {
#             "table": "regulations",
#             "filter_column": "law_type",
#             "geometry_column": "geometry",
#         },
#         AlertType.NEAFC_FISHING_ALERT: {
#             "table": "neafc_regulatory_area",
#             "filter_column": None,
#             "geometry_column": "wkb_geometry",
#         },
#         AlertType.BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT: {
#             "table": "regulations",
#             "filter_column": "topic",
#             "geometry_column": "geometry",
#         },
#         AlertType.BOTTOM_GEAR_VME_FISHING_ALERT: {
#             "table": "regulations",
#             "filter_column": "topic",
#             "geometry_column": "geometry",
#         },
#         AlertType.BOTTOM_TRAWL_800_METERS_FISHING_ALERT: {
#             "table": "regulations",
#             "filter_column": "zone",
#             "geometry_column": "geometry",
#         },
#     }


def to_regulatory_area_filter(
    spec: RegulatoryAreaSpecification, regulations_table: Table
):
    filters = []
    if spec.law_type:
        filters.append(regulations_table.c.law_type == spec.law_type)
    if spec.topic:
        filters.append(regulations_table.c.topic == spec.topic)
    if spec.zone:
        filters.append(regulations_table.c.zone == spec.zone)

    if len(filters) == 0:
        raise ValueError("Cannot set regulatory area filter without any criterion")

    return and_(*filters)


@task
def make_vessels_query(
    vessels_table: Table,
    producer_organization_memberships_table: Table | None,
    vessel_ids: list | None,
    district_codes: list | None,
    producer_organizations: list | None,
) -> Select:
    from_table = vessels_table

    filter_conditions = []

    if vessel_ids:
        filter_conditions.append(vessels_table.c.id.in_(vessel_ids))

    if district_codes:
        filter_conditions.append(vessels_table.c.district_code.in_(district_codes))

    if producer_organizations:
        assert isinstance(producer_organization_memberships_table, Table)
        from_table = from_table.join(
            producer_organization_memberships_table,
            from_table.c.cfr
            == producer_organization_memberships_table.c.internal_reference_number,
        )
        filter_conditions.append(
            producer_organization_memberships_table.c.organization_name.in_(
                producer_organizations
            )
        )

    return (
        select(
            vessels_table.c.id,
            vessels_table.c.cfr,
            vessels_table.c.external_immatriculation,
            vessels_table.c.ircs,
        )
        .select_from(from_table)
        .where(and_(*filter_conditions))
    )


@task
def get_sets_of_identifiers(vessels: pd.DataFrame) -> Tuple[set, set, set]:
    cfrs = set(vessels.cfr.dropna())
    external_immatriculations = set(
        vessels.loc[
            (vessels.cfr.isna())
            & (vessels.external_immatriculation.notnull())
            & (vessels.external_immatriculation != "-"),
            "external_immatriculation",
        ]
    )
    ircss = set(
        vessels.loc[
            (vessels.cfr.isna())
            & (
                (vessels.external_immatriculation.isna())
                | (vessels.external_immatriculation == "-")
            )
            & (vessels.ircs.notnull()),
            "ircs",
        ]
    )

    return (
        cfrs,
        external_immatriculations,
        ircss,
    )


@task
def merge_sets_of_identifiers(
    cfrs_with_species_min_weight: set | None,
    cfrs_with_gears: set | None,
    vessels_cfrs: set | None,
    vessels_external_immats: set | None,
    vessels_ircss: set | None,
) -> Tuple[set | None, set | None, set | None]:
    external_immats = vessels_external_immats
    ircss = vessels_ircss

    # When a species or a gear condition is given, fitlering on an identifier other
    # than CFR is excluded.
    if cfrs_with_species_min_weight is not None or cfrs_with_gears is not None:
        external_immats = None
        ircss = None

    cfr_sets = []
    if vessels_cfrs is not None:
        cfr_sets.append(vessels_cfrs)

    if cfrs_with_species_min_weight:
        cfr_sets.append(cfrs_with_species_min_weight)

    if cfrs_with_gears:
        cfr_sets.append(cfrs_with_gears)

    cfrs = set.intersection(*cfr_sets)

    return cfrs, external_immats, ircss


@task
def make_positions_in_alert_query(
    *,
    positions_table: Table,
    facades_table: Table,
    regulations_table: Table | None = None,
    only_fishing_positions: bool = True,
    hours_from_now: float = 12.0,
    flag_states_iso2: List[str] | None = None,
    regulatory_areas: List[RegulatoryAreaSpecification] | None = None,
    admin_areas_specs_with_tables: List[AdminAreasSpecWithTable] | None = None,
    cfrs: set | None = None,
    external_immats: set | None = None,
    ircss: set | None = None,
) -> Select:
    """
    Creates select statement for the query to execute to compute positions in alert.

    Args:
        positions_table (Table): `SQLAlchemy.Table` of positions.
        facades_table (Table): `SQLAlchemy.Table` of façades.
        regulations_table (Table): `SQLAlchemy.Table` of regulations.
        only_fishing_positions (bool): If `True`, filters positions to keep only
          positions tagged as `is_fishing`.
        hours_from_now (int, optional): Determines how many hours back in the past the
          `positions` table will be scanned. Defaults to 8.
        flag_states_iso2 (List, optional): If given, filters positions to keep only
          those of vessels that belong to these flag_states. Defaults to None.
        regulatory_areas (List[RegulatoryAreaSpecification] | None): List of regulatary
          areas of the alerts, defaults to `None`.
        admin_areas_specs_with_tables (List[AdminAreasSpecWithTable] | None): List of
          administrative area specifications of the alert, defaults to `None`.

    Returns:
        Select: `SQLAlchemy.Select` statement corresponding to the given parameters.
    """

    now = datetime.utcnow()
    start_date = now - timedelta(hours=hours_from_now)

    from_tables = positions_table.join(
        facades_table,
        ST_Intersects(positions_table.c.geometry, facades_table.c.geometry),
        isouter=True,
    )

    filter_conditions = [
        positions_table.c.date_time > start_date,
        positions_table.c.date_time < now,
        or_(
            positions_table.c.internal_reference_number.isnot(None),
            positions_table.c.external_reference_number.isnot(None),
            positions_table.c.ircs.isnot(None),
        ),
    ]

    if regulatory_areas:
        from_tables = from_tables.join(
            regulations_table,
            ST_Intersects(
                positions_table.c.geometry,
                regulations_table.c[regulations_table.geometry],
            ),
        )
        regulatory_area_specs = [to_regulatory_area_filter(a) for a in regulatory_areas]
        filter_conditions.append(or_(*regulatory_area_specs))

    if admin_areas_specs_with_tables:
        for admin_areas_spec_with_table in admin_areas_specs_with_tables:
            admin_areas_table = admin_areas_spec_with_table.table
            geom_column = admin_areas_spec_with_table.metadata.geometry_column
            filter_column = admin_areas_spec_with_table.metadata.filter_column

            from_tables = from_tables.join(
                admin_areas_table,
                ST_Intersects(
                    positions_table.c.geometry, admin_areas_table.c.get(geom_column)
                ),
            )

            filter_conditions.append(
                admin_areas_table.c.get(filter_column).in_(
                    admin_areas_spec_with_table.areas
                )
            )

    if cfrs is not None or external_immats is not None or ircss is not None:
        vessel_filters = []
        if cfrs is not None:
            vessel_filters.append(positions_table.c.cfr.in_(cfrs))
        if external_immats is not None:
            vessel_filters.append(
                and_(
                    positions_table.c.cfr is None,
                    positions_table.c.external_immatriculation.in_(external_immats),
                )
            )
        if ircss is not None:
            vessel_filters.append(
                and_(positions_table.c.cfr is None, positions_table.c.ircs.in_(ircss))
            )
        filter_conditions.append(or_(*vessel_filters))

    q = (
        select(
            positions_table.c.id,
            positions_table.c.internal_reference_number.label("cfr"),
            positions_table.c.external_reference_number.label(
                "external_immatriculation"
            ),
            positions_table.c.ircs,
            positions_table.c.vessel_name,
            positions_table.c.flag_state,
            positions_table.c.date_time,
            positions_table.c.latitude,
            positions_table.c.longitude,
            facades_table.c.facade,
        )
        .select_from(from_tables)
        .where(and_(*filter_conditions))
    )

    if only_fishing_positions:
        q = q.where(positions_table.c.is_fishing)

    if flag_states_iso2:
        q = q.where(positions_table.c.flag_state.in_(flag_states_iso2))

    return q


@task
def extract_vessels_current_gears() -> pd.DataFrame:
    """
    Extracts vessels with their current gear(s) from current_segment if available,
    from vessel profiles' recent_gears if not.
    """

    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/current_gears.sql",
    )


@task
def extract_vessels_with_species_onboard(
    species_spec: List[SpeciesSpecification],
) -> pd.DataFrame:
    return extract(
        "monitorfish_remote",
        "monitorfish/vessels_species_onboard.sql",
        params={
            "species_onboard": tuple([s.species for s in species_spec]),
        },
    )


@task
def get_vessels_with_species_min_weight(
    vessels_species: pd.DataFrame, species_spec: List[SpeciesSpecification]
) -> set:
    species_min_weight_dict = (
        pd.DataFrame(species_spec).groupby("species")["min_weight"].min().to_dict()
    )
    return set(
        vessels_species.assign(
            min_weight=lambda x: x.species.map(species_min_weight_dict)
        )
        .query("weight >= min_weight")
        .cfr
    )


@task
def get_vessels_with_gears(
    vessels_gears: pd.DataFrame, gears: List[GearSpecification]
) -> set:
    vessels_gears = vessels_gears.copy(deep=True)
    gears_min_mesh = pd.DataFrame(gears).set_index("gear")["min_mesh"].to_dict()
    gears_max_mesh = pd.DataFrame(gears).set_index("gear")["max_mesh"].to_dict()
    vessels_gears["min_mesh"] = vessels_gears.gear.map(gears_min_mesh)
    vessels_gears["max_mesh"] = vessels_gears.gear.map(gears_max_mesh)

    return set(
        vessels_gears[
            (vessels_gears.gear.isin(gears_max_mesh))
            & (
                (vessels_gears.mesh >= vessels_gears.min_mesh)
                | vessels_gears.min_mesh.isna()
            )
            & (
                (vessels_gears.mesh <= vessels_gears.max_mesh)
                | vessels_gears.max_mesh.isna()
            )
        ].cfr
    )


@task
def filter_on_depth(positions_in_alert: pd.DataFrame, min_depth: float) -> pd.DataFrame:
    # Positions depth is assumed to be negative below sea level.
    # Deeper = more negative.
    return positions_in_alert[positions_in_alert.depth <= -min_depth]


@task
def merge_risk_factor(
    positions_in_alert: pd.DataFrame, current_risk_factors: pd.DataFrame
) -> pd.DataFrame:
    return join_on_multiple_keys(
        positions_in_alert,
        current_risk_factors,
        how="left",
        or_join_keys=["cfr", "external_immatriculation", "ircs"],
    )


@task
def get_vessels_in_alert(positions_in_alert: pd.DataFrame) -> pd.DataFrame:
    """
    Returns a `DataFrame` of unique vessels in alert from the input `DataFrame` of
    positions in alert.
    For each vessel, the date of the most recent position is used as
    `creation_datetime` for the alert.
    """
    vessels_in_alerts = (
        positions_in_alert.sort_values("date_time", ascending=False)
        .groupby(["cfr", "ircs", "external_immatriculation"], dropna=False)
        .head(1)
        .rename(
            columns={
                "date_time": "triggering_behaviour_datetime_utc",
            }
        )
        .reset_index(drop=True)
    )
    return vessels_in_alerts


@flow(name="Position alert")
def position_alert_flow(
    name: str,
    position_alert_id: int,
    description: str,
    natinf_code: int,
    only_fishing_positions: bool = True,
    gears: List[GearSpecification] | None = None,
    species: List[SpeciesSpecification] | None = None,
    administrative_areas: List[AdminAreasSpecification] | None = None,
    regulatory_areas: List[RegulatoryAreaSpecification] | None = None,
    min_depth: float | None = None,
    flag_states_iso2: List[str] | None = None,
    vessel_ids: List[int] | None = None,
    district_codes: List[str] | None = None,
    producer_organizations: List[str] | None = None,
    hours_from_now: float = 12.0,
):
    administrative_areas_table_metadatas = to_admin_areas_table_metadata.map(
        administrative_areas
    )
    table_names = [t.table_name for t in administrative_areas_table_metadatas]
    administrative_areas_tables = get_table.map(table_names)

    positions_table = get_table.submit("positions")
    vessels_table = get_table.submit("vessels")
    districts_table = get_table.submit("districts")
    facades_table = get_table.submit("facade_areas_subdivided")

    admin_areas_specs_with_tables = to_admin_areas_spec_with_table.map(
        spec=administrative_areas,
        table_metadata=administrative_areas_table_metadatas,
        table=administrative_areas_tables,
    )

    if regulatory_areas:
        regulations_table = get_table.submit("regulations")
    else:
        regulations_table = None

    if species:
        vessels_species = extract_vessels_with_species_onboard.submit(species)
        cfrs_with_species_min_weight = get_vessels_with_species_min_weight.submit(
            vessels_species=vessels_species, species_spec=species
        )
    else:
        cfrs_with_species_min_weight = None

    if gears:
        vessels_current_gears = extract_vessels_current_gears.submit()
        cfrs_with_gears = get_vessels_with_gears.submit(vessels_current_gears, gears)
    else:
        cfrs_with_gears = None

    if vessel_ids or district_codes or producer_organizations:
        if producer_organizations:
            producer_organization_memberships_table = get_table(
                "producer_organization_memberships"
            )
        else:
            producer_organization_memberships_table = None
        vessels_query = make_vessels_query(
            vessels_table,
            producer_organization_memberships_table,
            vessel_ids,
            district_codes,
            producer_organizations,
        )
        vessels = read_query_task("monitorfish_remote", vessels_query)
        (
            vessels_cfrs,
            vessels_external_immats,
            vessels_ircss,
        ) = get_sets_of_identifiers(vessels)

    else:
        vessels_cfrs = None
        vessels_external_immats = None
        vessels_ircss = None

    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight,
        cfrs_with_gears,
        vessels_cfrs,
        vessels_external_immats,
        vessels_ircss,
    )

    positions_query = make_positions_in_alert_query(
        positions_table=positions_table,
        facades_table=facades_table,
        regulations_table=regulations_table,
        only_fishing_positions=only_fishing_positions,
        hours_from_now=hours_from_now,
        flag_states=flag_states_iso2,
        regulatory_areas=regulatory_areas,
        admin_areas_specs_with_tables=admin_areas_specs_with_tables,
        cfrs=cfrs,
        external_immats=external_immats,
        ircss=ircss,
    )

    positions_in_alert = read_query_task("monitorfish_remote", positions_query)

    if min_depth:
        positions_in_alert = add_depth(positions_in_alert)
        positions_in_alert = filter_on_depth(positions_in_alert, min_depth)

    positions_in_alert = add_vessel_identifier(positions_in_alert)
    current_risk_factors = extract_current_risk_factors.submit()
    positions_in_alert = merge_risk_factor(positions_in_alert, current_risk_factors)
    vessels_in_alert = get_vessels_in_alert(positions_in_alert)
    vessels_in_alert = add_vessel_id(vessels_in_alert, vessels_table)
    vessels_in_alert = add_vessels_columns(
        vessels_in_alert,
        vessels_table,
        districts_table=districts_table,
        districts_columns_to_add=["dml"],
    )
    alerts = make_alerts(
        vessels_in_alert,
        alert_type="POSITION_ALERT",
        alert_id=position_alert_id,
        name=name,
        description=description,
        natinf_code=natinf_code,
    )
    silenced_alerts = extract_silenced_alerts.submit(
        alert_type="POSITION_ALERT",
        number_of_hours=hours_from_now,
        alert_id=position_alert_id,
    )
    alert_without_silenced = filter_alerts(alerts, silenced_alerts)
    load_alerts(alert_without_silenced, f"POSITION_ALERT/{position_alert_id}")
