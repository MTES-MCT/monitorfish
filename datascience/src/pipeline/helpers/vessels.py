import pandas as pd
from sqlalchemy import Table, select
from sqlalchemy.sql import Select


def make_find_vessels_query(
    vessels: pd.DataFrame,
    vessels_table: Table,
) -> Select:
    """
    Creates a `sqlalchemy.select` object representing a query to find `vessels` in
    the `vessels` table that match any of the lines in the input `DataFrame` on any of
    `cfr`, `ircs` or `external_immatriculation`.

    Args:
        vessels (pd.DataFrame): `DataFrame`. Must have columns `cfr`, `ircs` and
          `external_immatriculation`. If any other columns are present they are
          ignored.
        vessels_table (Table): `sqlalchemy.Table` object representing the `vessels`
          table. Must have columns `cfr`, `ircs` and `external_immatriculation`. If any
          other columns are present they are ignored.

    Returns:
        Select: query object with columns `vessel_id`, `cfr`, `ircs` and
          `external_immatriculation`.
    """
    assert "cfr" in vessels
    assert "ircs" in vessels
    assert "external_immatriculation" in vessels

    q = select(
        [
            vessels_table.c.id.label("vessel_id"),
            vessels_table.c.cfr,
            vessels_table.c.ircs,
            vessels_table.c.external_immatriculation,
        ]
    ).where(
        vessels_table.c.cfr.in_(vessels.cfr.dropna().drop_duplicates().to_list())
        | vessels_table.c.external_immatriculation.in_(
            vessels.external_immatriculation.dropna().drop_duplicates().to_list()
        )
        | vessels_table.c.ircs.in_(vessels.ircs.dropna().drop_duplicates().to_list())
    )

    return q
