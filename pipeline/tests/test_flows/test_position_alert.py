from datetime import datetime, timedelta
from typing import List
from unittest.mock import patch

import pandas as pd
import pytest
import pytz
from geoalchemy2 import Geometry
from pytest import fixture
from sqlalchemy import (
    BOOLEAN,
    FLOAT,
    TIMESTAMP,
    VARCHAR,
    Column,
    Integer,
    MetaData,
    Table,
    text,
)

from src.db_config import create_engine
from src.entities.alerts import (
    AdminAreasSpecification,
    AdminAreasSpecWithTable,
    AdministrativeAreaType,
    AreasTableMetadata,
    GearSpecification,
    RegulatoryAreaSpecification,
    SpeciesSpecification,
)
from src.flows.position_alert import (
    extract_vessels_current_gears,
    extract_vessels_with_species_onboard,
    get_sets_of_identifiers,
    get_vessels_in_alert,
    get_vessels_with_gears,
    get_vessels_with_species_min_weight,
    make_positions_in_alert_query,
    make_vessels_query,
    merge_sets_of_identifiers,
    position_alert_flow,
    to_admin_areas_spec_with_table,
    to_admin_areas_table_metadata,
    to_regulatory_area_filter,
)
from src.read_query import read_query
from tests.mocks import mock_get_depth


@fixture
def admin_area_specifications() -> List[AdminAreasSpecification]:
    return [
        AdminAreasSpecification(
            areaType=AdministrativeAreaType.FAO_AREA,
            areas=["27.7", "27.8.a"],
        ),
        AdminAreasSpecification(
            areaType=AdministrativeAreaType.EEZ_AREA,
            areas=["FR", "BE"],
        ),
        AdminAreasSpecification(
            areaType=AdministrativeAreaType.DISTANCE_TO_SHORE,
            areas=["3-6", "0-3"],
        ),
        AdminAreasSpecification(
            areaType=AdministrativeAreaType.NEAFC_AREA,
            areas=[1],
        ),
    ]


@fixture
def admin_areas_table_metadata() -> List[AreasTableMetadata]:
    return [
        AreasTableMetadata(
            table_name="fao_areas",
            geometry_column="wkb_geometry",
            filter_column="f_code",
        ),
        AreasTableMetadata(
            table_name="eez_areas",
            geometry_column="wkb_geometry",
            filter_column="iso_sov1",
        ),
        AreasTableMetadata(
            table_name="n_miles_to_shore_areas_subdivided",
            geometry_column="geometry",
            filter_column="miles_to_shore",
        ),
        AreasTableMetadata(
            table_name="neafc_regulatory_area",
            geometry_column="wkb_geometry",
            filter_column="ogc_fid",
        ),
    ]


@fixture
def regulations_table() -> Table:
    return Table(
        "regulations",
        MetaData(),
        Column("law_type", VARCHAR),
        Column("topic", VARCHAR),
        Column("zone", VARCHAR),
        schema="public",
    )


@fixture
def admin_areas_tables() -> List[Table]:
    return [
        Table(
            "fao_areas",
            MetaData(),
            Column("wkb_geometry", Geometry),
            Column("f_code", VARCHAR),
            schema="public",
        ),
        Table(
            "eez_areas",
            MetaData(),
            Column("wkb_geometry", Geometry),
            Column("iso_sov1", VARCHAR),
            schema="public",
        ),
        Table(
            "n_miles_to_shore_areas_subdivided",
            MetaData(),
            Column("miles_to_shore", VARCHAR),
            Column("geometry", Geometry),
            schema="public",
        ),
        Table(
            "neafc_regulatory_area",
            MetaData(),
            Column("ogc_fid", Integer),
            Column("wkb_geometry", Geometry),
            schema="public",
        ),
    ]


@fixture
def vessels_table() -> Table:
    return Table(
        "vessels",
        MetaData(),
        Column("id", Integer),
        Column("cfr", VARCHAR),
        Column("external_immatriculation", VARCHAR),
        Column("ircs", VARCHAR),
        Column("district_code", VARCHAR),
        schema="public",
    )


@fixture
def prod_org_memberships_table() -> Table:
    return Table(
        "producer_organization_memberships",
        MetaData(),
        Column("internal_reference_number", VARCHAR),
        Column("organization_name", VARCHAR),
        schema="public",
    )


@fixture
def admin_areas_specs_with_tables(
    admin_area_specifications, admin_areas_table_metadata, admin_areas_tables
) -> List[AdminAreasSpecWithTable]:
    return [
        AdminAreasSpecWithTable(
            area_type=s.areaType, areas=s.areas, metadata=m, table=t
        )
        for (s, m, t) in zip(
            admin_area_specifications, admin_areas_table_metadata, admin_areas_tables
        )
    ]


@fixture
def vessels_current_gears() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"cfr": "ABC000145907", "gear": "PS1", "mesh": 80.0},
            {"cfr": "ABC000306959", "gear": "OTM", "mesh": 80.0},
            {"cfr": "ABC000542519", "gear": "OTB", "mesh": 80.0},
            {"cfr": "CFR_OF_LOGBK", "gear": "OTM", "mesh": 80.0},
            {"cfr": "DEF000115851", "gear": "OTB", "mesh": 80.0},
            {"cfr": "DEF000155891", "gear": "FPO", "mesh": 80.0},
            {"cfr": "DEF000155891", "gear": "GTR", "mesh": 80.0},
            {"cfr": "OLD_VESSEL_1", "gear": "PTB", "mesh": 65.0},
            {"cfr": "UNKONWN_VESS", "gear": "OTM", "mesh": 100.0},
        ]
    )


@fixture
def species_specs() -> List[SpeciesSpecification]:
    return [
        SpeciesSpecification(species="SOL", minWeight=2500),
        SpeciesSpecification(species="HKE"),
        SpeciesSpecification(species="ANE", minWeight=None),
    ]


@fixture
def vessels_with_species_onboard() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"cfr": "ABC000306959", "species": "HKE", "weight": 713.0},
            {"cfr": "ABC000542519", "species": "HKE", "weight": 2426.0},
            {"cfr": "ABC000542519", "species": "SOL", "weight": 157.0},
            {"cfr": "CFR_OF_LOGBK", "species": "HKE", "weight": 713.0},
            {"cfr": "OLD_VESSEL_1", "species": "ANE", "weight": 213.0},
        ]
    )


