import pandas as pd
import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load


@task(checkpoint=False)
def extract_n_miles_to_shore_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/n_miles_to_shore_areas.sql")


@task(checkpoint=False)
def load_n_miles_to_shore_areas(
    n_miles_to_shore_areas: pd.DataFrame,
):
    load(
        n_miles_to_shore_areas,
        table_name="n_miles_to_shore_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
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
    )


@task(checkpoint=False)
def extract_fao_neafc_areas() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/fao_neafc_areas.sql")


@task(checkpoint=False)
def load_fao_neafc_areas(fao_neafc_areas: pd.DataFrame):
    load(
        fao_neafc_areas,
        table_name="fao_neafc_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
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
    )


with Flow("Administrative areas") as flow:

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

    fao_neafc_areas = extract_fao_neafc_areas()
    load_fao_neafc_areas(fao_neafc_areas)

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
