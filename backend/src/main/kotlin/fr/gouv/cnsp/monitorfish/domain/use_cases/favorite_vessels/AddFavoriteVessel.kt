package fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.favorite_vessels.FavoriteVessels
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.FavoriteVesselsRepository

@UseCase
class AddFavoriteVessel(
    private val favoriteVesselsRepository: FavoriteVesselsRepository,
) {
    fun execute(
        email: String,
        vessel: VesselIdentity,
    ): List<VesselIdentity> {
        val hashedEmail = hash(email)
        val currentVessels = favoriteVesselsRepository.findAllByHashedEmail(hashedEmail)?.vessels ?: listOf()

        if (currentVessels.contains(vessel)) {
            return currentVessels
        }

        val updatedVessels = currentVessels + vessel
        favoriteVesselsRepository.upsert(FavoriteVessels(hashedEmail = hashedEmail, vessels = updatedVessels))

        return updatedVessels
    }
}
