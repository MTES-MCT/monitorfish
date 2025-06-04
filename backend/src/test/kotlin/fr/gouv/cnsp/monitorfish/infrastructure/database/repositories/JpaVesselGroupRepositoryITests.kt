package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
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
    fun `findAllByUserAndSharing Should return all vessel groups for the user`() {
        // When
        val vesselGroups =
            jpaVesselGroupRepository
                .findAllByUserAndSharing("dummy@email.gouv.fr", CnspService.POLE_OPS_METROPOLE)

        // Then
        assertThat(vesselGroups).hasSize(3)

        val dynamicGroup = vesselGroups.first() as DynamicVesselGroup
        assertThat(dynamicGroup.name).isEqualTo("Mission Thémis – chaluts de fonds")
        assertThat(dynamicGroup.filters).isInstanceOf(VesselGroupFilters::class.java)
        assertThat(dynamicGroup.filters.countryCodes).isEqualTo(listOf(CountryCode.FR, CountryCode.ES, CountryCode.IT))
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
    fun `findAllByUserAndSharing Should return all vessel groups When user in the same service`() {
        // When
        val vesselGroups =
            jpaVesselGroupRepository
                .findAllByUserAndSharing("not_the_owner@email.gouv.fr", CnspService.POLE_OPS_METROPOLE)

        // Then
        assertThat(vesselGroups).hasSize(1)

        val dynamicGroup = vesselGroups.first() as DynamicVesselGroup
        assertThat(dynamicGroup.name).isEqualTo("Mission Thémis – semaine 03")
    }

    @Test
    @Transactional
    fun `upsert Should save a dynamic group When sharedTo is given`() {
        // Given
        val previousGroups = jpaVesselGroupRepository.findAllByUserAndSharing("dummy@email.gouv.fr", null)
        assertThat(previousGroups).hasSize(3)
        val expectedGroup = getDynamicVesselGroups().first().copy(id = null, sharedTo = listOf(CnspService.POLE_OPS_METROPOLE))

        // When
        val savedGroup = jpaVesselGroupRepository.upsert(expectedGroup)
        val updatedGroups = jpaVesselGroupRepository.findAllByUserAndSharing("dummy@email.gouv.fr", null)

        // Then
        assertThat(savedGroup).isEqualTo(expectedGroup.copy(id = 4))
        assertThat(updatedGroups).hasSize(4)
    }

    @Test
    @Transactional
    fun `upsert Should update a dynamic group`() {
        // Given
        val previousGroups = jpaVesselGroupRepository.findAllByUserAndSharing("dummy@email.gouv.fr", null)
        assertThat(previousGroups).hasSize(3)
        val expectedGroup = getDynamicVesselGroups().first()

        // When
        val savedGroup = jpaVesselGroupRepository.upsert(expectedGroup)
        val updatedGroups = jpaVesselGroupRepository.findAllByUserAndSharing("dummy@email.gouv.fr", null)

        // Then
        assertThat(savedGroup.id).isEqualTo(expectedGroup.id)
        assertThat(savedGroup.name).isEqualTo(expectedGroup.name)
        assertThat(updatedGroups).hasSize(3)
    }

    @Test
    @Transactional
    fun `delete Should delete a dynamic group`() {
        // Given
        val previousGroups = jpaVesselGroupRepository.findAllByUserAndSharing("dummy@email.gouv.fr", null)
        assertThat(previousGroups).hasSize(3)

        // When
        jpaVesselGroupRepository.delete(1)
        val updatedGroups = jpaVesselGroupRepository.findAllByUserAndSharing("dummy@email.gouv.fr", null)

        // Then
        assertThat(updatedGroups).hasSize(2)
    }
}
