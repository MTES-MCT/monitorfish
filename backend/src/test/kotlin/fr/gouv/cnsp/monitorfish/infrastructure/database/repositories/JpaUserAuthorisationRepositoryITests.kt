package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaUserAuthorisationRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaUserAuthorizationRepository: JpaUserAuthorizationRepository

    @Test
    @Transactional
    fun `findByHashedEmail Should return a user`() {
        // Given
        val email = hash("dummy@email.gouv.fr")

        // When
        val user = jpaUserAuthorizationRepository.findByHashedEmail(email)

        // Then
        assertThat(user.isSuperUser).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `save Should save a user`() {
        // Given
        val email = hash("another_new_dummy@email.gouv.fr")

        // When
        jpaUserAuthorizationRepository.save(UserAuthorization(email, true))

        // Then
        val user = jpaUserAuthorizationRepository.findByHashedEmail(email)
        assertThat(user.isSuperUser).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `delete Should delete a user`() {
        // Given
        val email = hash("another_new_dummy@email.gouv.fr")
        jpaUserAuthorizationRepository.save(UserAuthorization(email, true))

        // When
        jpaUserAuthorizationRepository.delete(email)

        // Then
        val throwable = catchThrowable { jpaUserAuthorizationRepository.findByHashedEmail(email) }
        assertThat(throwable).isNotNull()
    }
}
