import os
from datetime import date
from time import sleep

import pandas as pd
import requests
from dotenv import load_dotenv
from prefect import Flow, Parameter, task

from src.db_config import create_engine
from src.pipeline.processing import combine_overlapping_columns
from src.read_query import read_table
from src.utils.geocode import geocode

load_dotenv()


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


@task
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


@task
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


@task
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


@task
def extract_circabc_locations(csv_filepath):
    locations = pd.read_csv(csv_filepath, encoding="utf-8", header=[0])

    return locations


@task
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


@task
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


@task
def extract_unece_ports():
    unece_ports = read_table("monitorfish_remote", "external", "unece_port_codes")
    return unece_ports


@task
def extract_circabc_ports():
    circabc_ports = read_table("monitorfish_remote", "external", "circabc_port_codes")
    return circabc_ports


@task
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


@task
def combine_columns_into_value(ports):
    combine_cols = {
        "latitude": ["latitude_circabc", "latitude_unece"],
        "longitude": ["longitude_circabc", "longitude_unece"],
    }

    cols_to_drop = []
    res = ports.copy(deep=True)
    for col_name, cols_list in combine_cols.items():
        res.loc[:, col_name] = combine_overlapping_columns(res, cols_list)
        cols_to_drop += cols_list
    res = res.drop(columns=cols_to_drop)

    return res


@task
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
    country_code_iso2 = row["country_code_iso2"]
    region = row["region"]
    port_name = row["port_name"]
    if pd.isna(port_name):
        lat, lon = None, None
    else:
        try:
            sleep(1)
            lat, lon = geocode(
                city=port_name, country_code_iso2=country_code_iso2, county=region
            )
        except requests.HTTPError:
            try:
                sleep(1)
                print("Retring without county for port", port_name)
                lat, lon = geocode(city=port_name, country_code_iso2=country_code_iso2)
            except:
                print("Could not geocode", port_name)
                lat, lon = None, None
    print(port_name, lat, lon)
    return pd.Series([lat, lon], index=["geocoded_latitude", "geocoded_longitude"])


@task
def extract_port_codes():
    ports = read_table("monitorfish_remote", "interim", "port_codes")
    return ports


@task
def geocode_ports(ports):
    positions = ports.apply(geocode_row, axis=1, result_type="expand")
    geocoded_ports = ports.join(positions)
    return geocoded_ports


@task
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


# ** Flow : take geocoded position if available, fall back to CIRCABC/UNECE position **


@task
def extract_geocoded_ports():
    geocoded_ports = read_table("monitorfish_remote", "interim", "geocoded_ports")
    return geocoded_ports


@task
def merge_lat_lon(geocoded_ports):
    combine_cols = {
        "latitude": ["geocoded_latitude", "latitude"],
        "longitude": ["geocoded_longitude", "longitude"],
    }

    res = geocoded_ports.copy(deep=True)
    for col_name, cols_list in combine_cols.items():
        res.loc[:, col_name] = combine_overlapping_columns(res, cols_list)
    res = res.drop(columns=["geocoded_latitude", "geocoded_longitude"])
    return res


@task
def load_ports(ports):
    engine = create_engine("monitorfish_remote")
    ports.to_sql("ports", engine, schema="public", if_exists="replace", index=False)


with Flow("Load ports from interim.geocoded_ports to public.ports") as flow_load_ports:
    geocoded_ports = extract_geocoded_ports()
    ports = merge_lat_lon(geocoded_ports)
    load_ports(ports)


if __name__ == "__main__":
    flow_geocode_ports.run()
