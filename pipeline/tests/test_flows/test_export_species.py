import io
import zipfile
from io import BytesIO
from unittest.mock import MagicMock, patch

import pandas as pd

from src.flows.export_species import export_species_flow

ASFIS_CSV = (
    "﻿ISSCAAP_Group ,Taxonomic_Code,Alpha3_Code,Scientific_Name,English_name,"
    "French_name,Spanish_name,Arabic_name,Chinese_name,Russian_name,Author,Family,"
    "Order or higher taxa,FishStat_Data\n"
    "33,182024109404,SBR,Pagellus bogaraveo,Blackspot seabream,Dorade rose,Besugo,,,,"
    "(Brünnich 1768),SPARIDAE,ACANTHURIFORMES,YES\n"
    "33,182024109804,REV,Pagrus major,Red seabream,Dorade japonaise,,,,,"
    "(Temminck & Schlegel 1843),SPARIDAE,ACANTHURIFORMES,YES\n"
)

ISSCAAP_GROUPS_CSV = (
    "isscaap_code,isscaap_group_en,isscaap_group_fr,isscaap_group_es,"
    "isscaap_division_code,isscaap_division_en,isscaap_division_fr,"
    "isscaap_division_es\n"
    "33.0,Miscellaneous coastal fishes,Poissons côtiers divers,"
    "Peces costeros diversos,3.0,Marine fishes,Poissons marins,Peces marinos\n"
)


def asfis_zip() -> bytes:
    buf = BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("ASFIS_sp_2026.1.csv", ASFIS_CSV.encode("utf-8"))
        z.writestr("ASFIS_sp_2026.1.xlsx", b"not a csv")
    return buf.getvalue()


def mock_get(url, proxies=None):
    response = MagicMock()
    if url.endswith(".zip"):
        response.content = asfis_zip()
    else:
        response.text = ISSCAAP_GROUPS_CSV
    return response


@patch("src.flows.export_species.requests.get", mock_get)
def test_flow():
    state = export_species_flow(return_state=True, is_integration=True)
    assert state.is_completed()

    species_response, species_csv_file = state.result()
    assert species_response.url == (
        "https://www.data.gouv.fr/api/1/datasets/6089903b57619270ab169909/"
        "resources/32616122-6931-4875-8e26-a57832012419/upload/"
    )

    species = pd.read_csv(io.BytesIO(species_csv_file.getvalue()))
    assert list(species.columns) == [
        "species_code",
        "taxocode",
        "scientific_name",
        "english_name",
        "french_name",
        "spanish_name",
        "arabic_name",
        "chinese_name",
        "russian_name",
        "author",
        "family",
        "order",
        "stats_data",
        "isscaap_code",
        "isscaap_group_en",
        "isscaap_group_fr",
        "isscaap_group_es",
        "isscaap_division_code",
        "isscaap_division_en",
        "isscaap_division_fr",
        "isscaap_division_es",
    ]
    assert species.set_index("species_code").french_name.to_dict() == {
        "SBR": "Dorade rose",
        "REV": "Dorade japonaise",
    }
    assert species.order.tolist() == ["Acanthuriformes", "Acanthuriformes"]
    assert species.isscaap_group_fr.tolist() == ["Poissons côtiers divers"] * 2
