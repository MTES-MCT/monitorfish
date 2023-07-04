import io
import os
import re
from ast import literal_eval
from datetime import date
from itertools import product
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
from src.pipeline.helpers.spatial import geocode, geocode_google
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
        lon_minutes = float(lat_lon[-3:-1])
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
    rename_cols = {
        "Code": "locode",
        "Name": "port_name",
        "Latitude": "latitude",
        "Longitude": "longitude",
    }
    locations = locations.rename(columns=rename_cols)

    locations["country_code_iso2"] = locations.locode.map(lambda s: s[:2])

    keep_cols = [
        "country_code_iso2",
        "locode",
        "port_name",
        "latitude",
        "longitude",
    ]
    locations = locations[keep_cols]

    locations["port_name"] = locations.port_name.map(str.title)

    def replace_commas(str_or_float):
        return (
            str_or_float.replace(",", ".")
            if type(str_or_float) is str
            else str_or_float
        )

    locations["latitude"] = locations.latitude.map(replace_commas).astype(float)
    locations["longitude"] = locations.longitude.map(replace_commas).astype(float)

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
def clean_ports(ports: pd.DataFrame) -> pd.DataFrame:
    """
    Rename ambiguous port names and change incorrect country codes
    """

    ports = ports.copy(deep=True)

    # Incorrect country codes to change
    country_codes_to_change = {
        "FRXFK": "TF",
        "FRPPN": "GP",
        "FRFDE": "MQ",
        "GPMSB": "MF",
        "FRRN4": "RE",
    }

    # Ports with an ambiguous name  to humans and / or to the Google geocoding API
    ports_to_rename = {
        "FRDUU": "Le Douhet (Saint-Georges-d'Oléron)",
        "FRBEC": "Bec d'Ambès (Bayon-sur-Gironde)",
        "FRKOC": "Kérascouët (Hôpital-Camfrout)",
        "FRPCV": "Porscav (Lampaul-Plouarzel)",
        "FRKSL": "Kastell Ac'h (Plouguerneau)",
        "FRKSI": "Koréjou (Plouguerneau)",
        "FRHR3": "Locmaria (Groix)",
        "FRRUB": "Port de Roubary (Gatteville-le-Phare)",
        "GBNPO": "Newport, Isle of Wight",
        "FRMSM": "Mont-Saint-Martin, Meuthe-et-Moselle",
        "FRHOE": "Hœrdt",
        "FRCA7": "Port du canal (Gujan-Mestras)",
        "FRBN4": "Port du Bonhomme (La Guérinière)",
        "FRCE9": "Port du Collet (Les Moutiers-en-Retz)",
        "FRMI4": "Port du Morin, (L'Épine, Île de Noirmoutier)",
        "FRLF3": "La Fosse (Barbâtre)",
        "FRCH9": "Les Champs (Bouin)",
        "FRSAB": "Sablon (Metz)",
        "FRBE5": "Port de la Belle Etoile (Saint-Androny)",
        "FRAYZ": "Ayse",
        "FRPDW": "Pain de Sucre (Bourg)",
        "FRHYR": "Hyères",
        "FRDDT": "Le Pradet",
        "FRG9J": "Gajan, Gard",
        "FRHHE": "Montoulieu, Hérault",
        "FRART": "Artix, Pyrénées-Atlantiques",
        "FRHOU": "Hourcade (Villenave-d'Ornon)",
        "FRPN6": "Port Nord (Fouras)",
        "FR5RA": "Saint-Maur, Indre",
        "FRCS9": "Port de Cassy (Lanton)",
        "FRFAC": "Facture-Biganos",
        "FRIMI": "Île aux Moines",
        "FRMI2": "Mindin (Saint-Brevin-les-Pins)",
        "FRGV6": "Port de la Gravette (La Plaine-sur-Mer)",
        "FRAR5": "Port d'Argenton (Landunvez)",
        "FRRE2": "Port du Rocher (La Teste-de-Buch)",
        "FRPF2": "Le Four (Lège-Cap-Ferret)",
        "FRBR5": "Port De La Barbotière (Gujan-Mestras)",
        "FRVI2": "Port de la Vigne (Lège-Cap-Ferret)",
        "FRE56": "Sainte-Hélène, Morbihan",
        "FRLO4": "Port de Larros (Gujan-Mestras)",
        "FR2SS": "Saint-Symphorien, Sarthe",
        "FRTOO": "Toull Broc'h (Ploubazlanec)",
        "FRMR4": "La Martinière (Le Pellerin)",
        "FRCR2": "Carro (Martigues)",
    }

    for locode, country_code in country_codes_to_change.items():
        ports.loc[ports.locode == locode, "country_code_iso2"] = country_code

    for locode, name in ports_to_rename.items():
        ports.loc[ports.locode == locode, "port_name"] = name

    return ports


