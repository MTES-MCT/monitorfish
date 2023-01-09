import io
from dataclasses import dataclass
from pathlib import Path
from typing import List, Set

import geopandas as gpd
import h3
import pandas as pd
import prefect
import requests
from prefect import Flow, Parameter, task
from prefect.executors import LocalDaskExecutor
from vptree import VPTree

from config import (
    ANCHORAGES_H3_CELL_RESOLUTION,
    ANCHORAGES_URL,
    LIBRARY_LOCATION,
    PROXIES,
    ROOT_DIRECTORY,
)
from src.db_config import create_engine
from src.pipeline.generic_tasks import load
from src.pipeline.helpers.spatial import (
    Position,
    get_h3_indices,
    get_k_ring_of_h3_cells,
    point_dist,
)
from src.pipeline.utils import psql_insert_copy
from src.read_query import read_query

#######################################################################################
####################################### HELPERS #######################################
#######################################################################################


@dataclass
class PortLocation:
    locode: str
    port_name: str
    latitude: float
    longitude: float


class PortsVPTree(VPTree):
    """
    Vantage Point Tree to efficiently find the nearest port from a given
    Position(lat, lon).

    If there are p ports in the tree, searching for the port that is closest to a
    given Position has complexity log(p).
    """

    def __init__(self, ports_locations: List[PortLocation]):
        super().__init__(ports_locations, point_dist)

    def get_nearest_port(self, pos: Position) -> dict:
        """
        Returns the distance (in meters) and locode of the PortLocation
        that is closest to the input Position.

        Args:
            pos (Position): Position instance

        Returns:
            dict: dict with nearest_port_distance and
              nearest_port_locode keys.
        """
        nearest_neighbor = self.get_nearest_neighbor(pos)
        nearest_port_distance = nearest_neighbor[0]
        nearest_port_location = nearest_neighbor[1]

        return {
            "nearest_port_distance": nearest_port_distance,
            "nearest_port_locode": nearest_port_location.locode,
        }


#######################################################################################
################################### TASKS AND FLOWS ###################################
#######################################################################################

############### Flow to compute anchorages and attribute cells to ports ###############


@task(checkpoint=False)
def extract_ports() -> pd.DataFrame:
    """
    Extracts ports locode, name, latitude and longitude from processed.ports. This
    table therefore needs to be filled before using this function.

    Returns:
        pd.DataFrame: DataFrame of ports with locode, port_name, longitude and latitude
          columns.
    """

    query = """
    SELECT
        locode,
        port_name,
        latitude,
        longitude
    FROM processed.ports
    WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND fao_areas != '{}'
    """

    return read_query("monitorfish_remote", query)


@task(checkpoint=False)
def extract_control_ports_locodes():
    """
    Returns the set of distinct port locodes where at least one control
    was done.

    Returns:
        Set[str]: set of port locodes
    """

    query = """
    SELECT
        port_locode AS locode
    FROM controls
    WHERE port_locode IS NOT NULL
    AND port_locode != 'XXX'
    AND control_datetime_utc >= CURRENT_TIMESTAMP - INTERVAL '2 years'
    """

    control_ports_locodes = read_query("monitorfish_remote", query)
    control_ports_locodes = set(control_ports_locodes.locode)

    return control_ports_locodes


@task(checkpoint=False)
def extract_ers_ports_locodes() -> Set[str]:
    """
    Returns the set of distinct port locodes used at least once in an ERS
    DEP, PNO ou LAN message.

    Returns:
        Set[str]: set of port locodes
    """

    query = """
    SELECT
        CASE
            WHEN log_type = 'DEP' THEN value->>'departurePort'
            WHEN log_type IN ('PNO', 'LAN') THEN value->>'port'
        END AS locode
    FROM logbook_reports
    WHERE operation_datetime_utc >= CURRENT_TIMESTAMP - INTERVAL '2 years'
    AND log_type IN ('DEP', 'PNO', 'LAN')
    """

    ers_ports_locodes = read_query("monitorfish_remote", query)
    ers_ports_locodes = set(ers_ports_locodes.locode)

    return ers_ports_locodes


