import json
from datetime import datetime

import pandas as pd
from prefect import flow, get_run_logger, task

from config import STATIC_LOCATION
from src.generic_tasks import extract, load
from src.shared_tasks.dates import date_trunc, get_utcnow, make_relativedelta


@task
def extract_activity_overview_data(
    from_datetime_utc: datetime, to_datetime_utc: datetime
) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/activity_overview.sql",
        params={
            "from_datetime_utc": from_datetime_utc,
            "to_datetime_utc": to_datetime_utc,
        },
    )


@task
def get_time_range(df: pd.DataFrame) -> list:
    time_range = [
        int(df.far_week.min().timestamp()) * 1000,
        int(df.far_week.max().timestamp()) * 1000,
    ]
    return time_range


@task
def make_config(time_range: list) -> dict:
    config = {
        "version": "v1",
        "config": {
            "visState": {
                "filters": [
                    {
                        "dataId": ["activity_dataset"],
                        "id": "2texduyca",
                        "name": ["far_week"],
                        "type": "timeRange",
                        "value": time_range,
                        "plotType": "histogram",
                        "animationWindow": "free",
                        "yAxis": None,
                        "view": "enlarged",
                        "speed": 3.856,
                        "enabled": True,
                    },
                    {
                        "dataId": ["activity_dataset"],
                        "id": "clf3bqx5c",
                        "name": ["landing_department"],
                        "type": "multiSelect",
                        "value": [],
                        "plotType": "histogram",
                        "animationWindow": "free",
                        "yAxis": None,
                        "view": "side",
                        "speed": 1,
                        "enabled": True,
                    },
                    {
                        "dataId": ["activity_dataset"],
                        "id": "ihak66e6d",
                        "name": ["economic_zone"],
                        "type": "multiSelect",
                        "value": [],
                        "plotType": "histogram",
                        "animationWindow": "free",
                        "yAxis": None,
                        "view": "side",
                        "speed": 1,
                        "enabled": True,
                    },
                    {
                        "dataId": ["activity_dataset"],
                        "id": "nggqwzrw9",
                        "name": ["landing_facade"],
                        "type": "multiSelect",
                        "value": [],
                        "plotType": "histogram",
                        "animationWindow": "free",
                        "yAxis": None,
                        "view": "side",
                        "speed": 1,
                        "enabled": True,
                    },
                    {
                        "dataId": ["activity_dataset"],
                        "id": "tk82xui47",
                        "name": ["segment"],
                        "type": "multiSelect",
                        "value": [],
                        "plotType": "histogram",
                        "animationWindow": "free",
                        "yAxis": None,
                        "view": "side",
                        "speed": 1,
                        "enabled": True,
                    },
                    {
                        "dataId": ["activity_dataset"],
                        "id": "btnzrlb1j",
                        "name": ["facade"],
                        "type": "multiSelect",
                        "value": [],
                        "plotType": "histogram",
                        "animationWindow": "free",
                        "yAxis": None,
                        "view": "side",
                        "speed": 1,
                        "enabled": True,
                    },
                ],
                "layers": [
                    {
                        "id": "evl5q7a",
                        "type": "point",
                        "config": {
                            "dataId": "activity_dataset",
                            "label": "Captures par segment",
                            "color": [221, 178, 124],
                            "highlightColor": [252, 242, 26, 255],
                            "columns": {"lat": "latitude", "lng": "longitude"},
                            "isVisible": True,
                            "visConfig": {
                                "radius": 10,
                                "fixedRadius": False,
                                "opacity": 0.16,
                                "outline": False,
                                "thickness": 2,
                                "strokeColor": None,
                                "colorRange": {
                                    "name": "Uber Viz Qualitative 4",
                                    "type": "qualitative",
                                    "category": "Uber",
                                    "colors": [
                                        "#12939A",
                                        "#DDB27C",
                                        "#88572C",
                                        "#FF991F",
                                        "#F15C17",
                                        "#223F9A",
                                        "#DA70BF",
                                        "#125C77",
                                        "#4DC19C",
                                        "#776E57",
                                        "#17B8BE",
                                        "#F6D18A",
                                        "#B7885E",
                                        "#FFCB99",
                                        "#F89570",
                                        "#829AE3",
                                        "#E79FD5",
                                        "#1E96BE",
                                        "#89DAC1",
                                        "#B3AD9E",
                                    ],
                                },
                                "strokeColorRange": {
                                    "name": "Global Warming",
                                    "type": "sequential",
                                    "category": "Uber",
                                    "colors": [
                                        "#5A1846",
                                        "#900C3F",
                                        "#C70039",
                                        "#E3611C",
                                        "#F1920E",
                                        "#FFC300",
                                    ],
                                },
                                "radiusRange": [0, 50],
                                "filled": True,
                            },
                            "hidden": False,
                            "textLabel": [
                                {
                                    "field": None,
                                    "color": [255, 255, 255],
                                    "size": 18,
                                    "offset": [0, 0],
                                    "anchor": "start",
                                    "alignment": "center",
                                    "outlineWidth": 0,
                                    "outlineColor": [255, 0, 0, 255],
                                    "background": False,
                                    "backgroundColor": [0, 0, 200, 255],
                                }
                            ],
                        },
                        "visualChannels": {
                            "colorField": {"name": "segment", "type": "string"},
                            "colorScale": "ordinal",
                            "strokeColorField": None,
                            "strokeColorScale": "quantile",
                            "sizeField": {"name": "weight", "type": "real"},
                            "sizeScale": "sqrt",
                        },
                    },
                    {
                        "id": "5v3jjcm",
                        "type": "arc",
                        "config": {
                            "dataId": "activity_dataset",
                            "label": "Captures -> port par segment",
                            "color": [255, 254, 230],
                            "highlightColor": [252, 242, 26, 255],
                            "columns": {
                                "lat0": "latitude",
                                "lng0": "longitude",
                                "lat1": "landing_port_latitude",
                                "lng1": "landing_port_longitude",
                            },
                            "isVisible": True,
                            "visConfig": {
                                "opacity": 0.02,
                                "thickness": 2,
                                "colorRange": {
                                    "name": "Uber Viz Qualitative 4",
                                    "type": "qualitative",
                                    "category": "Uber",
                                    "colors": [
                                        "#12939A",
                                        "#DDB27C",
                                        "#88572C",
                                        "#FF991F",
                                        "#F15C17",
                                        "#223F9A",
                                        "#DA70BF",
                                        "#125C77",
                                        "#4DC19C",
                                        "#776E57",
                                        "#17B8BE",
                                        "#F6D18A",
                                        "#B7885E",
                                        "#FFCB99",
                                        "#F89570",
                                        "#829AE3",
                                        "#E79FD5",
                                        "#1E96BE",
                                        "#89DAC1",
                                        "#B3AD9E",
                                    ],
                                },
                                "sizeRange": [0, 16.8],
                                "targetColor": None,
                            },
                            "hidden": False,
                            "textLabel": [
                                {
                                    "field": None,
                                    "color": [255, 255, 255],
                                    "size": 18,
                                    "offset": [0, 0],
                                    "anchor": "start",
                                    "alignment": "center",
                                    "outlineWidth": 0,
                                    "outlineColor": [255, 0, 0, 255],
                                    "background": False,
                                    "backgroundColor": [0, 0, 200, 255],
                                }
                            ],
                        },
                        "visualChannels": {
                            "colorField": {"name": "segment", "type": "string"},
                            "colorScale": "ordinal",
                            "sizeField": {"name": "weight", "type": "real"},
                            "sizeScale": "linear",
                        },
                    },
                    {
                        "id": "ki3onk",
                        "type": "point",
                        "config": {
                            "dataId": "activity_dataset",
                            "label": "Débarquements",
                            "color": [255, 254, 230],
                            "highlightColor": [252, 242, 26, 255],
                            "columns": {
                                "lat": "landing_port_latitude",
                                "lng": "landing_port_longitude",
                            },
                            "isVisible": True,
                            "visConfig": {
                                "radius": 10,
                                "fixedRadius": False,
                                "opacity": 0.01,
                                "outline": False,
                                "thickness": 2,
                                "strokeColor": None,
                                "colorRange": {
                                    "name": "Global Warming",
                                    "type": "sequential",
                                    "category": "Uber",
                                    "colors": [
                                        "#5A1846",
                                        "#900C3F",
                                        "#C70039",
                                        "#E3611C",
                                        "#F1920E",
                                        "#FFC300",
                                    ],
                                },
                                "strokeColorRange": {
                                    "name": "Global Warming",
                                    "type": "sequential",
                                    "category": "Uber",
                                    "colors": [
                                        "#5A1846",
                                        "#900C3F",
                                        "#C70039",
                                        "#E3611C",
                                        "#F1920E",
                                        "#FFC300",
                                    ],
                                },
                                "radiusRange": [0, 50],
                                "filled": True,
                            },
                            "hidden": False,
                            "textLabel": [
                                {
                                    "field": None,
                                    "color": [255, 255, 255],
                                    "size": 18,
                                    "offset": [0, 0],
                                    "anchor": "start",
                                    "alignment": "center",
                                    "outlineWidth": 0,
                                    "outlineColor": [255, 0, 0, 255],
                                    "background": False,
                                    "backgroundColor": [0, 0, 200, 255],
                                }
                            ],
                        },
                        "visualChannels": {
                            "colorField": None,
                            "colorScale": "quantile",
                            "strokeColorField": None,
                            "strokeColorScale": "quantile",
                            "sizeField": {"name": "weight", "type": "real"},
                            "sizeScale": "sqrt",
                        },
                    },
                ],
                "effects": [],
                "interactionConfig": {
                    "tooltip": {
                        "fieldsToShow": {
                            "activity_dataset": [
                                {"name": "far_week", "format": None},
                                {"name": "facade", "format": None},
                                {"name": "landing_facade", "format": None},
                                {"name": "landing_department", "format": None},
                                {"name": "economic_zone", "format": None},
                                {"name": "segment", "format": None},
                                {"name": "weight", "format": None},
                            ]
                        },
                        "compareMode": False,
                        "compareType": "absolute",
                        "enabled": True,
                    },
                    "brush": {"size": 0.5, "enabled": False},
                    "geocoder": {"enabled": False},
                    "coordinate": {"enabled": False},
                },
                "layerBlending": "normal",
                "overlayBlending": "normal",
                "splitMaps": [],
                "animationConfig": {"currentTime": None, "speed": 1},
                "editor": {"features": [], "visible": True},
            },
            "mapState": {
                "bearing": 4.811688311688311,
                "dragRotate": True,
                "latitude": 49.327447079535155,
                "longitude": -5.124412558901727,
                "pitch": 0,
                "zoom": 5.343217870339727,
                "isSplit": False,
                "isViewportSynced": True,
                "isZoomLocked": False,
                "splitMapViewports": [],
            },
            "mapStyle": {
                "styleType": "dark-matter",
                "topLayerGroups": {},
                "visibleLayerGroups": {
                    "label": True,
                    "road": True,
                    "border": False,
                    "building": True,
                    "water": True,
                    "land": True,
                    "3d building": False,
                },
                "threeDBuildingColor": [
                    15.035172933000911,
                    15.035172933000911,
                    15.035172933000911,
                ],
                "backgroundColor": [0, 0, 0],
                "mapStyles": {},
            },
        },
    }
    return config


