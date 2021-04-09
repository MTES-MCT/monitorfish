package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional

@RunWith(SpringRunner::class)
class JpaInfractionRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaInfractionRepository: JpaInfractionRepository

    @Test
    @Transactional
    fun `findInfractions Should return infractions by ids`() {
        // When
        val infractions = jpaInfractionRepository.findInfractions(listOf(5, 22))

        // Then
        assertThat(infractions).hasSize(2)
        assertThat(infractions.first().infraction).isEqualTo("Taille de maille non réglementaire")
        assertThat(infractions.first().infractionCategory).isEqualTo("Pêche")
        assertThat(infractions.first().natinfCode).isEqualTo("23581")
        assertThat(infractions.first().regulation).isEqualTo("Arreté du 12/01/3021")
    }

    @Test
    @Transactional
    fun `findInfractions Should return an empty list`() {
        // When
        val infractions = jpaInfractionRepository.findInfractions(listOf(666))

        // Then
        assertThat(infractions).hasSize(0)
    }

}
