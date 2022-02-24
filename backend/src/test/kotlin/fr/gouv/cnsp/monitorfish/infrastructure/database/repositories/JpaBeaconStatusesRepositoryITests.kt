package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@RunWith(SpringRunner::class)
class JpaBeaconStatusesRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaBeaconStatusesRepository: JpaBeaconStatusesRepository

    @Test
    @Transactional
    fun `findAll Should return all beacon statuses`() {
        // When
        val baconStatuses = jpaBeaconStatusesRepository.findAll()

        assertThat(baconStatuses).hasSize(9)
        assertThat(baconStatuses.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(baconStatuses.first().stage).isEqualTo(Stage.INITIAL_ENCOUNTER)
        assertThat(baconStatuses.first().vesselStatus).isEqualTo(VesselStatus.TECHNICAL_STOP)
    }

    @Test
    @Transactional
    fun `findAllExceptResumedTransmission Should return all beacon statuses except end of follow up`() {
        // When
        val baconStatuses = jpaBeaconStatusesRepository.findAllExceptEndOfFollowUp()

        assertThat(baconStatuses).hasSize(8)
        assertThat(baconStatuses.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(baconStatuses.first().stage).isEqualTo(Stage.INITIAL_ENCOUNTER)
        assertThat(baconStatuses.first().vesselStatus).isEqualTo(VesselStatus.TECHNICAL_STOP)
    }

    @Test
    @Transactional
    fun `findAllExceptResumedTransmission Should return last thirty end of follow up beacon statuses`() {
        // When
        val baconStatuses = jpaBeaconStatusesRepository.findLastThirtyEndOfFollowUp()

        assertThat(baconStatuses).hasSize(1)
        assertThat(baconStatuses.first().internalReferenceNumber).isEqualTo("FR263465414")
        assertThat(baconStatuses.first().stage).isEqualTo(Stage.END_OF_FOLLOW_UP)
        assertThat(baconStatuses.first().vesselStatus).isEqualTo(VesselStatus.AT_PORT)
    }

    @Test
    @Transactional
    fun `update Should update vesselStatus When not null`() {
        // Given
        val controlObjectives = jpaBeaconStatusesRepository.findAll()
        val updateDateTime = ZonedDateTime.now()

        // When
        assertThat(controlObjectives.find { it.id == 1 }?.vesselStatus).isEqualTo(VesselStatus.TECHNICAL_STOP)
        jpaBeaconStatusesRepository.update(
                id = 1,
                vesselStatus = VesselStatus.ACTIVITY_DETECTED,
                null,
                updateDateTime)

        // Then
        val updatedBeaconStatus = jpaBeaconStatusesRepository.findAll().find { it.id == 1 }
        assertThat(updatedBeaconStatus?.vesselStatus).isEqualTo(VesselStatus.ACTIVITY_DETECTED)
        assertThat(updatedBeaconStatus?.vesselStatusLastModificationDateTime).isEqualTo(updateDateTime)
    }
}