@fixture
def vessels_with_species_min_weight() -> pd.DataFrame:
    return pd.DataFrame()


def test_to_admin_areas_table_metadata(
    admin_area_specifications, admin_areas_table_metadata
):
    res = [to_admin_areas_table_metadata(spec) for spec in admin_area_specifications]
    assert res == admin_areas_table_metadata


def test_to_admin_areas_spec_with_table(
    admin_area_specifications,
    admin_areas_tables,
    admin_areas_table_metadata,
    admin_areas_specs_with_tables,
):
    res = [
        to_admin_areas_spec_with_table(s, m, t)
        for s, m, t in zip(
            admin_area_specifications, admin_areas_table_metadata, admin_areas_tables
        )
    ]
    assert res == admin_areas_specs_with_tables


def test_to_regulatory_area_filter(regulations_table):
    spec = RegulatoryAreaSpecification(lawType="law_type_1", topic=None, zone=None)
    filter_condition = to_regulatory_area_filter(spec, regulations_table)
    filter_str = str(filter_condition.compile(compile_kwargs={"literal_binds": True}))
    assert filter_str == "public.regulations.law_type = 'law_type_1'"

    spec = RegulatoryAreaSpecification(lawType=None, topic="topic_1", zone=None)
    filter_condition = to_regulatory_area_filter(spec, regulations_table)
    filter_str = str(filter_condition.compile(compile_kwargs={"literal_binds": True}))
    assert filter_str == "public.regulations.topic = 'topic_1'"

    spec = RegulatoryAreaSpecification(lawType=None, topic=None, zone="zone_1")
    filter_condition = to_regulatory_area_filter(spec, regulations_table)
    filter_str = str(filter_condition.compile(compile_kwargs={"literal_binds": True}))
    assert filter_str == "public.regulations.zone = 'zone_1'"

    spec = RegulatoryAreaSpecification(
        lawType="law_type_1", topic="topic_1", zone="zone_1"
    )
    filter_condition = to_regulatory_area_filter(spec, regulations_table)
    filter_str = str(filter_condition.compile(compile_kwargs={"literal_binds": True}))
    assert filter_str == (
        "public.regulations.law_type = 'law_type_1' AND "
        "public.regulations.topic = 'topic_1' AND "
        "public.regulations.zone = 'zone_1'"
    )

    spec = RegulatoryAreaSpecification(lawType="", topic="topic_1", zone=None)
    filter_condition = to_regulatory_area_filter(spec, regulations_table)
    filter_str = str(filter_condition.compile(compile_kwargs={"literal_binds": True}))
    assert filter_str == "public.regulations.topic = 'topic_1'"

    spec = RegulatoryAreaSpecification(lawType=None, topic=None, zone=None)
    with pytest.raises(
        ValueError, match="Cannot set regulatory area filter without any criterion"
    ):
        to_regulatory_area_filter(spec, regulations_table)

    spec = RegulatoryAreaSpecification(lawType=None, topic=None, zone="")
    with pytest.raises(
        ValueError, match="Cannot set regulatory area filter without any criterion"
    ):
        to_regulatory_area_filter(spec, regulations_table)


def test_make_vessels_query(vessels_table, prod_org_memberships_table):
    # Test with all parameters
    select_statement = make_vessels_query(
        vessels_table=vessels_table,
        prod_org_memberships_table=prod_org_memberships_table,
        vessel_ids=[1, 2],
        district_codes=["AA", "BB"],
        producer_organizations=["Org1", "Org2"],
    )
    query = str(select_statement.compile(compile_kwargs={"literal_binds": True}))

    expected_query = (
        "SELECT public.vessels.id, "
        "public.vessels.cfr, "
        "public.vessels.external_immatriculation, "
        "public.vessels.ircs "
        "\nFROM public.vessels "
        "JOIN public.producer_organization_memberships "
        "ON public.vessels.cfr = "
        "public.producer_organization_memberships.internal_reference_number "
        "\nWHERE public.vessels.id IN (1, 2) AND "
        "public.vessels.district_code IN ('AA', 'BB') AND "
        "public.producer_organization_memberships.organization_name "
        "IN ('Org1', 'Org2')"
    )

    assert query == expected_query

    # Test with minimal parameters
    select_statement = make_vessels_query(
        vessels_table=vessels_table,
        prod_org_memberships_table=None,
        vessel_ids=None,
        district_codes=None,
        producer_organizations=None,
    )
    query = str(select_statement.compile(compile_kwargs={"literal_binds": True}))

    expected_query = (
        "SELECT public.vessels.id, "
        "public.vessels.cfr, "
        "public.vessels.external_immatriculation, "
        "public.vessels.ircs "
        "\nFROM public.vessels"
    )

    assert query == expected_query


def test_get_sets_of_identifiers():
    vessels = pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6],
            "cfr": ["CFR1", "CFR2", None, None, None, None],
            "external_immatriculation": ["EXT1", "EXT2", "EXT3", "-", None, None],
            "ircs": ["IRCS1", "IRCS2", "IRCS3", "IRCS4", "IRCS5", None],
        }
    )

    cfrs, external_immats, ircss = get_sets_of_identifiers(vessels)

    assert cfrs == {"CFR1", "CFR2"}
    assert external_immats == {"EXT3"}
    assert ircss == {"IRCS4", "IRCS5"}

    cfrs, external_immats, ircss = get_sets_of_identifiers(vessels.head(0))

    assert cfrs == set()
    assert external_immats == set()
    assert ircss == set()


