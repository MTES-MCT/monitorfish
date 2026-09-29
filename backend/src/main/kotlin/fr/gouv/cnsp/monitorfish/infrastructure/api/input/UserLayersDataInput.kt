package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer

data class UserLayersDataInput(
    val displayedAdministrativeLayers: List<AdministrativeLayer>,
    val displayedRegulatoryZoneIds: List<String>,
    val selectedRegulatoryZoneIds: List<String>,
    val baseLayer: String?,
)