@task(checkpoint=False)
def parse_ports_names(ports):
    pattern = re.compile(r"^(?P<location_or_city>.*?)(\((?P<city>.*)\))?$")

    def get_location_and_city(s: str) -> pd.Series:
        m = pattern.match(s)
        groups = m.groupdict()
        location_or_city = groups["location_or_city"]
        city = groups["city"]

        if city:
            city = city.strip()
            location = location_or_city.strip()
        else:
            city = location_or_city.strip()
            location = None

        return pd.Series([location, city], index=["location", "city"])

    location_and_city = ports.port_name.apply(get_location_and_city)

    ports = ports.join(location_and_city)
    return ports


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
    ports = clean_ports(ports)
    ports = parse_ports_names(ports)
    load_port_codes(ports)


# ************* Geocoding to improve the precision of latitude longitude **************
"""
In this flow, we geocode a subset of the full ports lists :
- Ports of selected countries
- Ports flagged as 'active'
'Active' ports are ports in which there has been at least a PNO, a LAN or a land
control in recent years

The list of 'active' ports can be extracted from the production environment with the
 following query :


WITH pno_lan_ports AS (
    SELECT DISTINCT value->>'port' AS locode
    FROM logbook_reports
    WHERE
        log_type IN ('PNO', 'LAN') AND
        operation_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '2 years'
),

control_ports AS (
    SELECT DISTINCT port_locode AS locode
    FROM mission_actions
    WHERE
        action_type = 'LAND_CONTROL' AND
        action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '5 years'
)

SELECT COALESCE(pno_lan_ports.locode, control_ports.locode) AS locode
FROM pno_lan_ports
FULL OUTER JOIN control_ports
ON pno_lan_ports.locode =  control_ports.locode
"""


def geocode_row(row):
    limit_rate = True  # limit rate to 1 query / second
    country_code_iso2 = row["country_code_iso2"]

    osm_fr_countries = {"RE", "YT", "MQ", "GF", "GP"}
    if country_code_iso2 in osm_fr_countries:
        country_code_iso2 = "FR"
    region = row["region"]
    location = row["location"]
    city = row["city"]

    success = False
    first_attempt_failed = False

    backends = ["Nominatim", "LocationIQ"]
    query_strings = [
        f"{city}",
    ]
    if region:
        query_strings.insert(0, f"{city}, {region}")
    if location:
        if region:
            query_strings.insert(0, f"{location}, {city}, {region}")
        else:
            query_strings.insert(0, f"{location}, {city}")

    attempts = list(product(backends, query_strings))

    for backend, query_string in attempts:
        if first_attempt_failed:
            print(f"Retrying {query_string} on {backend}...")

        try:
            if limit_rate:
                sleep(1)

            lat, lon = geocode(
                query_string=query_string,
                country_code_iso2=country_code_iso2,
                backend=backend,
            )

            success = True
            break

        except (requests.HTTPError, ValueError):
            first_attempt_failed = True

    if not success:
        print("Could not geocode", city)
        lat, lon, backend = None, None, "Geocoding failed"

    return pd.Series(
        [lat, lon, backend],
        index=["geocoded_latitude", "geocoded_longitude", "geocoding_api"],
    )


