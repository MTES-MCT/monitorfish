package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.favorite_vessels.FavoriteVessels
import fr.gouv.cnsp.monitorfish.domain.repositories.FavoriteVesselsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FavoriteVesselsEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFavoriteVesselsRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Repository

@Repository
class JpaFavoriteVesselsRepository(
    private val dbFavoriteVesselsRepository: DBFavoriteVesselsRepository,
    private val mapper: ObjectMapper,
) : FavoriteVesselsRepository {
    override fun findAllByHashedEmail(hashedEmail: String): FavoriteVessels? =
        dbFavoriteVesselsRepository
            .findAllByHashedEmailEquals(hashedEmail)
            ?.toFavoriteVessels(mapper)

    @Transactional
    override fun upsert(favoriteVessels: FavoriteVessels) {
        dbFavoriteVesselsRepository.save(FavoriteVesselsEntity.fromFavoriteVessels(mapper, favoriteVessels))
    }
}
