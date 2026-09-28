package fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserLayersRepository

/**
 * Seeds the user layers from the settings previously kept in the browser local storage.
 *
 * If the user already has a layers record, it is authoritative and left untouched:
 * a stale local storage must never override layers saved from another device.
 */
@UseCase
class InitUserLayers(
    private val userLayersRepository: UserLayersRepository,
    private val saveUserLayers: SaveUserLayers,
) {
    fun execute(
        email: String,
        administrativeLayers: List<AdministrativeLayer>,
        showedRegulatoryZoneIds: List<String>,
        selectedRegulatoryZoneIds: List<String>,
        baseLayer: String?,
    ): UserLayers =
        userLayersRepository.findByHashedEmail(hash(email))
            ?: saveUserLayers.execute(
                email,
                administrativeLayers,
                showedRegulatoryZoneIds,
                selectedRegulatoryZoneIds,
                baseLayer,
            )
}
