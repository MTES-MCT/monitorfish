import os
import re
from datetime import date
from itertools import product
from pathlib import Path
from time import sleep

import pandas as pd
import prefect
import requests
from prefect import Flow, Parameter, task
from prefect.executors import LocalDaskExecutor
from sqlalchemy import text

from config import (
    IS_INTEGRATION,
    PORTS_CSV_RESOURCE_ID,
    PORTS_CSV_RESOURCE_TITLE,
    PORTS_DATASET_ID,
)
from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.fao_areas import remove_redundant_fao_area_codes
from src.pipeline.helpers.spatial import geocode, geocode_google
from src.pipeline.processing import coalesce, prepare_df_for_loading
from src.pipeline.shared_tasks.datagouv import get_csv_file_object, update_resource
from src.pipeline.utils import psql_insert_copy
from src.read_query import read_query, read_table

"""
This file contains several flows related to ports :

- `flow_make_unece_ports` reads csv files of LOCODE locations (to download from UNECE
  website) from disk and inserts the data into `external.unece_port_codes`

- `flow_make_circabc_ports` reads csv file of official ports of the fisheries logbook
  system (to download from CIRCABC Master Data Register) from disk and inserts the data
  into `external.circabc_port_codes`

- `flow_combine_circabc_unece_ports` :
  - starts from `external.circabc_port_codes`
  - adds some features (region, latitude, longitude) by performing a left join with
    `external.unece_port_codes`
  - does some renaming and corrects some country codes
  - loads the result into `interim.port_codes`

- `flow_geocode_ports` :
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  !!!!! This flow requires Google credentials and may incur geocoding API costs. !!!!!
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  - starts from `interim.port_codes`
  - reads the lists of active ports locodes from disk (to export from production
    environment, see query bewow)
  - geocodes a subset of ports (active ports + ports of selected countries) to improve
    and / or complete the latitude / longitude coordinates of ports.
  - Loads the results into `interim.geocoded_ports_google`

- `flow_export_geocoded_to_local_db`: exports `interim.geocoded_ports_google` to local
  database table `prod.ports`
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  !!!   This will overwrite the local `prod.ports` which is now the golden source  !!!
  !!!   of ports. This flow is not meant to be run, unless it is desired that the  !!!
  !!!   data is erased and replaced be a fresh new dataset.                        !!!
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

- `flow`:
  - reads from local `prod.ports` table
  - computes ports areas : FAO areas, façade areas, department areas
  - loads to remote `public.ports` table
  - updates data.gouv.fr public ports dataset

Except for `flow`, the last one in the list, flows listed here were used to build the
ports referential and record the steps that were used in doing so - for documentation
purposes and in case it would be required to re-build the referential - but are not
meant to be run on a regular basis.

In normal every day use, the management of ports is as follows:

- ports are edited in local database `prod.ports` table, which is the golden source,
  using QGIS
- remote `public.ports` and public dataset on data.gouv.fr are updated from local
 `prod.ports` table by `flow`

"""


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
    }

    # Ports with an ambiguous name to humans and / or to the Google geocoding API
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
        "PMFSP": "Saint-Pierre (Saint-Pierre-et-Miquelon)",
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


