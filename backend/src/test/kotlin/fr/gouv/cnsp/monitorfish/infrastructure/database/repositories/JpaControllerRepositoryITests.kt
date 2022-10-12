package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaControllerRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaControllerRepository: JpaControllerRepository

    @Test
    @Transactional
    fun `findAll Should return all controllers`() {
        // When
        val controllers = jpaControllerRepository.findAll()

        // Then
        assertThat(controllers).hasSize(2)
        assertThat(controllers.first().controller).isEqualTo("ULAM 56")
        assertThat(controllers.first().administration).isEqualTo("Affaires Maritimes")
        assertThat(controllers.first().controllerType).isEqualTo("Terrestre")
    }
}
