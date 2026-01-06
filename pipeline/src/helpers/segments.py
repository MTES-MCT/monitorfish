import duckdb
import pandas as pd


def allocate_segments_to_catches(
    catches: pd.DataFrame,
    segments: pd.DataFrame,
    catch_id_column: str,
    batch_id_column: str,
) -> pd.DataFrame:
    """
    Takes a pandas DataFrame of catches, a pandas DataFrame defining fleet segments and
    a pandas DataFrame defining control priorities, and returns a pandas DataFrame
    of catches with (at most) one allocated segment per catch and the corresponding
    impact (from `segments`).

    The catches DataFrame must have columns:

      - one id column identifying each catch (the `catch_id_column`)
      - one id column identifying bathes of catches, which can be a trip id, a vessel
        id, a PNO report id... which identifies catches that somehow belong to the same
        "batch" of catches. This is used to compute the share of target species and the
        main SCIP species type of each group (the `batch_id_column`), which is a
        criterion for certain segments.
      - year `int`
      - fao_area `str`
      - gear `str`
      - mesh `float` (can be null if gear has no mesh)
      - species `str`
      - scip_species_type `str`
      - weight `float`
      - vessel_type `str`


    The segments DataFrame must have columns:

      - segment `str`
      - segment_name `str`
      - year `int`
      - gears List[`str`]
      - min_mesh `float`
      - max_mesh `float`
      - fao_areas `List[str]`
      - target_species `List[str]`
      - min_share_of_target_species `float`
      - main_scip_species_type `str`
      - vessel_types `List[str]`
      - impact_risk_factor `float`
      - priority `float`
    """

    assert {
        "year",
        "fao_area",
        "gear",
        "mesh",
        "species",
        "scip_species_type",
        "weight",
        "vessel_type",
        catch_id_column,
        batch_id_column,
    }.issubset(set(catches.columns))

    assert {
        "segment",
        "segment_name",
        "year",
        "gears",
        "min_mesh",
        "max_mesh",
        "fao_areas",
        "target_species",
        "min_share_of_target_species",
        "main_scip_species_type",
        "vessel_types",
        "impact_risk_factor",
        "priority",
    } == set(segments.columns)

    query = f"""
        WITH catches_main_type AS (
            SELECT
                {catch_id_column},
                {batch_id_column},
                year,
                fao_area,
                gear,
                mesh,
                species,
                scip_species_type,
                weight,
                vessel_type,
                CASE
                    WHEN (
                        SUM(CASE WHEN scip_species_type::VARCHAR = 'PELAGIC' THEN weight ELSE 0 END) OVER (PARTITION BY {batch_id_column}) >
                        SUM(CASE WHEN scip_species_type::VARCHAR = 'DEMERSAL' THEN weight ELSE 0 END) OVER (PARTITION BY {batch_id_column})
                    ) THEN 'PELAGIC'
                    ELSE 'DEMERSAL'
                END AS main_scip_species_type
            FROM catches
        ),

        segmented_catches AS (
            SELECT
                {catch_id_column},
                s.segment,
                s.segment_name,
                s.impact_risk_factor,
                s.priority AS priority,
                COALESCE(
                    (
                        SUM(
                            CASE WHEN
                                c.species = ANY(s.target_species) OR
                                s.target_species = []
                            THEN
                                weight
                            ELSE
                                0
                            END
                        )
                        OVER (PARTITION BY {batch_id_column}, s.segment)
                    ) / (
                        SUM(weight)
                        OVER (PARTITION BY {batch_id_column}, s.segment)
                    ),
                    0
                ) AS share_of_target_species,
                (
                    SUM(
                        CASE WHEN
                            c.species = ANY(s.target_species)
                        THEN
                            1
                        ELSE
                            0
                        END
                    )
                    OVER (PARTITION BY {batch_id_column}, s.segment)
                ) > 0 AS has_target_species

            FROM catches_main_type c
            JOIN segments s
            ON
                (c.gear = ANY(s.gears) OR s.gears = '[]'::VARCHAR[])
                AND (length(filter(s.fao_areas, a -> c.fao_area LIKE a || '%')) > 0 OR s.fao_areas = '[]'::VARCHAR[])
                AND s.year = c.year
                AND (c.mesh >= s.min_mesh OR s.min_mesh IS NULL)
                AND (c.mesh < s.max_mesh OR s.max_mesh IS NULL)
                AND (c.vessel_type::VARCHAR = ANY(s.vessel_types::VARCHAR[]) OR s.vessel_types = [])
                AND (s.main_scip_species_type::VARCHAR = c.main_scip_species_type::VARCHAR OR s.main_scip_species_type IS NULL)
            QUALIFY (
                (
                    has_target_species AND
                    share_of_target_species >= s.min_share_of_target_species
                ) OR
                s.min_share_of_target_species IS NULL OR
                s.target_species = []
            )
        ),

        catches_top_priority_segment AS (
            SELECT DISTINCT ON ({catch_id_column})
                {catch_id_column},
                segment,
                segment_name,
                impact_risk_factor
            FROM segmented_catches c
            ORDER BY {catch_id_column}, priority DESC
        )

        SELECT c.*, s.segment, s.segment_name, s.impact_risk_factor
        FROM catches c
        LEFT JOIN catches_top_priority_segment s
        ON c.{catch_id_column} = s.{catch_id_column}
        ORDER BY c.{catch_id_column}
    """
    res = duckdb.sql(query).to_df()
    return res
