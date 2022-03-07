package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselStatus
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@RunWith(SpringRunner::class)
class JpaBeaconMalfunctionsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaBeaconMalfunctionsRepository: JpaBeaconMalfunctionsRepository

    @Test
    @Transactional
    fun `findAll Should return all beacon malfunctions`() {
        // When
        val baconMalfunctions = jpaBeaconMalfunctionsRepository.findAll()

        assertThat(baconMalfunctions).hasSize(9)
        assertThat(baconMalfunctions.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(baconMalfunctions.first().stage).isEqualTo(Stage.INITIAL_ENCOUNTER)
        assertThat(baconMalfunctions.first().vesselStatus).isEqualTo(VesselStatus.TECHNICAL_STOP)
    }

    @Test
    @Transactional
    fun `findAllExceptResumedTransmission Should return all beacon malfunctions except end of follow up`() {
        // When
        val baconMalfunctions = jpaBeaconMalfunctionsRepository.findAllExceptEndOfFollowUp()

        assertThat(baconMalfunctions).hasSize(8)
        assertThat(baconMalfunctions.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(baconMalfunctions.first().stage).isEqualTo(Stage.INITIAL_ENCOUNTER)
        assertThat(baconMalfunctions.first().vesselStatus).isEqualTo(VesselStatus.TECHNICAL_STOP)
    }

    @Test
    @Transactional
    fun `findAllExceptResumedTransmission Should return last thirty end of follow up beacon statuses`() {
        // When
        val baconMalfunctions = jpaBeaconMalfunctionsRepository.findLastThirtyEndOfFollowUp()

        assertThat(baconMalfunctions).hasSize(1)
        assertThat(baconMalfunctions.first().internalReferenceNumber).isEqualTo("FR263465414")
        assertThat(baconMalfunctions.first().stage).isEqualTo(Stage.ARCHIVED)
        assertThat(baconMalfunctions.first().vesselStatus).isEqualTo(VesselStatus.AT_PORT)
    }

    @Test
    @Transactional
    fun `update Should update vesselStatus When not null`() {
        // Given
        val controlObjectives = jpaBeaconMalfunctionsRepository.findAll()
        val updateDateTime = ZonedDateTime.now()

        // When
        assertThat(controlObjectives.find { it.id == 1 }?.vesselStatus).isEqualTo(VesselStatus.TECHNICAL_STOP)
        jpaBeaconMalfunctionsRepository.update(
                id = 1,
                vesselStatus = VesselStatus.ACTIVITY_DETECTED,
                null,
                updateDateTime)

        // Then
        val updatedBeaconMalfunction = jpaBeaconMalfunctionsRepository.findAll().find { it.id == 1 }
        assertThat(updatedBeaconMalfunction?.vesselStatus).isEqualTo(VesselStatus.ACTIVITY_DETECTED)
        assertThat(updatedBeaconMalfunction?.vesselStatusLastModificationDateTime).isEqualTo(updateDateTime)
    }
}
