from prefect import task

from src.pipeline.generic_tasks import extract


@task(checkpoint=False)
def extract_segments_of_year(year: int):
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fleet_segments_of_year.sql",
        params={"year": year},
    )


@task(checkpoint=False)
def extract_all_segments():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fleet_segments.sql",
    )


@task(checkpoint=False)
def unnest_segments(segments):
    segments = (
        segments.explode("gears")
        .explode("fao_areas")
        .explode("target_species")
        .rename(columns={"fao_areas": "fao_area", "gears": "gear"})
        .reset_index(drop=True)
    )

    return segments