def test_merge_sets_of_identifiers():
    vessels_cfrs = {"CFR1", "CFR2", "CFR3"}
    vessels_external_immats = {"EXT1", "EXT2"}
    vessels_ircss = {"IRCS1", "IRCS2"}
    cfrs_with_species = {"CFR1", "CFR2"}
    cfrs_with_gears = {"CFR2", "CFR3", "CFR4"}

    # Test when no species or gear conditions are given
    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight=None,
        cfrs_with_gears=None,
        vessels_cfrs=vessels_cfrs,
        vessels_external_immats=vessels_external_immats,
        vessels_ircss=vessels_ircss,
    )
    assert cfrs == vessels_cfrs
    assert external_immats == vessels_external_immats
    assert ircss == vessels_ircss

    # Test when with species condition
    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight=cfrs_with_species,
        cfrs_with_gears=None,
        vessels_cfrs=vessels_cfrs,
        vessels_external_immats=vessels_external_immats,
        vessels_ircss=vessels_ircss,
    )
    assert cfrs == {"CFR1", "CFR2"}
    assert external_immats is None
    assert ircss is None

    # Test when with gear condition
    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight=None,
        cfrs_with_gears=cfrs_with_gears,
        vessels_cfrs=vessels_cfrs,
        vessels_external_immats=vessels_external_immats,
        vessels_ircss=vessels_ircss,
    )
    assert cfrs == {"CFR2", "CFR3"}
    assert external_immats is None
    assert ircss is None

    # Test when with both species and gear conditions
    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight=cfrs_with_species,
        cfrs_with_gears=cfrs_with_gears,
        vessels_cfrs=vessels_cfrs,
        vessels_external_immats=vessels_external_immats,
        vessels_ircss=vessels_ircss,
    )
    assert cfrs == {"CFR2"}
    assert external_immats is None
    assert ircss is None

    # Test when with both species and gear conditions and empty intersection
    vessels_cfrs = {"CFR1", "CFR2"}
    cfrs_with_species = {"CFR3", "CFR4"}

    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight=cfrs_with_species,
        cfrs_with_gears=None,
        vessels_cfrs=vessels_cfrs,
        vessels_external_immats={"EXT1"},
        vessels_ircss={"IRCS1"},
    )

    assert cfrs == set()
    assert external_immats is None
    assert ircss is None

    # Test when all parameters are None.
    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight=None,
        cfrs_with_gears=None,
        vessels_cfrs=None,
        vessels_external_immats=None,
        vessels_ircss=None,
    )

    assert cfrs is None
    assert external_immats is None
    assert ircss is None

    # Test when all parameters are empty sets
    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight=set(),
        cfrs_with_gears=set(),
        vessels_cfrs=set(),
        vessels_external_immats=set(),
        vessels_ircss=set(),
    )

    assert cfrs == set()
    assert external_immats is None
    assert ircss is None

    # Test when all parameters are mixed None and empty sets
    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight=set(),
        cfrs_with_gears=None,
        vessels_cfrs=None,
        vessels_external_immats=None,
        vessels_ircss={"IRCS1"},
    )

    assert cfrs == set()
    assert external_immats is None
    assert ircss is None

    # Condition on species excludes ircs and external_immat
    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight={"CFR1"},
        cfrs_with_gears=None,
        vessels_cfrs=None,
        vessels_external_immats={"EXT1", "EXT2"},
        vessels_ircss={"IRCS1", "IRCS2"},
    )

    assert cfrs == {"CFR1"}
    assert external_immats is None
    assert ircss is None

    # Condition on gears excludes ircs and external_immat
    cfrs, external_immats, ircss = merge_sets_of_identifiers(
        cfrs_with_species_min_weight=None,
        cfrs_with_gears={"CFR1"},
        vessels_cfrs=None,
        vessels_external_immats={"EXT1", "EXT2"},
        vessels_ircss={"IRCS1", "IRCS2"},
    )

    assert cfrs == {"CFR1"}
    assert external_immats is None
    assert ircss is None


