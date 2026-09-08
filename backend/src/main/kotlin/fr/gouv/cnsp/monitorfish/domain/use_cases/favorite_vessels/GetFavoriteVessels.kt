package fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.FavoriteVesselsRepository

@UseCase
class GetFavoriteVessels(
    private val favoriteVesselsRepository: FavoriteVesselsRepository,
) {
    fun execute(email: String): List<VesselIdentity> {
        val hashedEmail = hash(email)

        return favoriteVesselsRepository.findAllByHashedEmail(hashedEmail)?.vessels ?: listOf()
    }
}
