package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers

data class UserLayersDataOutput(
    val displayedAdministrativeLayers: List<AdministrativeLayer>,
    val displayedRegulatoryZoneIds: List<String>,
    val selectedRegulatoryZoneIds: List<String>,
    val baseLayer: String?,
) {
    companion object {
        val EMPTY =
            UserLayersDataOutput(
                displayedAdministrativeLayers = listOf(),
                displayedRegulatoryZoneIds = listOf(),
                selectedRegulatoryZoneIds = listOf(),
                baseLayer = null,
            )

        fun fromUserLayers(userLayers: UserLayers) =
            UserLayersDataOutput(
                displayedAdministrativeLayers = userLayers.displayedAdministrativeLayers,
                displayedRegulatoryZoneIds = userLayers.displayedRegulatoryZoneIds,
                selectedRegulatoryZoneIds = userLayers.selectedRegulatoryZoneIds,
                baseLayer = userLayers.baseLayer,
            )
    }
}