@task(checkpoint=False)
def extract_ais_anchorage_coordinates() -> pd.DataFrame:
    """
    Returns a DataFrame with latitude, longitude columns corresponding to
    S2 cells identified as docks in AIS global positions.

    """
    return read_query(
        "monitorfish_remote",
        (
            "SELECT lat AS latitude, lon AS longitude "
            "FROM external.gfw_anchorages "
            "WHERE at_dock = true"
        ),
    )


@task(checkpoint=False)
def extract_vms_static_positions(parquet_file_relative_path) -> pd.DataFrame:
    """
    Read local file with vms positions that have speed zero.

    Returns:
        pd.DataFrame: DataFrame with latitude and longitude columns.
    """
    return pd.read_parquet(ROOT_DIRECTORY / parquet_file_relative_path)


@task(checkpoint=False)
def extract_manual_anchorages_coordinates() -> pd.DataFrame:
    gdf = gpd.read_file(LIBRARY_LOCATION / "pipeline/data/mymaps_manual_anchorages.csv")
    gdf = gdf.drop(columns=["WKT"])
    gdf.crs = 4326
    manual_anchorages_coordinates = pd.DataFrame(
        {"longitude": gdf.geometry.x.values, "latitude": gdf.geometry.y.values}
    )
    return manual_anchorages_coordinates


@task(checkpoint=False)
def get_anchorage_h3_cells(
    static_positions: pd.DataFrame,
    h3_resolution: int = 9,
    number_signals_threshold: int = 100,
) -> pd.DataFrame:
    """
    Bins input positions into h3 cells of the given resolutions and filters said h3
    cells to keep only the ones that appear at least `number_signals_threshold` times
    in the dataset.

    Args:
        static_positions (pd.DataFrame): DataFrame with latitude and longitude
          columns
        h3_resolution (int): h3 resolution to use
        number_signals_threshold (int): number of occurences below which h3 cells are
          filtered out
    """

    static_positions = static_positions[["latitude", "longitude"]].copy()

    static_positions["h3"] = get_h3_indices(static_positions, resolution=h3_resolution)

    signals_by_hexagon = (
        static_positions.groupby("h3")
        .count()
        .rename(columns={"longitude": "number_signals"})
        .reset_index()[["h3", "number_signals"]]
    )

    anchorage_h3_cells = set(
        signals_by_hexagon.loc[
            signals_by_hexagon.number_signals >= number_signals_threshold, "h3"
        ]
    )

    return anchorage_h3_cells


@task(checkpoint=False)
def get_anchorage_h3_cells_rings(
    ais_anchorage_h3_cells: Set[str],
    vms_anchorage_h3_cells: Set[str],
    manual_anchorage_h3_cells: Set[str],
) -> pd.DataFrame:
    """
    Unites two sets of h3 cells corresponding to anchorage locations of vessels
    in AIS and VMS data, then adds two "rings" of cells around them.
    Returns the result as a DataFrame containing the indices, latitude and longitude
    of cells as well as whether each cell was present in the original cells (ring 0)
    or was added in rings 1 and 2 that surround the initial cells.

    Args:
        ais_anchorage_h3_cells (Set[str]): set of indices of h3 cells where
          vessels anchor (AIS data)
        vms_anchorage_h3_cells (Set[str]): set of indices of h3 cells where
          vessels anchor (VMS data)
        manual_anchorage_h3_cells (Set[str]): set of additional indices of h3 cells
    returns:
        pd.DataFrame: DataFrame of h3 cells with 2 levels of rings added
    """
    anchorage_h3_cells = ais_anchorage_h3_cells.union(vms_anchorage_h3_cells).union(
        manual_anchorage_h3_cells
    )

    anchorage_h3_cells_ring_1 = (
        get_k_ring_of_h3_cells(anchorage_h3_cells, k=1) - anchorage_h3_cells
    )

    anchorage_h3_cells_ring_2 = (
        get_k_ring_of_h3_cells(anchorage_h3_cells, k=2)
        - anchorage_h3_cells_ring_1
        - anchorage_h3_cells
    )

    df_0 = pd.DataFrame(anchorage_h3_cells, columns=["h3"])
    df_0["ring_number"] = 0

    df_1 = pd.DataFrame(anchorage_h3_cells_ring_1, columns=["h3"])
    df_1["ring_number"] = 1

    df_2 = pd.DataFrame(anchorage_h3_cells_ring_2, columns=["h3"])
    df_2["ring_number"] = 2

    anchorage_h3_cells_rings = pd.concat([df_0, df_1, df_2])

    anchorage_h3_cells_rings[
        ["latitude", "longitude"]
    ] = anchorage_h3_cells_rings.apply(
        lambda row: h3.h3_to_geo(row["h3"]), result_type="expand", axis=1
    )

    return anchorage_h3_cells_rings


