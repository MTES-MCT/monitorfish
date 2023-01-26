import warnings
from typing import Union

import pandas as pd


def catch_area_isin_fao_area(
    catch_area: Union[None, str], fao_area: Union[None, str]
) -> bool:
    """
    Returns:
        bool :

          - `True` if a catch area (e.g. '27.7.b') is in a given fao_area (e.g. '27.7.b' or
            '27')
          - False if a catch area (e.g. '27.7.b') is NOT in a given fao_area (e.g. '28.6' or
            '27.7.b.4')
          - `True` if the fao_area if None (whatever the value of the catch_area)
          - `False` if the fao_area is not None and the catch_area is None

    """
    if fao_area is None:
        return True
    elif catch_area is None:
        return False
    else:
        return fao_area in catch_area


def attribute_segments_to_catches(
    catches: pd.DataFrame,
    segments: pd.DataFrame,
    *,
    append_unassigned_catches: bool = False,
    unassigned_catches_segment_label: str = "Aucun"
) -> pd.DataFrame:
    """
    Takes a pandas DataFrame of catches and a pandas DataFrame defining fleet
    segments, returns a pandas DataFrame which is an inner join of the two
    input DataFrames with species, gear and fao_area as join keys.

    Segments may be defined by all 3 criteria (gear, fao_area and species) or a
    subset of these criteria. At least 1 criterion must be defined (the DataFrame
    that defines segments cannot have rows with 3 null values for the 3 criteria).

    Note that, as a result of the fact that the join is performed as an inner join:

        - catches that do not belong to any segments are absent of the result,
          unless `append_unattributed_catches` is set to True.
        - catches that belong to several segments appear several times in the result

    """

    try:
        assert {"species", "gear", "fao_area"}.issubset(list(catches))
        assert {"segment", "species", "gear", "fao_area"}.issubset(list(segments))
    except AssertionError:
        raise ValueError(
            "catches and segments must include columns gear, fao_area and species."
        )

    if catches.index.nunique() < len(catches):
        warnings.warn(
            (
                "The index values of the `catches` DataFrame are not unique. This may lead "
                "to unexpected fleet segments results. Use reset_index() on catches."
            )
        )

    catches = catches.copy(deep=True)
    catches = catches.rename_axis(index="catch_id").reset_index()
    catches = catches.rename(columns={"fao_area": "fao_area_of_catch"})
    segments = segments.rename(columns={"fao_area": "fao_area_of_segment"})

    # Merge catches and segments on gear and species
    segments_gear_species = pd.merge(
        segments,
        catches,
        on=["species", "gear"],
    )

    # Merge catches and segments only on gear, for segments without a species criterion
    segments_gear_only = segments[segments.species.isna()].drop(columns=["species"])

    segments_gear_only = pd.merge(segments_gear_only, catches, on="gear")

    # Merge catches and segments only on species, for segments without a gear criterion
    segments_species_only = segments[segments.gear.isna()].drop(columns=["gear"])

    segments_species_only = pd.merge(
        segments_species_only,
        catches,
        on="species",
    )

    # Match catches to all segments that have no criterion on species nor on gears
    segments_no_gear_no_species = segments[
        segments[["gear", "species"]].isna().all(axis=1)
    ][["segment", "fao_area_of_segment"]]

    segments_no_gear_no_species = pd.merge(
        segments_no_gear_no_species,
        catches,
        how="cross",
    )

    # Concatenate the 4 sets of matched (catches, segments)
    segmented_catches = pd.concat(
        [
            segments_gear_species,
            segments_gear_only,
            segments_species_only,
            segments_no_gear_no_species,
        ]
    )

    # Matched (catches, segments) now need to be filtered to keep only the matches
    # that satisfy the fao_area criterion. A catch made in '27.7.b' will satisfy
    # the fao criterion of a segment whose fao_area is '27.7', so we check that the
    # fao area of the segment is a substring of the fao area of the catch.
    segmented_catches = segmented_catches[
        (
            segmented_catches.apply(
                lambda row: catch_area_isin_fao_area(
                    row.fao_area_of_catch, row.fao_area_of_segment
                ),
                axis=1,
            )
        )
    ]

    segmented_catches = segmented_catches.drop_duplicates(
        subset=["catch_id", "segment"]
    )

    if append_unassigned_catches:

        unassigned_catch_ids = set(catches.catch_id) - set(segmented_catches.catch_id)

        segmented_catches = pd.concat(
            [segmented_catches, catches[catches.catch_id.isin(unassigned_catch_ids)]]
        )

        segmented_catches = segmented_catches.fillna(
            {"segment": unassigned_catches_segment_label}
        )

    segmented_catches = (
        segmented_catches.sort_values("catch_id")
        .drop(columns=["catch_id"])
        .reset_index(drop=True)
    )

    return segmented_catches
