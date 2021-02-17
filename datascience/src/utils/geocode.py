import os

import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()


def geocode(query_string=None, country_code_iso2=None, **kwargs):
    """Return latitude, longitude for input location.
    Provided either a query string, or one or more of the following keyword arguments:
        street
        city
        county
        state
        country
        postalcode
    """
    base_url = "https://eu1.locationiq.com/v1/search.php"
    params = {"key": os.environ["LOCATIONIQ_TOKEN"], "format": "json"}

    if query_string is not None and not pd.isna(query_string):
        if kwargs:
            print(
                "Keyword arguments cannot be used in combination with text query. "
                + "Keyword arguments will be ignored."
            )

        params["q"] = query_string

    elif kwargs:
        params = {**params, **kwargs}

    else:
        print(
            "You must provide either a query string or at least 1 of the allowed "
            + "keyword arguments."
        )
        return None, None

    if country_code_iso2:
        params["countrycodes"] = str(country_code_iso2)

    response = requests.get(base_url, params=params)
    response.raise_for_status()
    data = response.json()[0]
    return float(data["lat"]), float(data["lon"])
