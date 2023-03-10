import io
import os
from ast import literal_eval
from datetime import date
from pathlib import Path
from time import sleep

import pandas as pd
import prefect
import requests
from prefect import Flow, Parameter, task
from prefect.executors import LocalDaskExecutor

from config import LIBRARY_LOCATION, PORTS_URL, PROXIES
from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.fao_areas import remove_redundant_fao_area_codes
from src.pipeline.helpers.spatial import geocode
from src.pipeline.processing import coalesce
from src.pipeline.utils import psql_insert_copy
from src.read_query import read_query, read_table


# ******************************** Helper functions **********************************
def make_date(date_string: str):
    try:
        yy = int(date_string[:2])
        mm = int(date_string[2:4])
        if yy > 70:
            year = 1900 + yy
        else:
            year = 2000 + yy
        return date(year, mm, 1)
    except TypeError:
        return None


def make_lat_lon(lat_lon: str):
    try:
        assert len(lat_lon) == 12
        lat_degrees = float(lat_lon[:2])
        lat_minutes = float(lat_lon[2:4])
        north_south = lat_lon[4]
        lat_sign = 1 if north_south == "N" else -1

        lon_degrees = float(lat_lon[-6:-3])
        lon_minutes = float(lat_lon[-3 - 1])
        east_west = lat_lon[-1]
        lon_sign = 1 if east_west == "E" else -1

        lat = lat_sign * (lat_degrees + lat_minutes / 60)
        lon = lon_sign * (lon_degrees + lon_minutes / 60)
        return lat, lon
    except TypeError:
        return None
    except AssertionError:
        return None


# ********* Flow to extract data from csv files downloaded on UNECE website ***********
# Source : https://unece.org/trade/cefact/codes-trade


@task(checkpoint=False)
def extract_unece_locations(csv_directory_path):
    csv_files = os.listdir(csv_directory_path)
    csv_filepaths = [
        os.path.join(csv_directory_path, csv_file)
        for csv_file in csv_files
        if csv_file[-4:] == ".csv"
    ]

    res = []

    for csv_filepath in csv_filepaths:
        res.append(
            pd.read_csv(csv_filepath, encoding="latin1", header=None, dtype={8: str})
        )

    locations = pd.concat(res).reset_index().drop(columns=["index"])

    location_columns = [
        "change_indicator",
        "country_code_iso2",
        "location_code",
        "port_name",
        "name_without_diacritics",
        "region",
        "function",
        "status",
        "relevant_date_yymm",
        "iata_code",
        "lat_lon",
        "comments",
    ]

    locations.columns = location_columns
    return locations


@task(checkpoint=False)
def clean_unece(locations):
    # Remove duplicate locodes by taking only the most recent one
    locations["relevant_date_yymm"] = locations.relevant_date_yymm.map(make_date)
    index_cols = ["country_code_iso2", "location_code"]
    locations = (
        locations.sort_values("relevant_date_yymm", ascending=False)
        .groupby(index_cols)
        .head(1)
        .sort_index()
    )

    locations["locode"] = locations["country_code_iso2"] + locations["location_code"]

    locations = locations.dropna(subset=["locode"])

    # Extract latitude longitude from string value like "9060N 18060W"
    positions = locations.apply(
        lambda row: pd.Series(
            make_lat_lon(row.lat_lon), index=["latitude", "longitude"], dtype=object
        ),
        result_type="expand",
        axis=1,
    )

    locations = locations.join(positions)

    keep_cols = [
        "country_code_iso2",
        "region",
        "locode",
        "port_name",
        "latitude",
        "longitude",
    ]

    locations = locations[keep_cols]
    return locations


@task(checkpoint=False)
def load_unece(locations):
    engine = create_engine("monitorfish_remote")
    locations.to_sql(
        "unece_port_codes",
        engine,
        schema="external",
        if_exists="replace",
        index=False,
    )


with Flow("Create UNECE ports codes table") as flow_make_unece_ports:
    csv_directory_path = Parameter("csv_directory_path")
    locations = extract_unece_locations(csv_directory_path)
    locations = clean_unece(locations)
    load_unece(locations)


# ** Flow to extract data from csv file downloaded from CIRCABC Master Data Register **


@task(checkpoint=False)
def extract_circabc_locations(csv_filepath):
    locations = pd.read_csv(csv_filepath, encoding="utf-8", header=[0])

    return locations


