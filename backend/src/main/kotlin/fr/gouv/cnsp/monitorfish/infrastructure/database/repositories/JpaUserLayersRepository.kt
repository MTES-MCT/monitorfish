package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers
import fr.gouv.cnsp.monitorfish.domain.repositories.UserLayersRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.UserLayersEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBUserLayersRepository
import jakarta.transaction.Transactional
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Repository

@Repository
class JpaUserLayersRepository(
    private val dbUserLayersRepository: DBUserLayersRepository,
    private val mapper: ObjectMapper,
) : UserLayersRepository {
    override fun findByHashedEmail(hashedEmail: String): UserLayers? =
        dbUserLayersRepository.findByIdOrNull(hashedEmail)?.toUserLayers(mapper)

    @Transactional
    override fun upsert(userLayers: UserLayers) {
        dbUserLayersRepository.save(UserLayersEntity.fromUserLayers(mapper, userLayers))
    }
}