def test_make_positions_in_alert_query(admin_areas_specs_with_tables):
    meta = MetaData()
    positions_table = Table(
        "positions",
        meta,
        Column("id", Integer),
        Column("internal_reference_number", VARCHAR),
        Column("external_reference_number", VARCHAR),
        Column("ircs", VARCHAR),
        Column("vessel_name", VARCHAR),
        Column("flag_state", VARCHAR),
        Column("date_time", TIMESTAMP),
        Column("latitude", FLOAT),
        Column("longitude", FLOAT),
        Column("is_fishing", BOOLEAN),
        Column("geometry", Geometry),
    )

    facades_table = Table(
        "facades", meta, Column("facade", VARCHAR), Column("geometry", Geometry)
    )

    regulations_table = Table(
        "regulations",
        meta,
        Column("geometry", Geometry),
        Column("law_type", VARCHAR),
        Column("topic", VARCHAR),
        Column("zone", VARCHAR),
    )
    # Test make_positions_in_alert_query with all arguments

    only_fishing_positions = True
    track_analysis_depth = 6
    now = datetime(2024, 5, 2, 12, 30, 0)
    flag_states_iso2 = ["NL, DE"]

    regulatory_areas = [
        RegulatoryAreaSpecification(
            lawType="law_type_1",
            topic="topic_1",
            zone="zone_1",
        ),
        RegulatoryAreaSpecification(
            lawType="law_type_2",
        ),
        RegulatoryAreaSpecification(
            topic="topic_3",
        ),
        RegulatoryAreaSpecification(
            zone="zone_4",
        ),
    ]

    cfrs = {"cfr_1", "cfr_2"}
    external_immats = {"external_immat_1", "external_immat_2"}
    ircss = {"ircs_1", "ircs_2"}

    select_statement = make_positions_in_alert_query(
        positions_table=positions_table,
        facades_table=facades_table,
        track_analysis_depth=track_analysis_depth,
        now=now,
        regulations_table=regulations_table,
        only_fishing_positions=only_fishing_positions,
        flag_states_iso2=flag_states_iso2,
        regulatory_areas=regulatory_areas,
        admin_areas_specs_with_tables=admin_areas_specs_with_tables,
        cfrs=cfrs,
        external_immats=external_immats,
        ircss=ircss,
    )

    query = str(select_statement.compile(compile_kwargs={"literal_binds": True}))

    expected_query = (
        "SELECT "
        "positions.id, positions.internal_reference_number AS cfr, "
        "positions.external_reference_number AS external_immatriculation, "
        "positions.ircs, "
        "positions.vessel_name, "
        "positions.flag_state, "
        "positions.date_time, "
        "positions.latitude, "
        "positions.longitude, "
        "facades.facade "
        "\nFROM positions "
        "LEFT OUTER JOIN facades "
        "ON ST_Intersects(positions.geometry, facades.geometry) "
        "JOIN regulations "
        "ON ST_Intersects(positions.geometry, regulations.geometry) "
        "JOIN public.fao_areas "
        "ON ST_Intersects(positions.geometry, public.fao_areas.wkb_geometry) "
        "JOIN public.eez_areas "
        "ON ST_Intersects(positions.geometry, public.eez_areas.wkb_geometry) "
        "JOIN public.n_miles_to_shore_areas_subdivided "
        "ON ST_Intersects(positions.geometry, public.n_miles_to_shore_areas_subdivided.geometry) "
        "JOIN public.neafc_regulatory_area "
        "ON ST_Intersects(positions.geometry, public.neafc_regulatory_area.wkb_geometry) "
        "\nWHERE "
        "positions.date_time > '2024-05-02 06:30:00' AND "
        "positions.date_time < '2024-05-02 12:30:00' AND "
        "(positions.internal_reference_number IS NOT NULL OR "
        "positions.external_reference_number IS NOT NULL OR "
        "positions.ircs IS NOT NULL"
        ") AND "
        "("
        "regulations.law_type = 'law_type_1' AND "
        "regulations.topic = 'topic_1' AND "
        "regulations.zone = 'zone_1' OR "
        "regulations.law_type = 'law_type_2' OR "
        "regulations.topic = 'topic_3' OR "
        "regulations.zone = 'zone_4'"
        ") AND "
        "public.fao_areas.f_code IN ('27.7', '27.8.a') AND "
        "public.eez_areas.iso_sov1 IN ('FR', 'BE') AND "
        "public.n_miles_to_shore_areas_subdivided.miles_to_shore IN ('3-6', '0-3') AND "
        "public.neafc_regulatory_area.ogc_fid IN (1) AND "
        "("
        "positions.internal_reference_number IN ('cfr_1', 'cfr_2') OR "
        "positions.internal_reference_number IS NULL AND "
        "positions.external_reference_number IN "
        "('external_immat_1', 'external_immat_2') OR "
        "positions.internal_reference_number IS NULL AND "
        "positions.ircs IN ('ircs_1', 'ircs_2')"
        ") AND "
        "positions.is_fishing AND "
        "positions.flag_state IN ('NL, DE')"
    )

    assert query == expected_query

    # Test make_positions_in_alert_query with required arguments only

    only_fishing_positions = False

    select_statement = make_positions_in_alert_query(
        positions_table=positions_table,
        facades_table=facades_table,
        track_analysis_depth=track_analysis_depth,
        now=now,
    )

    query = str(select_statement.compile(compile_kwargs={"literal_binds": True}))

    expected_query = (
        "SELECT "
        "positions.id, "
        "positions.internal_reference_number AS cfr, "
        "positions.external_reference_number AS external_immatriculation, "
        "positions.ircs, "
        "positions.vessel_name, "
        "positions.flag_state, "
        "positions.date_time, "
        "positions.latitude, "
        "positions.longitude, "
        "facades.facade "
        "\nFROM positions "
        "LEFT OUTER JOIN facades "
        "ON ST_Intersects(positions.geometry, facades.geometry) "
        "\nWHERE positions.date_time > '2024-05-02 06:30:00' "
        "AND positions.date_time < '2024-05-02 12:30:00' "
        "AND ("
        "positions.internal_reference_number IS NOT NULL OR "
        "positions.external_reference_number IS NOT NULL OR "
        "positions.ircs IS NOT NULL) "
        "AND positions.is_fishing"
    )

    assert query == expected_query


def test_extract_vessels_current_gears(reset_test_data, vessels_current_gears):
    res = extract_vessels_current_gears().sort_values("cfr").reset_index(drop=True)
    pd.testing.assert_frame_equal(res, vessels_current_gears)


def test_extract_vessels_with_species_onboard(
    reset_test_data, species_specs, vessels_with_species_onboard
):
    res = (
        extract_vessels_with_species_onboard(species_specs)
        .sort_values(["cfr", "species"])
        .reset_index(drop=True)
    )
    pd.testing.assert_frame_equal(res, vessels_with_species_onboard)

    res = (
        extract_vessels_with_species_onboard(
            species_specs, species_catch_areas=["27.7", "27.8.c"]
        )
        .sort_values(["cfr", "species"])
        .reset_index(drop=True)
    )
    pd.testing.assert_frame_equal(
        res,
        (
            vessels_with_species_onboard[
                vessels_with_species_onboard.cfr.isin(["ABC000542519", "OLD_VESSEL_1"])
            ].reset_index(drop=True)
        ),
    )


def test_get_vessels_with_species_min_weight():
    vessels_species = pd.DataFrame(
        {
            "cfr": [
                "VESSEL_1",
                "VESSEL_1",
                "VESSEL_1",
                "VESSEL_2",
                "VESSEL_2",
                "VESSEL_3",
            ],
            "species": ["SP1", "SP2", "SP3", "SP2", "SP4", "SP4"],
            "weight": [120.0, 125.5, 560.0, 50.5, 96.2, 696.2],
        }
    )

    species_spec = [
        SpeciesSpecification(species="SP1", minWeight=500.0),
        SpeciesSpecification(species="SP2", minWeight=50.0),
        SpeciesSpecification(species="SP3", minWeight=500.0),
        SpeciesSpecification(species="SP4", minWeight=500.0),
    ]

    cfrs = get_vessels_with_species_min_weight(
        vessels_species=vessels_species, species_spec=species_spec
    )
    assert cfrs == {"VESSEL_1", "VESSEL_2", "VESSEL_3"}

    species_spec = [
        SpeciesSpecification(species="SP1", minWeight=500.0),
        SpeciesSpecification(species="SP2", minWeight=100.0),
        SpeciesSpecification(species="SP3", minWeight=500.0),
        SpeciesSpecification(species="SP4", minWeight=500.0),
    ]

    cfrs = get_vessels_with_species_min_weight(
        vessels_species=vessels_species, species_spec=species_spec
    )
    assert cfrs == {"VESSEL_1", "VESSEL_3"}

    species_spec = [
        SpeciesSpecification(species="SP1", minWeight=1000.0),
        SpeciesSpecification(species="SP2", minWeight=1000.0),
        SpeciesSpecification(species="SP3", minWeight=1000.0),
        SpeciesSpecification(species="SP4", minWeight=500.0),
    ]
    cfrs = get_vessels_with_species_min_weight(
        vessels_species=vessels_species, species_spec=species_spec
    )
    assert cfrs == {"VESSEL_3"}

    species_spec = [
        SpeciesSpecification(species="SP1"),
        SpeciesSpecification(species="SP2", minWeight=1000.0),
        SpeciesSpecification(species="SP3", minWeight=1000.0),
        SpeciesSpecification(species="SP4", minWeight=500.0),
    ]
    cfrs = get_vessels_with_species_min_weight(
        vessels_species=vessels_species, species_spec=species_spec
    )
    assert cfrs == {"VESSEL_1", "VESSEL_3"}


