import io

import pandas as pd
import requests
import tabula
from prefect import Flow, Parameter, task

from config import PROXIES
from src.pipeline.generic_tasks import load


def join_values_by_column(df: pd.DataFrame, join_string: str = " ") -> list:
    """Takes a `pandas.DataFrame` and returns a list whose length is the same as the
    number of columns in the input DataFrame and whose values are made of the values
    of the corresponding columns joined in a single string.


    Args:
        df (pd.DataFrame): a pd.DataFrame with only string values.
        join_string (str, optional): The string used to join values. Defaults to " ".

    Returns:
        list
    """
    res = pd.Series(
        index=df.columns, data=list(map(join_string.join, df.T.values.tolist()))
    )
    return res


@task(checkpoint=False)
def extract_isscaap_codes_pdf() -> io.BytesIO:
    url = "http://www.fao.org/fishery/static/ASFIS/ISSCAAP.pdf"
    r = requests.get(url, proxies=PROXIES)
    f_bytes = io.BytesIO(r.content)
    return f_bytes


@task(checkpoint=False)
def parse_pdf(isscaap_codes_pdf: io.BytesIO):
    isscaap_codes = tabula.read_pdf(
        isscaap_codes_pdf,
        pages="all",
        multiple_tables=False,
        pandas_options={
            "header": None,
            "names": [
                "isscaap_code",
                "isscaap_category_en",
                "isscaap_category_fr",
                "isscaap_category_es",
            ],
        },
    )[0]

    # Handle lines of the table that are split over two lines
    isscaap_codes.loc[:, "isscaap_code"] = isscaap_codes.isscaap_code.fillna(
        method="bfill"
    )

    isscaap_codes = isscaap_codes.groupby("isscaap_code").apply(join_values_by_column)

    return isscaap_codes


@task(checkpoint=False)
def transform_isscaap_codes(isscaap_codes: pd.DataFrame) -> pd.DataFrame:
    isscaap_divisions = isscaap_codes[isscaap_codes.index < 10]
    isscaap_divisions = isscaap_divisions.rename(
        columns={
            "isscaap_category_en": "isscaap_division_en",
            "isscaap_category_fr": "isscaap_division_fr",
            "isscaap_category_es": "isscaap_division_es",
        }
    )

    isscaap_groups = isscaap_codes[isscaap_codes.index > 10]
    isscaap_groups = isscaap_groups.rename(
        columns={
            "isscaap_category_en": "isscaap_group_en",
            "isscaap_category_fr": "isscaap_group_fr",
            "isscaap_category_es": "isscaap_group_es",
        }
    )

    isscaap_groups["isscaap_division_code"] = isscaap_groups.index // 10
    isscaap_groups = pd.merge(
        isscaap_groups,
        isscaap_divisions,
        left_on="isscaap_division_code",
        right_index=True,
    )

    return isscaap_groups


@task(checkpoint=False)
def export_isscaap_codes(isscaap_codes: pd.DataFrame, csv_filepath: str) -> None:
    isscaap_codes.to_csv(csv_filepath, index=True)


with Flow("Extract ISSCAAP codes from fao.org to csv file") as flow:
    csv_filepath = Parameter("csv_filepath")
    pdf = extract_isscaap_codes_pdf()
    isscaap_codes = parse_pdf(pdf)
    isscaap_codes = transform_isscaap_codes(isscaap_codes)
    export_isscaap_codes(isscaap_codes, csv_filepath)