def _df_to_dict(df):
    """Create an input dict for Kepler.gl using a DataFrame object

    Inputs:
    - df: a DataFrame object

    Returns:
    - dictionary: a dictionary variable that can be used in Kepler.gl

    """
    df_copy = df.copy()
    # Convert all columns that aren't JSON serializable to strings
    for col in df_copy.columns:
        try:
            # just check the first item in the colum
            json.dumps(df_copy[col].iloc[0] if len(df_copy) > 0 else None)
        except (TypeError, OverflowError):
            df_copy[col] = df_copy[col].astype(str)

    return df_copy.to_dict("split")


def _normalize_data(data):
    if isinstance(data, pd.DataFrame):
        return _df_to_dict(data)
    return data


def data_to_json(data):
    """Serialize a Python data object.
    Attributes of this dictionary are to be passed to the JavaScript side.
    """
    if data is None:
        return None
    else:
        if not isinstance(data, dict):
            print(data)
            raise ValueError(
                "Data type incorrect, expecting a dictionary mapping "
                f"from data id to value, but got {type(data)}"
            )
        else:
            dataset = {}
            # use g_use_arrow to determine if we should use arrow
            for key, value in data.items():
                normalized = _normalize_data(value)
                dataset.update({key: normalized})

            return dataset


def _repr_html_(data=None, config=None, read_only=False, center_map=False):
    with open(STATIC_LOCATION / "keplergl.html", "r") as f:
        keplergl_html = f.read()
    k = keplergl_html.find("<body>")

    data_to_add = data_to_json(data)
    keplergl_data = json.dumps(
        {
            "config": config,
            "data": data_to_add,
            "options": {"readOnly": read_only, "centerMap": center_map},
        }
    )

    cmd = f"window.__keplerglDataConfig = {keplergl_data};"
    frame_txt = (
        keplergl_html[:k]
        + "<body><script>"
        + cmd
        + "</script>"
        + keplergl_html[k + 6 :]
    )

    return frame_txt


