from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.generic_tasks import extract, load


@task(checkpoint=False)
def extract_cgpm_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/cgpm_areas.sql")


@task(checkpoint=False)
def load_cgpm_areas(
    cgpm_areas: pd.DataFrame,
):
    load(
        cgpm_areas,
        table_name="cgpm_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_cgpm_statistical_rectangles_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/cgpm_statistical_rectangles_areas.sql")


@task(checkpoint=False)
def load_cgpm_statistical_rectangles_areas(
    cgpm_statistical_rectangles_areas: pd.DataFrame,
):
    load(
        cgpm_statistical_rectangles_areas,
        table_name="cgpm_statistical_rectangles_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_n_miles_to_shore_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/n_miles_to_shore_areas.sql")


@task(checkpoint=False)
def load_n_miles_to_shore_areas(
    n_miles_to_shore_areas: pd.DataFrame,
):
    load(
        n_miles_to_shore_areas,
        table_name="n_miles_to_shore_areas_subdivided",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_3_miles_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/3_miles_areas.sql")


@task(checkpoint=False)
def load_3_miles_areas(
    three_miles_areas: pd.DataFrame,
):
    load(
        three_miles_areas,
        table_name="3_miles_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_6_miles_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/6_miles_areas.sql")


@task(checkpoint=False)
def load_6_miles_areas(
    six_miles_areas: pd.DataFrame,
):
    load(
        six_miles_areas,
        table_name="6_miles_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_12_miles_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/12_miles_areas.sql")


@task(checkpoint=False)
def load_12_miles_areas(
    twelve_miles_areas: pd.DataFrame,
):
    load(
        twelve_miles_areas,
        table_name="12_miles_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_eez_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/eez_areas.sql")


@task(checkpoint=False)
def load_eez_areas(
    eez_areas: pd.DataFrame,
):
    load(
        eez_areas,
        table_name="eez_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_1241_eaux_occidentales_australes_areas() -> pd.DataFrame:
    return extract(
        "monitorfish_local", "cross/1241_eaux_occidentales_australes_areas.sql"
    )


@task(checkpoint=False)
def load_1241_eaux_occidentales_australes_areas(
    eaux_occidentales_australes_areas: pd.DataFrame,
):
    load(
        eaux_occidentales_australes_areas,
        table_name="1241_eaux_occidentales_australes_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_1241_eaux_occidentales_septentrionales_areas() -> pd.DataFrame:
    return extract(
        "monitorfish_local", "cross/1241_eaux_occidentales_septentrionales_areas.sql"
    )


@task(checkpoint=False)
def load_1241_eaux_occidentales_septentrionales_areas(
    eaux_occidentales_septentrionales_areas: pd.DataFrame,
):
    load(
        eaux_occidentales_septentrionales_areas,
        table_name="1241_eaux_occidentales_septentrionales_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_1241_eaux_union_dans_oi_et_atl_ouest_areas() -> pd.DataFrame:
    return extract(
        "monitorfish_local", "cross/1241_eaux_union_dans_oi_et_atl_ouest_areas.sql"
    )


@task(checkpoint=False)
def load_1241_eaux_union_dans_oi_et_atl_ouest_areas(
    eaux_union_dans_oi_et_atl_ouest_areas: pd.DataFrame,
):
    load(
        eaux_union_dans_oi_et_atl_ouest_areas,
        table_name="1241_eaux_union_dans_oi_et_atl_ouest_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_1241_mer_baltique_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/1241_mer_baltique_areas.sql")


@task(checkpoint=False)
def load_1241_mer_baltique_areas(mer_baltique_areas: pd.DataFrame):
    load(
        mer_baltique_areas,
        table_name="1241_mer_baltique_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_1241_mer_du_nord_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/1241_mer_du_nord_areas.sql")


@task(checkpoint=False)
def load_1241_mer_du_nord_areas(mer_du_nord_areas: pd.DataFrame):
    load(
        mer_du_nord_areas,
        table_name="1241_mer_du_nord_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_1241_mer_mediterranee_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/1241_mer_mediterranee_areas.sql")


@task(checkpoint=False)
def load_1241_mer_mediterranee_areas(mer_mediterranee_areas: pd.DataFrame):
    load(
        mer_mediterranee_areas,
        table_name="1241_mer_mediterranee_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_1241_mer_noire_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/1241_mer_noire_areas.sql")


@task(checkpoint=False)
def load_1241_mer_noire_areas(mer_noire_areas: pd.DataFrame):
    load(
        mer_noire_areas,
        table_name="1241_mer_noire_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_1241_mer_celtique_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/1241_mer_celtique_areas.sql")


@task(checkpoint=False)
def load_1241_mer_celtique_areas(mer_celtique_areas: pd.DataFrame):
    load(
        mer_celtique_areas,
        table_name="1241_mer_celtique_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_aem_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/aem_areas.sql")


@task(checkpoint=False)
def load_aem_areas(aem_areas: pd.DataFrame):
    load(
        aem_areas,
        table_name="aem_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_brexit_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/brexit_areas.sql")


@task(checkpoint=False)
def load_brexit_areas(brexit_areas: pd.DataFrame):
    load(
        brexit_areas,
        table_name="brexit_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_cormoran_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/cormoran_areas.sql")


@task(checkpoint=False)
def load_cormoran_areas(cormoran_areas: pd.DataFrame):
    load(
        cormoran_areas,
        table_name="cormoran_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_fao_ccamlr_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/fao_ccamlr_areas.sql")


@task(checkpoint=False)
def load_fao_ccamlr_areas(fao_ccamlr_areas: pd.DataFrame):
    load(
        fao_ccamlr_areas,
        table_name="fao_ccamlr_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_fao_iccat_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/fao_iccat_areas.sql")


@task(checkpoint=False)
def load_fao_iccat_areas(fao_iccat_areas: pd.DataFrame):
    load(
        fao_iccat_areas,
        table_name="fao_iccat_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_fao_iotc_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/fao_iotc_areas.sql")


@task(checkpoint=False)
def load_fao_iotc_areas(fao_iotc_areas: pd.DataFrame):
    load(
        fao_iotc_areas,
        table_name="fao_iotc_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_fao_siofa_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/fao_siofa_areas.sql")


@task(checkpoint=False)
def load_fao_siofa_areas(fao_siofa_areas: pd.DataFrame):
    load(
        fao_siofa_areas,
        table_name="fao_siofa_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_rectangles_stat_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/rectangles_stat_areas.sql")


@task(checkpoint=False)
def load_rectangles_stat_areas(rectangles_stat_areas: pd.DataFrame):
    load(
        rectangles_stat_areas,
        table_name="rectangles_stat_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_situ_atlant_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/situ_atlant_areas.sql")


@task(checkpoint=False)
def load_situ_atlant_areas(situ_atlant_areas: pd.DataFrame):
    load(
        situ_atlant_areas,
        table_name="situ_atlant_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_situ_med_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/situ_med_areas.sql")


@task(checkpoint=False)
def load_situ_med_areas(situ_med_areas: pd.DataFrame):
    load(
        situ_med_areas,
        table_name="situ_med_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_situ_memn_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/situ_memn_areas.sql")


@task(checkpoint=False)
def load_situ_memn_areas(situ_memn_areas: pd.DataFrame):
    load(
        situ_memn_areas,
        table_name="situ_memn_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_situ_outre_mer_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/situ_outre_mer_areas.sql")


@task(checkpoint=False)
def load_situ_outre_mer_areas(situ_outre_mer_areas: pd.DataFrame):
    load(
        situ_outre_mer_areas,
        table_name="situ_outre_mer_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_situs_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/situs_areas.sql")


@task(checkpoint=False)
def load_situs_areas(situs_areas: pd.DataFrame):
    load(
        situs_areas,
        table_name="situs_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_effort_zones_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/effort_zones_areas.sql")


@task(checkpoint=False)
def load_effort_zones_areas(effort_zones_areas: pd.DataFrame):
    load(
        effort_zones_areas,
        table_name="effort_zones_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_neafc_regulatory_area() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/neafc_regulatory_area.sql")


@task(checkpoint=False)
def load_neafc_regulatory_area(neafc_regulatory_area: pd.DataFrame):
    load(
        neafc_regulatory_area,
        table_name="neafc_regulatory_area",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_nafo_regulatory_area() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/nafo_regulatory_area.sql")


@task(checkpoint=False)
def load_nafo_regulatory_area(nafo_regulatory_area: pd.DataFrame):
    load(
        nafo_regulatory_area,
        table_name="nafo_regulatory_area",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_navigation_category_two_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/navigation_category_two_areas.sql")


@task(checkpoint=False)
def load_navigation_category_two_areas(navigation_category_two_areas: pd.DataFrame):
    load(
        navigation_category_two_areas,
        table_name="navigation_category_two_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_navigation_category_three_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/navigation_category_three_areas.sql")


@task(checkpoint=False)
def load_navigation_category_three_areas(navigation_category_three_areas: pd.DataFrame):
    load(
        navigation_category_three_areas,
        table_name="navigation_category_three_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_navigation_category_four_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/navigation_category_four_areas.sql")


@task(checkpoint=False)
def load_navigation_category_four_areas(navigation_category_four_areas: pd.DataFrame):
    load(
        navigation_category_four_areas,
        table_name="navigation_category_four_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_navigation_category_five_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/navigation_category_five_areas.sql")


@task(checkpoint=False)
def load_navigation_category_five_areas(navigation_category_five_areas: pd.DataFrame):
    load(
        navigation_category_five_areas,
        table_name="navigation_category_five_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_saltwater_limit_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/saltwater_limit_areas.sql")


@task(checkpoint=False)
def load_saltwater_limit_areas(saltwater_limit_areas: pd.DataFrame):
    load(
        saltwater_limit_areas,
        table_name="saltwater_limit_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_transversal_sea_limit_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/transversal_sea_limit_areas.sql")


@task(checkpoint=False)
def load_transversal_sea_limit_areas(transversal_sea_limit_areas: pd.DataFrame):
    load(
        transversal_sea_limit_areas,
        table_name="transversal_sea_limit_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_departments_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/departments_areas.sql")


@task(checkpoint=False)
def load_departments_areas(departments_areas: pd.DataFrame):
    load(
        departments_areas,
        table_name="departments_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


@task(checkpoint=False)
def extract_land_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/land_areas.sql")


@task(checkpoint=False)
def load_land_areas(land_areas: pd.DataFrame):
    load(
        land_areas,
        table_name="land_areas_subdivided",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


with Flow("Administrative areas", executor=LocalDaskExecutor()) as flow:
    cgpm_areas = extract_cgpm_areas()
    load_cgpm_areas(cgpm_areas)

    cgpm_statistical_rectangles_areas = extract_cgpm_statistical_rectangles_areas()
    load_cgpm_statistical_rectangles_areas(cgpm_statistical_rectangles_areas)

    n_miles_to_shore_areas = extract_n_miles_to_shore_areas()
    load_n_miles_to_shore_areas(n_miles_to_shore_areas)

    three_miles_areas = extract_3_miles_areas()
    load_3_miles_areas(three_miles_areas)

    six_miles_areas = extract_6_miles_areas()
    load_6_miles_areas(six_miles_areas)

    twelve_miles_areas = extract_12_miles_areas()
    load_12_miles_areas(twelve_miles_areas)

    eez_areas = extract_eez_areas()
    load_eez_areas(eez_areas)

    eaux_occidentales_australes_areas = extract_1241_eaux_occidentales_australes_areas()
    load_1241_eaux_occidentales_australes_areas(eaux_occidentales_australes_areas)

    eaux_occidentales_septentrionales_areas = (
        extract_1241_eaux_occidentales_septentrionales_areas()
    )
    load_1241_eaux_occidentales_septentrionales_areas(
        eaux_occidentales_septentrionales_areas
    )

    eaux_union_dans_oi_et_atl_ouest_areas = (
        extract_1241_eaux_union_dans_oi_et_atl_ouest_areas()
    )
    load_1241_eaux_union_dans_oi_et_atl_ouest_areas(
        eaux_union_dans_oi_et_atl_ouest_areas
    )

    mer_baltique_areas = extract_1241_mer_baltique_areas()
    load_1241_mer_baltique_areas(mer_baltique_areas)

    mer_du_nord_areas = extract_1241_mer_du_nord_areas()
    load_1241_mer_du_nord_areas(mer_du_nord_areas)

    mer_mediterranee_areas = extract_1241_mer_mediterranee_areas()
    load_1241_mer_mediterranee_areas(mer_mediterranee_areas)

    mer_noire_areas = extract_1241_mer_noire_areas()
    load_1241_mer_noire_areas(mer_noire_areas)

    mer_celtique_areas = extract_1241_mer_celtique_areas()
    load_1241_mer_celtique_areas(mer_celtique_areas)

    aem_areas = extract_aem_areas()
    load_aem_areas(aem_areas)

    brexit_areas = extract_brexit_areas()
    load_brexit_areas(brexit_areas)

    cormoran_areas = extract_cormoran_areas()
    load_cormoran_areas(cormoran_areas)

    fao_ccamlr_areas = extract_fao_ccamlr_areas()
    load_fao_ccamlr_areas(fao_ccamlr_areas)

    fao_iccat_areas = extract_fao_iccat_areas()
    load_fao_iccat_areas(fao_iccat_areas)

    fao_iotc_areas = extract_fao_iotc_areas()
    load_fao_iotc_areas(fao_iotc_areas)

    fao_siofa_areas = extract_fao_siofa_areas()
    load_fao_siofa_areas(fao_siofa_areas)

    rectangles_stat_areas = extract_rectangles_stat_areas()
    load_rectangles_stat_areas(rectangles_stat_areas)

    situ_atlant_areas = extract_situ_atlant_areas()
    load_situ_atlant_areas(situ_atlant_areas)

    situ_med_areas = extract_situ_med_areas()
    load_situ_med_areas(situ_med_areas)

    situ_memn_areas = extract_situ_memn_areas()
    load_situ_memn_areas(situ_memn_areas)

    situ_outre_mer_areas = extract_situ_outre_mer_areas()
    load_situ_outre_mer_areas(situ_outre_mer_areas)

    situs_areas = extract_situs_areas()
    load_situs_areas(situs_areas)

    effort_zones_areas = extract_effort_zones_areas()
    load_effort_zones_areas(effort_zones_areas)

    neafc_regulatory_area = extract_neafc_regulatory_area()
    load_neafc_regulatory_area(neafc_regulatory_area)

    nafo_regulatory_area = extract_nafo_regulatory_area()
    load_nafo_regulatory_area(nafo_regulatory_area)

    navigation_category_two_areas = extract_navigation_category_two_areas()
    load_navigation_category_two_areas(navigation_category_two_areas)

    navigation_category_three_areas = extract_navigation_category_three_areas()
    load_navigation_category_three_areas(navigation_category_three_areas)

    navigation_category_four_areas = extract_navigation_category_four_areas()
    load_navigation_category_four_areas(navigation_category_four_areas)

    navigation_category_five_areas = extract_navigation_category_five_areas()
    load_navigation_category_five_areas(navigation_category_five_areas)

    saltwater_limit_areas = extract_saltwater_limit_areas()
    load_saltwater_limit_areas(saltwater_limit_areas)

    transversal_sea_limit_areas = extract_transversal_sea_limit_areas()
    load_transversal_sea_limit_areas(transversal_sea_limit_areas)

    departments_areas = extract_departments_areas()
    load_departments_areas(departments_areas)

    land_areas = extract_land_areas()
    load_land_areas(land_areas)

flow.file_name = Path(__file__).name
