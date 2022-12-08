from datetime import datetime

from prefect import task

from src.pipeline.generic_tasks import extract


@task(checkpoint=False)
def extract_segments_of_current_year():
    segments = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fleet_segments.sql",
        params={"year": datetime.utcnow().year},
    )

    # Remove duplicate species that arise from the concatenation of target species and
    # bycatch species
    segments["species"] = segments.species.map(lambda l: sorted(set(l)))

    return segments


@task(checkpoint=False)
def unnest_segments(segments):
    segments = (
        segments.explode("gears")
        .explode("fao_areas")
        .explode("species")
        .rename(columns={"fao_areas": "fao_area", "gears": "gear"})
        .reset_index(drop=True)
    )

    return segments