@task(checkpoint=False)
def clean_circabc(locations):
    # Extract latitude longitude from string value like "9060N 18060W"
    positions = locations.apply(
        lambda row: pd.Series(
            make_lat_lon(row.Coordinates), index=["latitude", "longitude"], dtype=object
        ),
        result_type="expand",
        axis=1,
    )

    locations = locations.join(positions)

    rename_cols = {
        "Code": "locode",
        "Name": "port_name",
        "FishingPort": "is_fishing_port",
        "LandingPlace": "is_landing_place",
        "CommercialPort": "is_commercial_port",
    }

    keep_cols = [
        "country_code_iso2",
        "locode",
        "port_name",
        "latitude",
        "longitude",
        "is_fishing_port",
        "is_landing_place",
        "is_commercial_port",
    ]

    locations = locations.rename(columns=rename_cols)
    locations["country_code_iso2"] = locations.locode.map(lambda s: s[:2])
    locations = locations[keep_cols]
    locations["port_name"] = locations.port_name.map(str.title)
    return locations


@task(checkpoint=False)
def load_circabc(locations):
    engine = create_engine("monitorfish_remote")
    locations.to_sql(
        "circabc_port_codes",
        engine,
        schema="external",
        if_exists="replace",
        index=False,
    )


with Flow("Create CIRCABC ports codes table") as flow_make_circabc_ports:
    csv_filepath = Parameter("csv_filepath")
    locations = extract_circabc_locations(csv_filepath)
    locations = clean_circabc(locations)
    load_circabc(locations)


# ************** Flow to extract ports from CIRCABC and UNECE and merge ***************


@task(checkpoint=False)
def extract_unece_ports():
    unece_ports = read_table("monitorfish_remote", "external", "unece_port_codes")
    return unece_ports


@task(checkpoint=False)
def extract_circabc_ports():
    circabc_ports = read_table("monitorfish_remote", "external", "circabc_port_codes")
    return circabc_ports


@task(checkpoint=False)
def merge_circabc_unece(circabc_ports, unece_ports):

    keep_unece_cols = ["region", "locode", "latitude", "longitude"]

    ports = pd.merge(
        circabc_ports,
        unece_ports.loc[:, keep_unece_cols],
        on="locode",
        how="left",
        suffixes=("_circabc", "_unece"),
    )

    return ports


@task(checkpoint=False)
def combine_columns_into_value(ports):
    combine_cols = {
        "latitude": ["latitude_circabc", "latitude_unece"],
        "longitude": ["longitude_circabc", "longitude_unece"],
    }

    cols_to_drop = []
    res = ports.copy(deep=True)
    for col_name, cols_list in combine_cols.items():
        res.loc[:, col_name] = coalesce(res[cols_list])
        cols_to_drop += cols_list
    res = res.drop(columns=cols_to_drop)

    return res


@task(checkpoint=False)
def load_port_codes(ports):
    engine = create_engine("monitorfish_remote")
    ports.to_sql(
        "port_codes",
        engine,
        schema="interim",
        if_exists="replace",
        index=False,
    )


with Flow(
    "Extract combine CIRCABC and UNECE ports referencials"
) as flow_combine_circabc_unece_ports:
    circabc_ports = extract_circabc_ports()
    unece_ports = extract_unece_ports()
    ports = merge_circabc_unece(circabc_ports, unece_ports)
    ports = combine_columns_into_value(ports)
    load_port_codes(ports)


# ************* Geocoding to improve the precision of latitude longitude **************


def geocode_row(row):
    credit_exhausted = True  # max rate 1/s if no geolocationIQ credit is available
    country_code_iso2 = row["country_code_iso2"]
    region = row["region"]
    port_name = row["port_name"]
    if pd.isna(port_name):
        lat, lon = None, None
    else:
        try:
            if credit_exhausted:
                sleep(1)
            lat, lon = geocode(
                city=port_name, country_code_iso2=country_code_iso2, county=region
            )
        except requests.HTTPError:
            try:
                if credit_exhausted:
                    sleep(1)
                print("Retring without county for port", port_name)
                lat, lon = geocode(city=port_name, country_code_iso2=country_code_iso2)
            except:
                try:
                    if credit_exhausted:
                        sleep(1)
                    print("Retring with port name alone for port", port_name)
                    lat, lon = geocode(city=port_name)
                except:
                    print("Could not geocode", port_name)
                    lat, lon = None, None
    print(port_name, lat, lon)
    return pd.Series([lat, lon], index=["geocoded_latitude", "geocoded_longitude"])


@task(checkpoint=False)
def extract_port_codes():
    ports = read_table("monitorfish_remote", "interim", "port_codes")
    return ports


@task(checkpoint=False)
def geocode_ports(ports):
    positions = ports.apply(geocode_row, axis=1, result_type="expand")
    geocoded_ports = ports.join(positions)
    return geocoded_ports


