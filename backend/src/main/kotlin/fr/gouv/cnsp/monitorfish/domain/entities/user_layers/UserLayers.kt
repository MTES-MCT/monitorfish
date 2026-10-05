package fr.gouv.cnsp.monitorfish.domain.entities.user_layers

data class UserLayers(
    val hashedEmail: String,
    val displayedAdministrativeLayers: List<AdministrativeLayer>,
    val displayedRegulatoryZoneIds: List<String>,
    val selectedRegulatoryZoneIds: List<String>,
    val baseLayer: String?,
)