def test_get_vessels_with_gears():
    vessels_gears = pd.DataFrame(
        {
            "cfr": [
                "VESSEL1",
                "VESSEL1",
                "VESSEL2",
                "VESSEL3",
                "VESSEL4",
                "VESSEL5",
                "VESSEL6",
                "VESSEL7",
                "VESSEL8",
            ],
            "gear": ["OTM", "OTB", "OTB", "OTB", "OTT", "OTT", "OTT", "LSS", "LHP"],
            "mesh": [110.0, 110.0, 110.0, 80.0, 110.0, 80.0, None, None, None],
        }
    )
    gears = [
        GearSpecification(gear="OTM", minMesh=80.0, maxMesh=120.0),
        GearSpecification(gear="OTB", minMesh=100.0),
        GearSpecification(gear="OTT", maxMesh=100.0),
        GearSpecification(gear="LSS"),
    ]
    res = get_vessels_with_gears(vessels_gears=vessels_gears, gears=gears)
    assert res == {"VESSEL1", "VESSEL2", "VESSEL5", "VESSEL7"}

    # Test with no mesh constraint
    gears = [
        GearSpecification(gear="OTM"),
        GearSpecification(gear="OTB"),
        GearSpecification(gear="OTT"),
        GearSpecification(gear="LSS"),
    ]
    res = get_vessels_with_gears(vessels_gears=vessels_gears, gears=gears)
    assert res == {
        "VESSEL1",
        "VESSEL2",
        "VESSEL3",
        "VESSEL4",
        "VESSEL5",
        "VESSEL6",
        "VESSEL7",
    }

    # Test with no mesh info
    vessels_gears = pd.DataFrame(
        {
            "cfr": [
                "VESSEL6",
                "VESSEL7",
                "VESSEL8",
            ],
            "gear": ["OTT", "LSS", "LHP"],
            "mesh": [None, None, None],
        }
    )
    gears = [
        GearSpecification(gear="OTM", minMesh=80.0, maxMesh=120.0),
        GearSpecification(gear="OTB", minMesh=100.0),
        GearSpecification(gear="OTT", maxMesh=100.0),
        GearSpecification(gear="LSS"),
    ]
    res = get_vessels_with_gears(vessels_gears=vessels_gears, gears=gears)
    assert res == {"VESSEL7"}

    gears = [
        GearSpecification(gear="OTM", minMesh=80.0, maxMesh=120.0),
        GearSpecification(gear="OTB", minMesh=100.0),
        GearSpecification(gear="OTT", maxMesh=100.0),
        GearSpecification(gear="DRB"),
    ]
    res = get_vessels_with_gears(vessels_gears=vessels_gears, gears=gears)
    assert res == set()


def test_get_vessels_in_alert():
    now = datetime(2020, 1, 1, 0, 0, 0)
    td = timedelta(hours=1)

    positions_in_alert = pd.DataFrame(
        {
            "cfr": ["A", "A", "A", "B", "A", "B", "A"],
            "external_immatriculation": ["AA", "AA", "AA", "BB", "AA", "BB", "AA"],
            "ircs": ["AAA", "AAA", "AAA", "BBB", "AAA", "BBB", "AAA"],
            "vessel_identifier": ["INTERNAL_REFERENCE_NUMBER"] * 7,
            "vessel_name": ["v_A", "v_A", "v_A", "v_B", "v_A", "v_B", "v_A"],
            "flag_state": ["FR", "FR", "FR", "FR", "FR", "FR", "FR"],
            "facade": ["NAMO", "NAMO", "NAMO", "MEMN", "NAMO", "MEMN", "NAMO"],
            "risk_factor": [1.23, 1.23, 1.23, None, 1.23, None, 1.23],
            "date_time": [
                now - 4 * td,
                now - 3 * td,
                now - 2 * td,
                now - 1.5 * td,
                now - td,
                now - 0.5 * td,
                now,
            ],
            "latitude": [-5.23, -4.23, -3.23, -50.23, -2.23, -51.23, -1.23],
            "longitude": [43.25, 42.25, 41.25, -43.25, 40.25, -42.25, 39.25],
        }
    )

    vessels_in_alert = get_vessels_in_alert(positions_in_alert)

    expected_vessels_in_alert = pd.DataFrame(
        {
            "cfr": ["A", "B"],
            "external_immatriculation": ["AA", "BB"],
            "ircs": ["AAA", "BBB"],
            "vessel_name": ["v_A", "v_B"],
            "flag_state": ["FR", "FR"],
            "facade": ["NAMO", "MEMN"],
            "risk_factor": [1.23, None],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "triggering_behaviour_datetime_utc": [now, now - 0.5 * td],
            "latitude": [-1.23, -51.23],
            "longitude": [39.25, -42.25],
        }
    )
    pd.testing.assert_frame_equal(
        vessels_in_alert, expected_vessels_in_alert, check_like=True
    )