# ************* Geocoding to improve the precision of latitude longitude *************
"""
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!! This flow requires Google credentials and may incur geocoding API costs. !!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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
        "MF",
        "SX",
        "BL",
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


with Flow("Geocode ports") as flow_geocode_ports:
    ports = extract_port_codes()
    active_ports_locodes = extract_active_ports_locodes()
    ports = flag_active_ports(ports, active_ports_locodes)
    geocoded_ports = geocode_ports(ports)
    load_geocoded_ports(geocoded_ports)


# Flow to export geocoded_ports to local CROSS database
# Exported on 2023/07/04
# /!\/!\ BE EXTRA CAREFUL WHEN USING THIS FLOW, AS IT MIGHT ERASE LOCAL CHANGES /!\/!\

# @task(checkpoint=False)
# def extract_geocoded_ports() -> gpd.GeoDataFrame:
#     return extract("monitorfish_remote", "monitorfish/geocoded_ports.sql")
#
#
# @task(checkpoint=False)
# def load_ports_to_local_db(ports: gpd.GeoDataFrame) :
#     load(
#         ports,
#         db_name="monitorfish_local",
#         schema="prod",
#         table_name="ports",
#         how="replace",
#         logger=prefect.context.get("logger")
#     )
#
#
# with Flow("Export geocoded ports to local DB") as flow_export_geocoded_to_local_db:
#     ports = extract_geocoded_ports()
#     load_ports_to_local_db(ports)


# *** Flow : updates public.ports table from golden source local prod.ports table ***
# Also update public dataset :
# https://www.data.gouv.fr/fr/datasets/
#                  liste-des-ports-du-systeme-ers-avec-donnees-de-position/


@task(checkpoint=False)
def extract_local_ports() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/ports.sql")


@task(checkpoint=False)
def compute_ports_zones(ports: pd.DataFrame) -> pd.DataFrame:
    """
    Compute ports FAO areas, façades and departments.
    """
    logger = prefect.context.get("logger")
    engine = create_engine("monitorfish_remote")

    with engine.begin() as connection:
        logger.info("Creating temporary table")
        connection.execute(
            text(
                "CREATE TEMP TABLE tmp_ports("
                "    country_code_iso2 VARCHAR, "
                "    region VARCHAR, "
                "    locode VARCHAR PRIMARY KEY, "
                "    port_name VARCHAR, "
                "    latitude DOUBLE PRECISION, "
                "    longitude DOUBLE PRECISION, "
                "    facade public.facade, "
                "    fao_areas VARCHAR(100)[], "
                "    is_active BOOLEAN NOT NULL,"
                "    geometry geometry(Point, 4326), "
                "    buffer geometry(Polygon, 4326)"
                ")"
                "ON COMMIT DROP;"
            )
        )

        logger.info("Creating indices on temporary table")
        connection.execute(
            text(
                "CREATE INDEX tmp_ports_geometry_idx "
                "ON tmp_ports "
                "USING gist (geometry);"
            )
        )

        connection.execute(
            text(
                "CREATE INDEX tmp_ports_buffer_idx "
                "ON tmp_ports "
                "USING gist (buffer);"
            )
        )

        logger.info("Loading ports to temporary table")
        ports.to_sql(
            "tmp_ports",
            connection,
            index=False,
            method=psql_insert_copy,
            if_exists="append",
        )

        logger.info("Computing ports facade")
        connection.execute(
            text(
                "WITH ports_facade AS ( "
                "    SELECT  "
                "        p.locode, "
                "        f.facade "
                "    FROM tmp_ports p "
                "    JOIN public.facade_areas_subdivided f "
                "    ON ST_Intersects(p.geometry, f.geometry) "
                "    WHERE p.country_code_iso2 IN ( "
                "        'FR', 'GP', 'MQ', 'GF', 'RE', 'YT', 'MF', 'SX', 'BL'"
                "    ) "
                ") "
                "UPDATE tmp_ports "
                "SET facade = f.facade "
                "FROM ports_facade f "
                "WHERE tmp_ports.locode = f.locode"
            )
        )

        logger.info("Computing ports department")
        connection.execute(
            text(
                "WITH ports_region AS ( "
                "    SELECT  "
                "        p.locode, "
                "        d.insee_dep "
                "    FROM tmp_ports p "
                "    JOIN public.departments_areas d "
                "    ON ST_Intersects(p.geometry, d.geometry) "
                "    WHERE p.country_code_iso2 IN ( "
                "        'FR', 'GP', 'MQ', 'GF', 'RE', 'YT', 'MF', 'SX', 'BL'"
                "    ) "
                ") "
                "UPDATE tmp_ports "
                "SET region = r.insee_dep "
                "FROM ports_region r "
                "WHERE tmp_ports.locode = r.locode"
            )
        )

        logger.info("Add 0.5 degrees buffer around ports")
        connection.execute(
            text(
                "UPDATE tmp_ports "
                "SET buffer = St_Buffer(geometry, 0.5) "
                "WHERE geometry IS NOT NULL; "
            )
        )

        logger.info("Computing ports FAO areas")
        connection.execute(
            text(
                "WITH ports_fao_areas AS ( "
                "    SELECT "
                "        locode, "
                "        ARRAY_AGG(f_code) AS fao_areas "
                "    FROM ( "
                "        SELECT  "
                "            p.locode, "
                "            a.f_code "
                "        FROM tmp_ports p "
                "        JOIN public.fao_areas a "
                "        ON ST_Intersects(p.buffer, a.wkb_geometry) "
                "    ) t1 "
                "    GROUP BY  "
                "        locode "
                ") "
                "UPDATE tmp_ports "
                "SET fao_areas = f.fao_areas "
                "FROM ports_fao_areas f "
                "WHERE tmp_ports.locode = f.locode"
            )
        )

        logger.info("Reading ports")
        ports = read_query(
            text(
                "SELECT "
                "country_code_iso2, "
                "region, "
                "locode, "
                "port_name, "
                "latitude, "
                "longitude, "
                "facade, "
                "fao_areas, "
                "is_active "
                "FROM tmp_ports"
            ),
            con=connection,
        )

    return ports


@task(checkpoint=False)
def clean_fao_areas(ports: pd.DataFrame) -> pd.DataFrame:
    """
    Keep only the smallest FAO area(s) of each port.
    """
    ports = ports.copy(deep=True)
    ports["fao_areas"] = ports.fao_areas.map(
        remove_redundant_fao_area_codes, na_action="ignore"
    )
    return ports


@task(checkpoint=False)
def transform_ports_open_data(ports: pd.DataFrame) -> pd.DataFrame:
    logger = prefect.context.get("logger")
    ports_open_data = prepare_df_for_loading(
        ports,
        logger=logger,
        pg_array_columns=["fao_areas"],
    )
    return ports_open_data


@task(checkpoint=False)
def load_ports(ports):
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
    # Parameters
    dataset_id = Parameter("dataset_id", default=PORTS_DATASET_ID)
    ports_resource_id = Parameter("ports_resource_id", default=PORTS_CSV_RESOURCE_ID)
    ports_resource_title = Parameter(
        "ports_resource_title", default=PORTS_CSV_RESOURCE_TITLE
    )

    is_integration = Parameter("is_integration", default=IS_INTEGRATION)

    # Extract
    ports = extract_local_ports()

    # Transform
    ports = compute_ports_zones(ports)
    ports = clean_fao_areas(ports)
    ports_open_data = transform_ports_open_data(ports)

    # Load
    load_ports(ports)

    ports_open_data_csv_file = get_csv_file_object(ports_open_data)
    update_resource(
        dataset_id=dataset_id,
        resource_id=ports_resource_id,
        resource_title=ports_resource_title,
        resource=ports_open_data_csv_file,
        mock_update=is_integration,
    )


flow.file_name = Path(__file__).name
