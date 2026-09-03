package fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.favorite_vessels.FavoriteVessels
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.FavoriteVesselsRepository

/**
 * Seeds the user favorite vessels from a list previously kept in the browser local storage.
 *
 * If the user already has a favorite vessels record, it is authoritative and left untouched:
 * a stale local storage must never override favorites saved from another device.
 */
@UseCase
class InitFavoriteVessels(
    private val favoriteVesselsRepository: FavoriteVesselsRepository,
) {
    fun execute(
        email: String,
        vessels: List<VesselIdentity>,
    ): List<VesselIdentity> {
        val hashedEmail = hash(email)
        val existingFavoriteVessels = favoriteVesselsRepository.findAllByHashedEmail(hashedEmail)

        if (existingFavoriteVessels != null) {
            return existingFavoriteVessels.vessels
        }

        val distinctVessels = vessels.distinct()
        favoriteVesselsRepository.upsert(FavoriteVessels(hashedEmail = hashedEmail, vessels = distinctVessels))

        return distinctVessels
    }
}
