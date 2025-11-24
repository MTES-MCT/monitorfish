package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.fakers.VesselContactToUpdateFaker.Companion.fakeVesselContactToUpdate
import jakarta.transaction.Transactional
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

class JpaVesselContactToUpdateRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaVesselContactToUpdateRepository: JpaVesselContactToUpdateRepository

    @Transactional
    @Test
    fun `save should return the saved entity`() {
        // Given
        val vesselContactToUpdate = fakeVesselContactToUpdate(id = null)

        // When
        val savedVesselContact = jpaVesselContactToUpdateRepository.save(vesselContactToUpdate)

        // Then
        assertThat(savedVesselContact).usingRecursiveComparison().ignoringFields("id").isEqualTo(vesselContactToUpdate)
        assertThat(savedVesselContact.id).isNotNull()
    }

    @Transactional
    @Test
    fun `save should updated the entity`() {
        // Given
        val initialVesselContactToUpdate = fakeVesselContactToUpdate(id = null)
        val savedVesselContactToUpdate = jpaVesselContactToUpdateRepository.save(initialVesselContactToUpdate)

        // When
        val vesselContactToUpdate =
            fakeVesselContactToUpdate(id = savedVesselContactToUpdate.id, contactMethod = "New Contact Method")
        val updatedVesselContactToUpdate = jpaVesselContactToUpdateRepository.save(vesselContactToUpdate)

        // Then
        assertThat(vesselContactToUpdate).usingRecursiveComparison().isEqualTo(updatedVesselContactToUpdate)
    }

    @Transactional
    @Test
    fun `findByVesselId should return null when VesselContact doesnt exist`() {
        // Given
        val vesselIdWithoutVesselContactToUpdate = 1

        // When
        val vesselContactToUpdateFound =
            jpaVesselContactToUpdateRepository.findByVesselId(
                vesselIdWithoutVesselContactToUpdate,
            )

        // Then
        assertThat(vesselContactToUpdateFound).isNull()
    }

    @Transactional
    @Test
    fun `findByVesselId should return VesselContact from its vesselId`() {
        // Given
        val initialVesselContactToUpdate = fakeVesselContactToUpdate(id = null, vesselId = 1)
        val savedVesselContact = jpaVesselContactToUpdateRepository.save(initialVesselContactToUpdate)

        // When
        val vesselContactToUpdateFound = jpaVesselContactToUpdateRepository.findByVesselId(savedVesselContact.vesselId)

        // Then
        assertThat(savedVesselContact).usingRecursiveComparison().isEqualTo(vesselContactToUpdateFound)
    }
}
