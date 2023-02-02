package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.InfractionCategory
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaInfractionRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaInfractionRepository: JpaInfractionRepository

    @Test
    @Transactional
    fun `findInfractionByNatinfCode Should return the infraction`() {
        // When
        val infraction = jpaInfractionRepository.findInfractionByNatinfCode("23581")

        // Then
        assertThat(infraction.infraction).isEqualTo("Taille de maille non réglementaire")
        assertThat(infraction.infractionCategory).isEqualTo(InfractionCategory.FISHING)
        assertThat(infraction.natinfCode).isEqualTo("23581")
        assertThat(infraction.regulation).isEqualTo("Arreté du 12/01/3021")
    }

    @Test
    @Transactional
    fun `findInfractionByNatinfCode Should throw an exception When the natinf code is not found`() {
        // When
        val throwable = catchThrowable {
            jpaInfractionRepository.findInfractionByNatinfCode("666")
        }

        // Then
        assertThat(throwable.message).contains("NATINF code 666 not found")
    }

    @Test
    @Transactional
    fun `findFishingInfractions Should throw an exception When the natinf code is not found`() {
        // When
        val infractions = jpaInfractionRepository.findFishingInfractions()

        // Then
        assertThat(infractions).hasSize(7)
        assertThat(infractions.first().natinfCode).isEqualTo("23581")
        assertThat(infractions.first().regulation).isEqualTo("Arreté du 12/01/3021")
        assertThat(infractions.first().infraction).isEqualTo("Taille de maille non réglementaire")
        assertThat(infractions.first().infractionCategory).isEqualTo(InfractionCategory.FISHING)
    }
}
