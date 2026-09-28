package fr.gouv.cnsp.monitorfish.domain.entities.user_layers

data class UserLayers(
    val hashedEmail: String,
    val administrativeLayers: List<AdministrativeLayer>,
    val showedRegulatoryZoneIds: List<String>,
    val selectedRegulatoryZoneIds: List<String>,
    val baseLayer: String?,
)
