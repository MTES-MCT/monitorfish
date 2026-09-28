package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer

data class UserLayersDataInput(
    val administrativeLayers: List<AdministrativeLayer>,
    val showedRegulatoryZoneIds: List<String>,
    val selectedRegulatoryZoneIds: List<String>,
    val baseLayer: String?,
)