@task
def generate_html(df: pd.DataFrame, config: dict) -> str:
    df = df.copy(deep=True)
    df["far_week"] = df.far_week.map(lambda ts: ts.isoformat(sep=" "))
    html = _repr_html_(data={"activity_dataset": df}, config=config)

    html_list = html.split("</body></html>")

    assert len(html_list) == 2
    assert len(html_list[1]) == 0
    truncated_html = html_list[0]

    resize_script_block = """<script>
    window.onload = function() {
    setTimeout(function() {
    var element = document.getElementById('kepler-gl__map');
    if (element) {
        element.style.width = '100%';
        element.style.height = '100%';
        console.warn("Élément avec l'ID 'kepler-gl__map' a été mis à jour.");
    } else {
        console.warn("Élément avec l'ID 'kepler-gl__map' introuvable.");
    }
    }, 100);
    };
    </script>"""

    return truncated_html + resize_script_block + "</body></html>"


@task
def create_data_frame_to_load(
    html: str, from_datetime_utc: datetime, to_datetime_utc: datetime
) -> pd.DataFrame:
    res = pd.DataFrame(
        {
            "start_datetime_utc": [from_datetime_utc],
            "end_datetime_utc": [to_datetime_utc],
            "html_file": [html],
        }
    )
    return res


@task
def load_activity_visualization(df: pd.DataFrame, truncate_table: bool):
    logger = get_run_logger()
    how = "replace" if truncate_table else "upsert"
    load(
        df=df,
        table_name="activity_visualizations",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how=how,
        table_id_column="end_datetime_utc",
        df_id_column="end_datetime_utc",
    )


@flow(name="Monitorfish - Generate kepler activity viz")
def activity_visualizations_flow(
    start_months_ago: int = 12,
    end_months_ago: int = 0,
    truncate_table: bool = False,
    get_utcnow_fn=get_utcnow,
):
    # Extract
    now = get_utcnow_fn()
    today = date_trunc(now, "DAY")
    from_datetime_utc = today - make_relativedelta(months=start_months_ago)
    to_datetime_utc = today - make_relativedelta(months=end_months_ago)
    activity_data = extract_activity_overview_data(from_datetime_utc, to_datetime_utc)

    # Transform
    time_range = get_time_range(activity_data)
    config = make_config(time_range)
    html = generate_html(activity_data, config)
    activity_visualization_df = create_data_frame_to_load(
        html, from_datetime_utc, to_datetime_utc
    )
    # Load
    load_activity_visualization(activity_visualization_df, truncate_table)