@task(checkpoint=False)
def load_geocoded_ports(geocoded_ports):
    engine = create_engine("monitorfish_remote")
    geocoded_ports.to_sql(
        "geocoded_ports",
        engine,
        schema="interim",
        if_exists="replace",
        index=False,
    )


with Flow("Geocode ports") as flow_geocode_ports:
    ports = extract_port_codes()
    geocoded_ports = geocode_ports(ports)
    load_geocoded_ports(geocoded_ports)


# **************** Flow : combine all data together & add manual fixes ****************
# Locations : take geocoded position if available, fall back to CIRCABC/UNECE position
# Manual fixes : add a few missing ports
# The result of this flow can be uploaded to data.gouv.fr on the CNSP profile
# https://www.data.gouv.fr/fr/users/centre-national-de-surveillance-des-peches-cnsp/


@task(checkpoint=False)
def extract_geocoded_ports():
    geocoded_ports = read_table("monitorfish_remote", "interim", "geocoded_ports")
    return geocoded_ports


@task(checkpoint=False)
def merge_lat_lon(geocoded_ports):
    combine_cols = {
        "latitude": ["geocoded_latitude", "latitude"],
        "longitude": ["geocoded_longitude", "longitude"],
    }

    res = geocoded_ports.copy(deep=True)
    for col_name, cols_list in combine_cols.items():
        res.loc[:, col_name] = coalesce(res[cols_list])
    res = res.drop(columns=["geocoded_latitude", "geocoded_longitude"])
    return res


@task(checkpoint=False)
def add_manual_fixes(ports):
    fixes = pd.read_csv(LIBRARY_LOCATION / "pipeline/data/manually_added_ports.csv")
    ports = ports[~ports.locode.isin(fixes.locode)]
    return pd.concat([fixes, ports])


@task(checkpoint=False)
def load_processed_ports_1(ports):
    engine = create_engine("monitorfish_remote")
    ports.to_sql(
        "ports",
        engine,
        schema="processed",
        index=False,
        method=psql_insert_copy,
        if_exists="replace",
    )


@task(checkpoint=False)
def add_buffer_and_index():
    query = """
    ALTER TABLE processed.ports
        ADD COLUMN location geometry(Point, 4326),
        ADD COLUMN buffer_location_0_2_degrees geometry(Polygon, 4326),
        ADD COLUMN buffer_location_0_5_degrees geometry(Polygon, 4326);

    CREATE INDEX idx_processed_ports_location
        ON processed.ports
        USING gist (location);

    CREATE INDEX idx_processed_ports_buffer_location_0_2_degrees
        ON processed.ports
        USING gist (buffer_location_0_2_degrees);

    CREATE INDEX idx_processed_ports_buffer_location_0_5_degrees
        ON processed.ports
        USING gist (buffer_location_0_5_degrees);

    UPDATE processed.ports
        SET location = St_SetSRId(St_MakePoint(longitude, latitude), 4326)
        WHERE longitude IS NOT NULL AND latitude IS NOT NULL;

    UPDATE processed.ports
        SET buffer_location_0_5_degrees = St_Buffer(location, 0.5)
        WHERE location IS NOT NULL;

    UPDATE processed.ports
        SET buffer_location_0_2_degrees = St_Buffer(location, 0.2)
        WHERE location IS NOT NULL;
    """
    e = create_engine("monitorfish_remote")
    e.execute(query)


@task(checkpoint=False)
def compute_ports_fao_areas():
    ports_fao_areas = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/compute_ports_fao_areas.sql",
    )

    ports_fao_areas["fao_areas"] = ports_fao_areas.fao_areas.map(
        remove_redundant_fao_area_codes
    )

    return ports_fao_areas


@task(checkpoint=False)
def compute_active_ports():
    active_ports = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/compute_active_ports.sql",
    )

    return active_ports


