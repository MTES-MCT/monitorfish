package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

class JpaUserAuthorisationRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaUserAuthorizationRepository: JpaUserAuthorizationRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("user_authorization")?.clear()
    }

    @Test
    @Transactional
    fun `findByHashedEmail Should return a user`() {
        // Given
        val email = hash("dummy@email.gouv.fr")

        // When
        val user = jpaUserAuthorizationRepository.findByHashedEmail(email)

        // Then
        assertThat(user.isSuperUser).isEqualTo(true)
        assertThat(user.service).isEqualTo(CnspService.POLE_OPS_METROPOLE)
        assertThat(user.isAdministrator).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `upsert Should save a user`() {
        // Given
        val email = hash("another_new_dummy@email.gouv.fr")

        // When
        jpaUserAuthorizationRepository.upsert(
            UserAuthorization(
                hashedEmail = email,
                isSuperUser = true,
                service = CnspService.POLE_OPS_METROPOLE,
                isAdministrator = false,
            ),
        )

        // Then
        val user = jpaUserAuthorizationRepository.findByHashedEmail(email)
        assertThat(user.isSuperUser).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `upsert Should update a user`() {
        // Given
        val email = hash("dummy@email.gouv.fr")

        // When
        jpaUserAuthorizationRepository.upsert(
            UserAuthorization(
                hashedEmail = email,
                isSuperUser = true,
                service = CnspService.POLE_SIP,
                isAdministrator = false,
            ),
        )

        // Then
        val user = jpaUserAuthorizationRepository.findByHashedEmail(email)
        assertThat(user.service).isEqualTo(CnspService.POLE_SIP)
    }

    @Test
    @Transactional
    fun `delete Should delete a user`() {
        // Given
        val email = hash("another_new_dummy@email.gouv.fr")
        jpaUserAuthorizationRepository.upsert(
            UserAuthorization(
                hashedEmail = email,
                isSuperUser = true,
                service = CnspService.POLE_OPS_METROPOLE,
                isAdministrator = false,
            ),
        )

        // When
        jpaUserAuthorizationRepository.delete(email)

        // Then
        val throwable = catchThrowable { jpaUserAuthorizationRepository.findByHashedEmail(email) }
        assertThat(throwable).isNotNull()
    }
}
