from unittest.mock import patch

from src.entities.alerts import (
    AdminAreasSpecification,
    AdministrativeAreaType,
    GearSpecification,
    RegulatoryAreaSpecification,
    SpeciesSpecification,
)
from src.flows.position_alerts import position_alerts_flow


@patch("src.flows.position_alerts.run_deployment")
def test_position_alerts_flow(mock_run_deployment, reset_test_data):
    state = position_alerts_flow(return_state=True)
    assert state.is_completed()
    assert mock_run_deployment.call_count == 14

    mock_run_deployment.assert_any_call(
        name="Position alert/Position alert",
        parameters={
            "position_alert_id": 1,
            "name": "Alerte all-in",
            "description": "Alerte tous critères",
            "natinf_code": 22206,
            "only_fishing_positions": False,
            "gears": [
                GearSpecification(gear="OTM", min_mesh=80.0, max_mesh=120.0),
                GearSpecification(gear="OTB", min_mesh=80.0, max_mesh=None),
                GearSpecification(gear="LLS", min_mesh=None, max_mesh=None),
            ],
            "species": [
                SpeciesSpecification(species="HKE", min_weight=713.0),
                SpeciesSpecification(species="LOB", min_weight=None),
                SpeciesSpecification(species="SOL", min_weight=None),
            ],
            "administrative_areas": [
                AdminAreasSpecification(
                    area_type=AdministrativeAreaType.FAO_AREA,
                    areas=["27", "28.8"],
                ),
                AdminAreasSpecification(
                    area_type=AdministrativeAreaType.EEZ_AREA,
                    areas=["FRA", "BEL"],
                ),
            ],
            "regulatory_areas": [
                RegulatoryAreaSpecification(
                    topic="Morbihan - bivalves", zone="Secteur 1"
                ),
                RegulatoryAreaSpecification(
                    topic="Morbihan - bivalves", zone="Secteur 2"
                ),
                RegulatoryAreaSpecification(
                    topic="Mediterranée - filets", zone="Zone A"
                ),
            ],
            "min_depth": 800.0,
            "flag_states_iso2": ["FR", "ES", "DE", "DK"],
            "vessel_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            "district_codes": ["CC", "BR", "MO", "NO"],
            "producer_organizations": ["SA THO AN", "OP DU SUD"],
        },
        timeout=0,
    )
    mock_run_deployment.assert_any_call(
        name="Position alert/Position alert",
        parameters={
            "position_alert_id": 5,
            "name": "Alerte 1",
            "description": "Alerte tremail zone A",
            "natinf_code": 12345,
            "only_fishing_positions": False,
            "gears": [GearSpecification(gear="GTR", min_mesh=None, max_mesh=None)],
            "species": None,
            "administrative_areas": None,
            "regulatory_areas": [
                RegulatoryAreaSpecification(
                    topic="Mediterranée - filets", zone="Zone A"
                )
            ],
            "min_depth": None,
            "flag_states_iso2": None,
            "vessel_ids": None,
            "district_codes": None,
            "producer_organizations": None,
        },
        timeout=0,
    )