@task(checkpoint=False)
def compute_ports_facade():
    ports_facade = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/compute_ports_facade.sql",
    )

    manual_corrections = pd.DataFrame(
        [
            ["FRAER", "SA"],
            ["FRS2R", "SA"],
            ["FRLFK", "SA"],
            ["FRIDX", "SA"],
            ["FRFUA", "SA"],
            ["FRHTP", "SA"],
            ["FRAJJ", "SA"],
            ["FRLRH", "SA"],
            ["FRPT4", "SA"],
            ["FRLPE", "SA"],
            ["FRPR2", "SA"],
            ["FRMRN", "SA"],
            ["FRCJH", "SA"],
            ["FRJLR", "SA"],
            ["FRAS3", "NAMO"],
            ["FRLT3", "NAMO"],
            ["FRLSO", "NAMO"],
            ["FRSML", "NAMO"],
            ["FRV35", "NAMO"],
            ["FRASM", "NAMO"],
            ["FRVM6", "NAMO"],
            ["FRGTN", "MEMN"],
            ["FRGFR", "MEMN"],
            ["FRDBI", "MEMN"],
            ["FRC2H", "MEMN"],
        ],
        columns=pd.Index(["locode", "facade"]),
    )

    # Drop rows that are either incorrect or duplicated first
    ports_facade = ports_facade[~ports_facade.locode.isin(manual_corrections.locode)]

    # Then add the correct façade for each port
    ports_facade = pd.concat([ports_facade, manual_corrections])

    try:
        assert not ports_facade.locode.duplicated().any()
    except AssertionError:
        print(ports_facade[ports_facade.locode.duplicated(keep=False)])
        print(len(ports_facade.locode.duplicated(keep=False)))
        print(ports_facade.locode.duplicated(keep=False))
        raise AssertionError(
            (
                "Some ports belong to several facades. Check facade "
                "area definitions and consider adding manual corrections."
            )
        )

    return ports_facade


@task(checkpoint=False)
def extract_processed_ports_tmp():
    return read_query(
        "monitorfish_remote",
        """SELECT
            country_code_iso2,
            locode,
            port_name,
            is_fiching_port,
            is_landing_place,
            is_commercial_port,
            region,
            latitude,
            longitude,
            location,
            buffer_location_0_2_degrees,
            buffer_location_0_5_degrees
        FROM processed.ports""",
    )


@task(checkpoint=False)
def merge_ports_facade_fao_areas(ports, ports_facade, ports_fao_areas):
    return pd.merge(
        pd.merge(ports, ports_facade, on="locode", how="left"),
        ports_fao_areas,
        on="locode",
        how="left",
    )


@task(checkpoint=False)
def merge_active_ports(ports, active_ports):
    return pd.merge(
        ports,
        active_ports,
        on="locode",
        how="left",
    )


@task(checkpoint=False)
def load_processed_ports_2(ports):
    query = """
    ALTER TABLE processed.ports
        ADD COLUMN facade VARCHAR(100),
        ADD COLUMN fao_areas VARCHAR(100)[];

    """
    e = create_engine("monitorfish_remote")
    e.execute(query)

    load(
        ports,
        table_name="ports",
        schema="processed",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        pg_array_columns=["fao_areas"],
    )


with Flow(
    "Load ports from interim.geocoded_ports to processed.ports"
) as flow_load_ports:

    geocoded_ports = extract_geocoded_ports()
    ports = merge_lat_lon(geocoded_ports)
    ports = add_manual_fixes(ports)

    processed_ports_1 = load_processed_ports_1(ports)
    buffer_and_index_1 = add_buffer_and_index(upstream_tasks=[processed_ports_1])

    active_ports = compute_active_ports()
    ports_fao_areas = compute_ports_fao_areas(upstream_tasks=[buffer_and_index_1])
    ports_facade = compute_ports_facade(upstream_tasks=[buffer_and_index_1])
    ports = extract_processed_ports_tmp(upstream_tasks=[buffer_and_index_1])

    ports = merge_ports_facade_fao_areas(ports, ports_facade, ports_fao_areas)
    ports = merge_active_ports(ports, active_ports)
    processed_ports_2 = load_processed_ports_2(ports)


# **** Flow to extract ports from data.gouv.fr and upload to Monitorfish database ****


@task(checkpoint=False)
def extract_datagouv_ports(ports_url: str = PORTS_URL, proxies: dict = None):
    r = requests.get(ports_url, proxies=proxies)
    r.encoding = "utf8"
    f = io.StringIO(r.text)

    dtype = {
        "country_code_iso2": str,
        "locode": str,
        "port_name": str,
        "region": str,
        "latitude": float,
        "longitude": float,
        "facade": str,
    }

    ports = pd.read_csv(f, dtype=dtype, converters={"fao_areas": literal_eval})

    return ports


@task(checkpoint=False)
def load_ports_to_monitorfish(ports):

    load(
        ports,
        table_name="ports",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        pg_array_columns=["fao_areas"],
    )


with Flow("Ports", executor=LocalDaskExecutor()) as flow:
    ports = extract_datagouv_ports(ports_url=PORTS_URL, proxies=PROXIES)
    load_ports_to_monitorfish(ports)

flow.file_name = Path(__file__).name