def geocode_row_google(row):
    country_code_iso2 = row["country_code_iso2"]
    location = row["location"]
    city = row["city"]

    if location:
        address = f"{location}, {city}"
    else:
        address = city

    try:
        lat, lon = geocode_google(address=address, country=country_code_iso2)
    except (AssertionError, requests.HTTPError):
        if location:
            print(f"Retrying with city only : {city}")
            try:
                lat, lon = geocode_google(address=city, country=country_code_iso2)

            except (AssertionError, requests.HTTPError):
                print(f"Failed geocoding : {city}")
                lat, lon = None, None
        else:
            print(f"Failed geocoding : {city}")
            lat, lon = None, None

    return pd.Series([lat, lon], index=["geocoded_latitude", "geocoded_longitude"])


@task(checkpoint=False)
def extract_port_codes():
    ports = read_table("monitorfish_remote", "interim", "port_codes")
    return ports


@task(checkpoint=False)
def extract_active_ports_locodes() -> set:
    csv_file_path = "../../../data/external/monitorfish_prod/active_ports_locodes.csv"
    ports_locodes = pd.read_csv(csv_file_path)
    ports_locodes_set = set(ports_locodes.locode)
    return ports_locodes_set


@task(checkpoint=False)
def flag_active_ports(ports: pd.DataFrame, active_ports_locodes: set) -> pd.DataFrame:
    ports = ports.copy(deep=True)
    ports["is_active"] = ports.locode.isin(active_ports_locodes)
    return ports


@task(checkpoint=False)
def geocode_ports(ports):

    country_codes_to_geocode = [
        "FR",
        "MQ",
        "GP",
        "YT",
        "VE",
        "MG",
        "RE",
        "BE",
        "FO",
        "GF",
    ]

    ports_to_geocode = ports.loc[
        ports.is_active | ports.country_code_iso2.isin(country_codes_to_geocode)
    ]

    positions = ports_to_geocode.apply(geocode_row_google, axis=1, result_type="expand")
    geocoded_ports = ports.join(positions)
    return geocoded_ports


@task(checkpoint=False)
def load_geocoded_ports(geocoded_ports):
    engine = create_engine("monitorfish_remote")
    geocoded_ports.to_sql(
        "geocoded_ports_google",
        engine,
        schema="interim",
        if_exists="replace",
        index=False,
    )


@task(checkpoint=False)
def compute_distance_between_geocoded_and_initial_positions():
    e = create_engine("monitorfish_remote")
    with e.begin() as conn:

        conn.execute(
            """
            ALTER TABLE interim.geocoded_ports_google
            ADD COLUMN distance_km DOUBLE PRECISION
        """
        )

        conn.execute(
            """
            UPDATE interim.geocoded_ports_google
            SET distance_km = ST_Distance(
                    ST_SetSRID(ST_Point(longitude, latitude), 4326)::geography,
                    ST_SetSRID(
                        ST_Point(geocoded_longitude, geocoded_latitude),
                        4326
                    )::geography
                ) / 1000
        """
        )


with Flow("Geocode ports") as flow_geocode_ports:
    ports = extract_port_codes()
    active_ports_locodes = extract_active_ports_locodes()
    ports = flag_active_ports(ports, active_ports_locodes)
    geocoded_ports = geocode_ports(ports)
    loaded = load_geocoded_ports(geocoded_ports)
    compute_distance_between_geocoded_and_initial_positions(upstream_tasks=[loaded])


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
        db="monitorfish_remote",
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

    ports_fao_areas = compute_ports_fao_areas(upstream_tasks=[buffer_and_index_1])
    ports_facade = compute_ports_facade(upstream_tasks=[buffer_and_index_1])
    ports = extract_processed_ports_tmp(upstream_tasks=[buffer_and_index_1])

    ports = merge_ports_facade_fao_areas(ports, ports_facade, ports_fao_areas)
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
