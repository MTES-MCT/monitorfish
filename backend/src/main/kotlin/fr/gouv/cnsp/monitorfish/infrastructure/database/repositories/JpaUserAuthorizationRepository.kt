package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.UserAuthorizationEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBUserAuthorizationRepository
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.jpa.repository.Modifying
import org.springframework.stereotype.Repository

@Repository
class JpaUserAuthorizationRepository(
    private val dbUserAuthorizationRepository: DBUserAuthorizationRepository,
) : UserAuthorizationRepository {
    @Cacheable(value = ["user_authorization"])
    override fun findByHashedEmail(hashedEmail: String): UserAuthorization =
        dbUserAuthorizationRepository.findByHashedEmail(hashedEmail).toUserAuthorization()

    @Modifying
    @Transactional
    override fun upsert(user: UserAuthorization) {
        dbUserAuthorizationRepository.upsertUserAuthorization(UserAuthorizationEntity.fromUserAuthorization(user))
    }

    @Modifying
    @Transactional
    override fun delete(hashedEmail: String) {
        dbUserAuthorizationRepository.deleteById(hashedEmail)
    }
}
