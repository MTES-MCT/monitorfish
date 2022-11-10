from io import BytesIO

import pandas as pd
from prefect import task


@task(checkpoint=False)
def df_to_csv_file_object(regulations: pd.DataFrame) -> BytesIO:
    """
    Returns a `BytesIO` csv file object. from the input `DataFrame`.
    Useful to upload a `DataFrame` to data.gouv.fr

    The index is not included in the output csv file.

    Args:
        regulations (pd.DataFrame): DataFrame to convert

    Returns:
        BytesIO: file object

    Examples:
        import pandas as pd
        >>> df = pd.DataFrame({"a": [10, 20, 30], "b": [40, 50, 60]})
        >>> df
                a   b
            0  10  40
            1  20  50
            2  30  60
        >>> buf = df_to_csv_file_object.run(df)
        >>> pd.read_csv(buf)
                a   b
            0  10  40
            1  20  50
            2  30  60
    """
    buf = BytesIO()
    regulations.to_csv(buf, mode="wb", index=False)
    buf.seek(0)
    return buf