@task(checkpoint=False)
def get_ports_locations(ports: pd.DataFrame) -> List[PortLocation]:
    """
    Transforms a DataFrame into a list of PortLocation objects.

    Args:
        ports (pd.DataFrame): DataFrame with columns matching
          the fields of a PortLocation object.

    Returns:
        List[PortLocation]
    """
    ports_locations = [PortLocation(**port) for port in ports.to_dict(orient="records")]

    return ports_locations


@task(checkpoint=False)
def get_anchorages_closest_port(
    anchorage_h3_cells_rings: pd.DataFrame, ports_locations: List[PortLocation]
) -> pd.DataFrame:

    ports_vptree = PortsVPTree(ports_locations)

    anchorages_closest_port = anchorage_h3_cells_rings.apply(
        lambda row: ports_vptree.get_nearest_port(row), axis=1, result_type="expand"
    )

    return pd.concat(
        [
            anchorage_h3_cells_rings.rename(
                columns={"latitude": "cell_latitude", "longitude": "cell_longitude"}
            ),
            anchorages_closest_port,
        ],
        axis=1,
    )


@task(checkpoint=False)
def unite_ports_locodes(
    ers_ports_locode: Set[str], control_ports_locodes: Set[str]
) -> Set[str]:
    """
    Unites sets of port locodes.

    Args:
        ers_ports_locode (Set[str]) : set of the locodes of ports used in ERS
        control_ports_locodes (Set[str]) : set of the locodes of ports used in controls

    Returns:
        Set[str]: union of the two input sets
    """

    return ers_ports_locode.union(control_ports_locodes)


@task(checkpoint=False)
def get_active_ports(
    ports: pd.DataFrame, active_ports_locodes: Set[str]
) -> pd.DataFrame:

    active_ports = ports[ports.locode.isin(active_ports_locodes)].copy(deep=True)
    return active_ports


@task(checkpoint=False)
def merge_closest_port_closest_active_port(
    anchorages_closest_port: pd.DataFrame, anchorages_closest_active_port: pd.DataFrame
) -> pd.DataFrame:
    """
    Merges anchorages closest port and closest active port.
    """

    anchorages_closest_active_port = anchorages_closest_active_port.rename(
        columns={
            "nearest_port_distance": "nearest_active_port_distance",
            "nearest_port_locode": "nearest_active_port_locode",
        }
    )

    return pd.merge(
        anchorages_closest_port,
        anchorages_closest_active_port[
            ["h3", "nearest_active_port_distance", "nearest_active_port_locode"]
        ],
        on="h3",
    )


@task(checkpoint=False)
def load_processed_anchorages(anchorages: pd.DataFrame):
    """
    Load anchorages to processed.anchorages
    """

    e = create_engine("monitorfish_remote")

    anchorages.to_sql(
        name="anchorages_2023_01",
        con=e,
        schema="processed",
        if_exists="replace",
        index=False,
        method=psql_insert_copy,
    )


