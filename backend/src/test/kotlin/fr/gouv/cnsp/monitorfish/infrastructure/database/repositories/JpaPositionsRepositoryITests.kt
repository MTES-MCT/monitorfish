package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional


@RunWith(SpringRunner::class)
@SpringBootTest
class JpaPositionsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaPositionRepository: JpaPositionsRepository

    @Test
    @Transactional
    fun `findAll Should return the list of positions referential`() {
        // When
        val sensors = jpaPositionRepository.findAll()

        // Then
        assertThat(sensors).isNotEmpty
        assertThat(sensors).hasSize(3)
    }
}