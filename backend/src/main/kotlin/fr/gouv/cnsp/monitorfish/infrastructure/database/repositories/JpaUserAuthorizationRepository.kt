package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.UserAuthorizationEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBUserAuthorizationRepository
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.jpa.repository.Modifying
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaUserAuthorizationRepository(
    private val dbUserAuthorizationRepository: DBUserAuthorizationRepository,
) : UserAuthorizationRepository {
    @Cacheable(value = ["user_authorization"])
    override fun findByHashedEmail(hashedEmail: String): UserAuthorization =
        dbUserAuthorizationRepository.findByHashedEmail(hashedEmail).toUserAuthorization()

    override fun findAll(): List<UserAuthorization> =
        dbUserAuthorizationRepository.findAll().map { it.toUserAuthorization() }

    @Modifying
    @Transactional
    @CacheEvict(value = ["user_authorization"], allEntries = true)
    override fun upsert(user: UserAuthorization) {
        dbUserAuthorizationRepository.upsertUserAuthorization(UserAuthorizationEntity.fromUserAuthorization(user))
    }

    @Modifying
    @Transactional
    @CacheEvict(value = ["user_authorization"], allEntries = true)
    override fun upsertAll(users: List<UserAuthorization>) {
        users.forEach {
            dbUserAuthorizationRepository.upsertUserAuthorization(UserAuthorizationEntity.fromUserAuthorization(it))
        }
    }

    @Modifying
    @Transactional
    @CacheEvict(value = ["user_authorization"], allEntries = true)
    override fun saveLogin(
        hashedEmail: String,
        email: String,
        idpId: String?,
        sub: String?,
        loginDateUtc: ZonedDateTime,
    ) {
        dbUserAuthorizationRepository.saveLogin(hashedEmail, email, idpId, sub, loginDateUtc)
    }

    @Modifying
    @Transactional
    @CacheEvict(value = ["user_authorization"], allEntries = true)
    override fun delete(hashedEmail: String) {
        dbUserAuthorizationRepository.deleteById(hashedEmail)
    }

    @Modifying
    @Transactional
    @CacheEvict(value = ["user_authorization"], allEntries = true)
    override fun deleteAll(hashedEmails: List<String>) {
        dbUserAuthorizationRepository.deleteAllById(hashedEmails)
    }
}
