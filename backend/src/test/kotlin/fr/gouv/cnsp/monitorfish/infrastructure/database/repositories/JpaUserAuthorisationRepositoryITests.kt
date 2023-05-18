package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.hash
import org.assertj.core.api.Assertions.assertThat
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
}
