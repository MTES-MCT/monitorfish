package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBUserAuthorizationRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaUserAuthorizationRepository(private val dbUserAuthorizationRepository: DBUserAuthorizationRepository) : UserAuthorizationRepository {
    @Cacheable(value = ["user_authorization"])
    override fun findByHashedEmail(hashedEmail: String): UserAuthorization {
        return dbUserAuthorizationRepository.findByHashedEmail(hashedEmail).toUserAuthorization()
    }
}
