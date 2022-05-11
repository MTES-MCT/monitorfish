import pandas as pd

from src.pipeline.shared_tasks.risk_factors import extract_current_risk_factors


def test_extract_current_risk_factors(reset_test_data):
    risk_factors = extract_current_risk_factors.run()
    expected_risk_factors = pd.DataFrame(
        columns=pd.Index(["cfr", "ircs", "external_immatriculation", "risk_factor"]),
        data=[
            ["ABC000055481", "IL2468", "AS761555", 1.74110112659225],
            ["ABC000542519", "FQ7058", "RO237719", 1.4142135623731],
            [None, "OLY7853", "SB125334", 1.74110112659225],
            [None, "ZZ000000", "ZZTOPACDC", 1.74110112659225],
        ],
    )
    pd.testing.assert_frame_equal(
        (risk_factors.sort_values("external_immatriculation").reset_index(drop=True)),
        (
            expected_risk_factors.sort_values("external_immatriculation").reset_index(
                drop=True
            )
        ),
    )