def test_flow_deletes_existing_pending_alerts_of_matching_type_and_alert_id(
    reset_test_data,
):
    # With these parameters, no alert should be raised.
    position_alert_id_in_table = 1
    position_alert_id_not_in_table = 2
    track_analysis_depth = 8
    natinf_code = 5826
    only_fishing_positions = True
    gears = [GearSpecification(gear="LLS")]
    species = None
    species_catch_areas = None
    administrative_areas = [
        AdminAreasSpecification(
            areaType=AdministrativeAreaType.DISTANCE_TO_SHORE, areas=["0-3"]
        )
    ]
    regulatory_areas = None
    min_depth = None
    flag_states_iso2 = None
    vessel_ids = None
    district_codes = None
    producer_organizations = None

    state = position_alert_flow(
        position_alert_id=position_alert_id_not_in_table,
        name="Alerte alerte c'est l'alerte",
        description="Alerte générale !!",
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        gears=gears,
        species=species,
        species_catch_areas=species_catch_areas,
        administrative_areas=administrative_areas,
        regulatory_areas=regulatory_areas,
        min_depth=min_depth,
        flag_states_iso2=flag_states_iso2,
        vessel_ids=vessel_ids,
        district_codes=district_codes,
        producer_organizations=producer_organizations,
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query(
        "SELECT COUNT(*) FROM pending_alerts", db="monitorfish_remote"
    )

    # The alert in the table should still be there
    assert pending_alerts.iloc[0, 0] == 1

    state = position_alert_flow(
        position_alert_id=position_alert_id_in_table,
        name="Alerte alerte c'est l'alerte",
        description="Alerte générale !!",
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        gears=gears,
        species=species,
        species_catch_areas=species_catch_areas,
        administrative_areas=administrative_areas,
        regulatory_areas=regulatory_areas,
        min_depth=min_depth,
        flag_states_iso2=flag_states_iso2,
        vessel_ids=vessel_ids,
        district_codes=district_codes,
        producer_organizations=producer_organizations,
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query(
        "SELECT COUNT(*) FROM pending_alerts",
        db="monitorfish_remote",
    )

    # The alert in the table should be removed
    assert pending_alerts.iloc[0, 0] == 0


def test_flow_inserts_new_pending_alerts(reset_test_data):
    # We delete the silenced alerts first
    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        connection.execute(text("DELETE FROM silenced_alerts;"))

    now = pytz.utc.localize(datetime.utcnow())

    track_analysis_depth = 48
    only_fishing_positions = False
    name = "Chalutage dans les 3 milles"
    description = "Description de l'alerte Chalutage dans les 3 milles"
    natinf_code = 7059

    state = position_alert_flow(
        position_alert_id=1,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        administrative_areas=[
            AdminAreasSpecification(areaType="DISTANCE_TO_SHORE", areas=["0-3", "3-6"]),
        ],
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "PLACE SPECTACLE SUBIR",
                "ÉTABLIR IMPRESSION LORSQUE",
                "DEVINER FIGURE CONSCIENCE",
                "MYNAMEIS",
            ],
            "internal_reference_number": [
                "ABC000055481",
                "ABC000306959",
                "ABC000542519",
                "ABC000658985",
            ],
            "external_reference_number": [
                "AS761555",
                "RV348407",
                "RO237719",
                "OHMYGOSH",
            ],
            "ircs": [
                "IL2468",
                "LLUK",
                "FQ7058",
                "OGMJ",
            ],
            "creation_date": [
                now,
                now,
                now,
                now,
            ],
            "trip_number": [None, None, None, None],
            "value": [
                {
                    "dml": "DML 29",
                    "name": name,
                    "description": description,
                    "natinfCode": natinf_code,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "type": "POSITION_ALERT",
                    "alertId": 1,
                    "seaFront": None,
                    "riskFactor": 1.74110112659225003,
                },
                {
                    "dml": "DML 29",
                    "name": name,
                    "description": description,
                    "natinfCode": natinf_code,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "type": "POSITION_ALERT",
                    "alertId": 1,
                    "seaFront": "SA",
                    "riskFactor": None,
                },
                {
                    "dml": "DML 29",
                    "name": name,
                    "description": description,
                    "natinfCode": natinf_code,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "type": "POSITION_ALERT",
                    "alertId": 1,
                    "seaFront": "NAMO",
                    "riskFactor": 1.41421356237310003,
                },
                {
                    "dml": None,
                    "name": name,
                    "description": description,
                    "natinfCode": natinf_code,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "type": "POSITION_ALERT",
                    "alertId": 1,
                    "seaFront": "SA",
                    "riskFactor": None,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "alert_config_name": ["POSITION_ALERT/1"] * 4,
            "vessel_id": [3, 1, 2, None],
            "latitude": [53.435, 49.606, 43.324, 49.606],
            "longitude": [5.553, -0.736, 5.359, -0.736],
            "flag_state": [
                "NL",
                "FR",
                "FR",
                "FR",
            ],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_inserts_new_pending_alerts_without_silenced_alerts(reset_test_data):
    now = pytz.utc.localize(datetime.utcnow())

    alert_id = 1
    alert_config_name = f"POSITION_ALERT/{alert_id}"
    track_analysis_depth = 48
    only_fishing_positions = False
    name = "Chalutage dans les 3 milles"
    description = "Description de l'alerte Chalutage dans les 3 milles"
    natinf_code = 7059

    state = position_alert_flow(
        position_alert_id=1,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        administrative_areas=[
            AdminAreasSpecification(areaType="DISTANCE_TO_SHORE", areas=["0-3", "3-6"]),
        ],
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "PLACE SPECTACLE SUBIR",
                "ÉTABLIR IMPRESSION LORSQUE",
                "DEVINER FIGURE CONSCIENCE",
            ],
            "internal_reference_number": [
                "ABC000055481",
                "ABC000306959",
                "ABC000542519",
            ],
            "external_reference_number": [
                "AS761555",
                "RV348407",
                "RO237719",
            ],
            "ircs": [
                "IL2468",
                "LLUK",
                "FQ7058",
            ],
            "creation_date": [
                now,
                now,
                now,
            ],
            "trip_number": [None, None, None],
            "value": [
                {
                    "dml": "DML 29",
                    "type": "POSITION_ALERT",
                    "alertId": alert_id,
                    "natinfCode": natinf_code,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "name": name,
                    "description": description,
                    "seaFront": None,
                    "riskFactor": 1.74110112659225003,
                },
                {
                    "dml": "DML 29",
                    "type": "POSITION_ALERT",
                    "alertId": alert_id,
                    "natinfCode": natinf_code,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "name": name,
                    "description": description,
                    "seaFront": "SA",
                    "riskFactor": None,
                },
                {
                    "dml": "DML 29",
                    "type": "POSITION_ALERT",
                    "alertId": alert_id,
                    "natinfCode": natinf_code,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "name": name,
                    "description": description,
                    "seaFront": "NAMO",
                    "riskFactor": 1.41421356237310003,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "alert_config_name": [alert_config_name] * 3,
            "vessel_id": [3, 1, 2],
            "latitude": [53.435, 49.606, 43.324],
            "longitude": [5.553, -0.736, 5.359],
            "flag_state": ["NL", "FR", "FR"],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_filters_on_gears(reset_test_data):
    now = pytz.utc.localize(datetime.utcnow())

    alert_id = 1
    alert_config_name = f"POSITION_ALERT/{alert_id}"
    track_analysis_depth = 48
    only_fishing_positions = False
    name = "Chalutage dans les 3 milles"
    description = "Description de l'alerte Chalutage dans les 3 milles"
    gears = [
        GearSpecification(gear="OTM"),
        GearSpecification(gear="OTB"),
        GearSpecification(gear="OTT"),
    ]
    natinf_code = 7059

    state = position_alert_flow(
        position_alert_id=1,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        administrative_areas=[
            AdminAreasSpecification(areaType="DISTANCE_TO_SHORE", areas=["0-3", "3-6"]),
        ],
        gears=gears,
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": ["ÉTABLIR IMPRESSION LORSQUE", "DEVINER FIGURE CONSCIENCE"],
            "internal_reference_number": ["ABC000306959", "ABC000542519"],
            "external_reference_number": ["RV348407", "RO237719"],
            "ircs": ["LLUK", "FQ7058"],
            "creation_date": [now, now],
            "trip_number": [None, None],
            "value": [
                {
                    "dml": "DML 29",
                    "name": "Chalutage dans les 3 milles",
                    "type": "POSITION_ALERT",
                    "alertId": 1,
                    "seaFront": "SA",
                    "natinfCode": 7059,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "riskFactor": None,
                    "description": "Description de l'alerte Chalutage dans les 3 milles",
                },
                {
                    "dml": "DML 29",
                    "name": "Chalutage dans les 3 milles",
                    "type": "POSITION_ALERT",
                    "alertId": 1,
                    "seaFront": "NAMO",
                    "natinfCode": 7059,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "riskFactor": 1.4142135624,
                    "description": "Description de l'alerte Chalutage dans les 3 milles",
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "alert_config_name": [alert_config_name, alert_config_name],
            "vessel_id": [1, 2],
            "latitude": [49.606, 43.324],
            "longitude": [-0.736, 5.359],
            "flag_state": ["FR", "FR"],
        }
    )
    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_filters_on_time(reset_test_data):
    now = pytz.utc.localize(datetime.utcnow())

    alert_id = 1
    alert_config_name = f"POSITION_ALERT/{alert_id}"
    track_analysis_depth = 8
    only_fishing_positions = False
    name = "Chalutage dans les 3 milles"
    description = "Description de l'alerte Chalutage dans les 3 milles"
    gears = None
    natinf_code = 7059

    state = position_alert_flow(
        position_alert_id=1,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        administrative_areas=[
            AdminAreasSpecification(areaType="DISTANCE_TO_SHORE", areas=["0-3", "3-6"]),
        ],
        gears=gears,
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "ÉTABLIR IMPRESSION LORSQUE",
                "DEVINER FIGURE CONSCIENCE",
            ],
            "internal_reference_number": [
                "ABC000306959",
                "ABC000542519",
            ],
            "external_reference_number": [
                "RV348407",
                "RO237719",
            ],
            "ircs": [
                "LLUK",
                "FQ7058",
            ],
            "creation_date": [
                now,
                now,
            ],
            "trip_number": [None, None],
            "value": [
                {
                    "name": "Chalutage dans les 3 milles",
                    "type": "POSITION_ALERT",
                    "alertId": 1,
                    "natinfCode": 7059,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "description": "Description de l'alerte Chalutage dans les 3 milles",
                    "dml": "DML 29",
                    "seaFront": "SA",
                    "riskFactor": None,
                },
                {
                    "name": "Chalutage dans les 3 milles",
                    "type": "POSITION_ALERT",
                    "alertId": 1,
                    "natinfCode": 7059,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "description": "Description de l'alerte Chalutage dans les 3 milles",
                    "dml": "DML 29",
                    "seaFront": "NAMO",
                    "riskFactor": 1.41421356237310003,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "alert_config_name": [alert_config_name] * 2,
            "vessel_id": [1, 2],
            "latitude": [49.606, 43.324],
            "longitude": [-0.736, 5.359],
            "flag_state": ["FR", "FR"],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_filters_on_flag_states(reset_test_data):
    now = pytz.utc.localize(datetime.utcnow())

    alert_id = 1
    alert_config_name = f"POSITION_ALERT/{alert_id}"
    track_analysis_depth = 48
    only_fishing_positions = False
    name = "Chalutage dans les 3 milles"
    description = "Description de l'alerte Chalutage dans les 3 milles"
    gears = None
    natinf_code = 7059
    flag_states_iso2 = ["NL"]

    state = position_alert_flow(
        position_alert_id=1,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        administrative_areas=[
            AdminAreasSpecification(areaType="DISTANCE_TO_SHORE", areas=["0-3", "3-6"]),
        ],
        gears=gears,
        flag_states_iso2=flag_states_iso2,
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "PLACE SPECTACLE SUBIR",
            ],
            "internal_reference_number": [
                "ABC000055481",
            ],
            "external_reference_number": [
                "AS761555",
            ],
            "ircs": [
                "IL2468",
            ],
            "creation_date": [
                now,
            ],
            "trip_number": [None],
            "value": [
                {
                    "dml": "DML 29",
                    "type": "POSITION_ALERT",
                    "seaFront": None,
                    "riskFactor": 1.74110112659225003,
                    "name": "Chalutage dans les 3 milles",
                    "alertId": 1,
                    "natinfCode": 7059,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "description": "Description de l'alerte Chalutage dans les 3 milles",
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "alert_config_name": [alert_config_name],
            "vessel_id": [3],
            "latitude": [53.435],
            "longitude": [5.553],
            "flag_state": ["NL"],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


@patch("src.shared_tasks.positions.get_depth", mock_get_depth)
def test_flow_filters_on_depth(reset_test_data):
    # We delete the silenced alerts first
    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        connection.execute(text("DELETE FROM silenced_alerts;"))

    now = pytz.utc.localize(datetime.utcnow())
    alert_id = 1
    alert_config_name = f"POSITION_ALERT/{alert_id}"
    track_analysis_depth = 48
    only_fishing_positions = False
    name = "Chalutage dans les 3 milles"
    description = "Description de l'alerte Chalutage dans les 3 milles"
    natinf_code = 7059
    min_depth = 0.5

    state = position_alert_flow(
        position_alert_id=1,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        administrative_areas=[
            AdminAreasSpecification(areaType="DISTANCE_TO_SHORE", areas=["0-3", "3-6"]),
        ],
        min_depth=min_depth,
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "ÉTABLIR IMPRESSION LORSQUE",
                "MYNAMEIS",
            ],
            "internal_reference_number": [
                "ABC000306959",
                "ABC000658985",
            ],
            "external_reference_number": [
                "RV348407",
                "OHMYGOSH",
            ],
            "ircs": [
                "LLUK",
                "OGMJ",
            ],
            "creation_date": [
                now,
                now,
            ],
            "trip_number": [None, None],
            "value": [
                {
                    "dml": "DML 29",
                    "type": "POSITION_ALERT",
                    "seaFront": "SA",
                    "riskFactor": None,
                    "depth": -0.736,
                    "name": "Chalutage dans les 3 milles",
                    "alertId": 1,
                    "natinfCode": 7059,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "description": "Description de l'alerte Chalutage dans les 3 milles",
                },
                {
                    "dml": None,
                    "type": "POSITION_ALERT",
                    "seaFront": "SA",
                    "riskFactor": None,
                    "depth": -0.736,
                    "name": "Chalutage dans les 3 milles",
                    "alertId": 1,
                    "natinfCode": 7059,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "description": "Description de l'alerte Chalutage dans les 3 milles",
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "alert_config_name": [alert_config_name] * 2,
            "vessel_id": [1, None],
            "latitude": [49.606, 49.606],
            "longitude": [-0.736, -0.736],
            "flag_state": [
                "FR",
                "FR",
            ],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_filters_on_eez_area(reset_test_data):
    alert_id = 1
    alert_config_name = f"POSITION_ALERT/{alert_id}"
    track_analysis_depth = 8
    only_fishing_positions = False
    name = "Pêche en ZEE française"
    description = "Description de l'alerte Pêche en ZEE française"
    natinf_code = 9999

    state = position_alert_flow(
        position_alert_id=1,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        administrative_areas=[
            AdminAreasSpecification(areaType="EEZ_AREA", areas=["FRA"]),
        ],
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "DEVINER FIGURE CONSCIENCE",
            ],
            "internal_reference_number": [
                "ABC000542519",
            ],
            "external_reference_number": [
                "RO237719",
            ],
            "ircs": [
                "FQ7058",
            ],
            "trip_number": [None],
            "value": [
                {
                    "dml": "DML 29",
                    "type": "POSITION_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.4142135624,
                    "name": "Pêche en ZEE française",
                    "alertId": 1,
                    "natinfCode": 9999,
                    "threat": "some threat",
                    "threatCharacterization": "some threat_characterization",
                    "description": "Description de l'alerte Pêche en ZEE française",
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "alert_config_name": [alert_config_name],
            "vessel_id": [2],
            "latitude": [43.324],
            "longitude": [5.359],
            "flag_state": ["FR"],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id").reset_index(drop=True),
    )


def test_flow_filters_on_regulatory_areas(reset_test_data):
    alert_id = 2
    alert_config_name = f"POSITION_ALERT/{alert_id}"
    track_analysis_depth = 8
    only_fishing_positions = True
    name = "Pêche en zone RTC"
    description = "Description de l'alerte Pêche en zone RTC"
    natinf_code = 9999

    state = position_alert_flow(
        position_alert_id=alert_id,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        regulatory_areas=[
            RegulatoryAreaSpecification(lawType="Reg. RTC"),
        ],
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query(
        f"""
            SELECT *
            FROM pending_alerts
            WHERE alert_config_name = '{alert_config_name}'
        """,
        db="monitorfish_remote",
    )
    assert len(pending_alerts) == 1
    assert (
        pending_alerts.loc[
            pending_alerts.alert_config_name == alert_config_name,
            "internal_reference_number",
        ].values[0]
        == "ABC000306959"
    )


def test_flow_filters_on_neafc_area(reset_test_data):
    alert_id = 2
    alert_config_name = f"POSITION_ALERT/{alert_id}"
    track_analysis_depth = 8
    only_fishing_positions = True
    name = "Pêche en zone RTC"
    description = "Description de l'alerte Pêche en zone RTC"
    natinf_code = 9999

    state = position_alert_flow(
        position_alert_id=alert_id,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        administrative_areas=[
            AdminAreasSpecification(areaType="NEAFC_AREA", areas=[1, 2])
        ],
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query(
        f"""
            SELECT *
            FROM pending_alerts
            WHERE alert_config_name = '{alert_config_name}'
        """,
        db="monitorfish_remote",
    )
    assert len(pending_alerts) == 1
    assert (
        pending_alerts.loc[
            pending_alerts.alert_config_name == alert_config_name,
            "internal_reference_number",
        ].values[0]
        == "ABC000306959"
    )


def test_flow_filters_on_species_and_catch_areas(reset_test_data):
    alert_id = 3
    alert_config_name = f"POSITION_ALERT/{alert_id}"
    track_analysis_depth = 48
    only_fishing_positions = False
    species = [
        SpeciesSpecification(species="HKE", minWeight=100.0),
    ]
    name = "Pêche avec espèces sensibles en zone interdite"
    description = (
        "Description de l'alerte Pêche avec espèces sensibles en zone interdite"
    )
    natinf_code = 9999

    state = position_alert_flow(
        position_alert_id=alert_id,
        name=name,
        description=description,
        natinf_code=natinf_code,
        threat="some threat",
        threat_characterization="some threat_characterization",
        track_analysis_depth=track_analysis_depth,
        only_fishing_positions=only_fishing_positions,
        species=species,
        species_catch_areas=["27.8.c"],
        return_state=True,
    )

    assert state.is_completed()

    pending_alerts = read_query(
        f"""
            SELECT *
            FROM pending_alerts
            WHERE alert_config_name = '{alert_config_name}'
        """,
        db="monitorfish_remote",
    )
    assert len(pending_alerts) == 1
    assert pending_alerts["internal_reference_number"].values[0] == "ABC000542519"
