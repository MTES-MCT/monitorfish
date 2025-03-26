package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaVesselGroupRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaVesselGroupRepository: JpaVesselGroupRepository

    @Test
    @Transactional
    fun `findAllByUser Should return all vessel groups`() {
        // When
        val vesselGroups = jpaVesselGroupRepository.findAllByUser("dummy@email.gouv.fr")

        // Then
        assertThat(vesselGroups).hasSize(3)

        val dynamicGroup = vesselGroups.first() as DynamicVesselGroup
        assertThat(dynamicGroup.name).isEqualTo("Mission Thémis – chaluts de fonds")
        assertThat(dynamicGroup.filters).isInstanceOf(VesselGroupFilters::class.java)
        assertThat(dynamicGroup.filters.countryCodes).isEqualTo(listOf("FR", "ES", "IT"))
        assertThat(dynamicGroup.filters.fleetSegments).isEqualTo(listOf<String>())
        assertThat(dynamicGroup.filters.gearCodes).isEqualTo(listOf("OTB", "OTM", "TBB", "PTB"))

        val fixedGroup = vesselGroups.last() as FixedVesselGroup
        assertThat(fixedGroup.name).isEqualTo("Mission Thémis – semaine 04")
        assertThat(fixedGroup.vessels).hasOnlyElementsOfTypes(VesselIdentity::class.java)
        assertThat(fixedGroup.vessels).hasSize(6)
        assertThat(fixedGroup.vessels.first().vesselId).isEqualTo(1)
        assertThat(fixedGroup.vessels.first().cfr).isEqualTo("FAK000999999")
    }

    @Test
    @Transactional
    fun `save Should save a dynamic group`() {
        // Given
        val previousGroups = jpaVesselGroupRepository.findAllByUser("dummy@email.gouv.fr")
        assertThat(previousGroups).hasSize(3)
        val expectedGroup = getDynamicVesselGroups().first().copy(id = null)

        // When
        val savedGroup = jpaVesselGroupRepository.save(expectedGroup)
        val updatedGroups = jpaVesselGroupRepository.findAllByUser("dummy@email.gouv.fr")

        // Then
        assertThat(savedGroup).isEqualTo(expectedGroup.copy(id = 4))
        assertThat(updatedGroups).hasSize(4)
    }

    @Test
    @Transactional
    fun `delete Should delete a dynamic group`() {
        // Given
        val previousGroups = jpaVesselGroupRepository.findAllByUser("dummy@email.gouv.fr")
        assertThat(previousGroups).hasSize(3)

        // When
        jpaVesselGroupRepository.delete(1)
        val updatedGroups = jpaVesselGroupRepository.findAllByUser("dummy@email.gouv.fr")

        // Then
        assertThat(updatedGroups).hasSize(2)
    }
}
