package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers

data class UserLayersDataOutput(
    val administrativeLayers: List<AdministrativeLayer>,
    val showedRegulatoryZoneIds: List<String>,
    val selectedRegulatoryZoneIds: List<String>,
    val baseLayer: String?,
) {
    companion object {
        val EMPTY =
            UserLayersDataOutput(
                administrativeLayers = listOf(),
                showedRegulatoryZoneIds = listOf(),
                selectedRegulatoryZoneIds = listOf(),
                baseLayer = null,
            )

        fun fromUserLayers(userLayers: UserLayers) =
            UserLayersDataOutput(
                administrativeLayers = userLayers.administrativeLayers,
                showedRegulatoryZoneIds = userLayers.showedRegulatoryZoneIds,
                selectedRegulatoryZoneIds = userLayers.selectedRegulatoryZoneIds,
                baseLayer = userLayers.baseLayer,
            )
    }
}