with Flow("Anchorages") as flow_compute_anchorages:

    h3_resolution = Parameter("h3_resolution", ANCHORAGES_H3_CELL_RESOLUTION)
    number_signals_threshold = Parameter("number_signals_threshold", 100)
    static_vms_positions_file_relative_path = Parameter(
        "static_vms_positions_file_path",
        "data/raw/anchorages/static_vms_positions_2021_03_to_10.parquet",
    )

    # Extract
    ais_anchorage_coordinates = extract_ais_anchorage_coordinates()
    vms_static_positions = extract_vms_static_positions(
        static_vms_positions_file_relative_path
    )
    ports = extract_ports()
    ers_ports_locodes = extract_ers_ports_locodes()
    control_ports_locodes = extract_control_ports_locodes()
    manual_anchorages_coordinates = extract_manual_anchorages_coordinates()

    # Transform
    manual_anchorage_h3_cells = get_anchorage_h3_cells(
        manual_anchorages_coordinates,
        h3_resolution=h3_resolution,
        number_signals_threshold=0,
    )
    ais_anchorage_h3_cells = get_anchorage_h3_cells(
        ais_anchorage_coordinates,
        h3_resolution=h3_resolution,
        number_signals_threshold=0,
    )

    vms_anchorage_h3_cells = get_anchorage_h3_cells(
        vms_static_positions,
        h3_resolution=h3_resolution,
        number_signals_threshold=number_signals_threshold,
    )

    anchorage_h3_cells_rings = get_anchorage_h3_cells_rings(
        ais_anchorage_h3_cells, vms_anchorage_h3_cells, manual_anchorage_h3_cells
    )

    ports_locations = get_ports_locations(ports)

    active_ports_locodes = unite_ports_locodes(ers_ports_locodes, control_ports_locodes)
    active_ports = get_active_ports(ports, active_ports_locodes)
    active_ports_locations = get_ports_locations(active_ports)

    anchorages_closest_port = get_anchorages_closest_port(
        anchorage_h3_cells_rings, ports_locations
    )

    anchorages_closest_active_port = get_anchorages_closest_port(
        anchorage_h3_cells_rings, active_ports_locations
    )

    anchorages = merge_closest_port_closest_active_port(
        anchorages_closest_port, anchorages_closest_active_port
    )

    # Load
    load_processed_anchorages(anchorages)


### Flow to extract anchorages from data.gouv.fr and upload to Monitorfish database ###


@task(checkpoint=False)
def extract_datagouv_anchorages(anchorages_url: str, proxies: dict) -> pd.DataFrame:
    """
    Downloads anchorages csv file, returns the result as a pandas DataFrame.

    Args:
        anchorages_url (str): url to download the data from.
        proxies (dict): dict with http_proxy and https_proxy settings to use for the
          download

    Returns:
        pd.DataFrame: anchorages data
    """
    r = requests.get(anchorages_url, proxies=proxies)
    r.encoding = "utf8"
    f = io.StringIO(r.text)

    dtype = {
        "h3": str,
        "ring_number": int,
        "cell_latitude": float,
        "cell_longitude": float,
        "nearest_port_distance": float,
        "nearest_port_locode": str,
        "nearest_active_port_distance": float,
        "nearest_active_port_locode": str,
    }

    anchorages = pd.read_csv(f, dtype=dtype)

    return anchorages


@task(checkpoint=False)
def load_anchorages_to_monitorfish(anchorages: pd.DataFrame):
    """
    Loads anchorages data to monitorfish database.

    Args:
        anchorages (pd.DataFrame): anchorages data
    """

    load(
        anchorages,
        table_name="anchorages",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
    )


with Flow("Anchorages", executor=LocalDaskExecutor()) as flow:
    anchorages = extract_datagouv_anchorages(
        anchorages_url=ANCHORAGES_URL, proxies=PROXIES
    )
    load_anchorages_to_monitorfish(anchorages)

flow.file_name = Path(__file__).name
