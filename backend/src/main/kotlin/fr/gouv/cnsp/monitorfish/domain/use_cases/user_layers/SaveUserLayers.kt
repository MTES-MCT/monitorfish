package fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserLayersRepository

@UseCase
class SaveUserLayers(
    private val userLayersRepository: UserLayersRepository,
) {
    fun execute(
        email: String,
        administrativeLayers: List<AdministrativeLayer>,
        showedRegulatoryZoneIds: List<String>,
        selectedRegulatoryZoneIds: List<String>,
        baseLayer: String?,
    ): UserLayers {
        val userLayers =
            UserLayers(
                hashedEmail = hash(email),
                administrativeLayers = administrativeLayers.distinct(),
                showedRegulatoryZoneIds = showedRegulatoryZoneIds.distinct(),
                selectedRegulatoryZoneIds = selectedRegulatoryZoneIds.distinct(),
                baseLayer = baseLayer,
            )
        userLayersRepository.upsert(userLayers)

        return userLayers
    }
}
