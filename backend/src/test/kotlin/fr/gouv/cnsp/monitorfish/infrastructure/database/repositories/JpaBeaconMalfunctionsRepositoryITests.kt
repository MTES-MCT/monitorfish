package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.EndOfBeaconMalfunctionReason
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselStatus
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.within
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit

class JpaBeaconMalfunctionsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaBeaconMalfunctionsRepository: JpaBeaconMalfunctionsRepository

    @Test
    @Transactional
    fun `findAll Should return all beacon malfunctions`() {
        // When
        val baconMalfunctions = jpaBeaconMalfunctionsRepository.findAll()

        assertThat(baconMalfunctions).hasSize(12)
        assertThat(baconMalfunctions.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(baconMalfunctions.first().stage).isEqualTo(Stage.INITIAL_ENCOUNTER)
        assertThat(baconMalfunctions.first().vesselStatus).isEqualTo(VesselStatus.ACTIVITY_DETECTED)
    }

    @Test
    @Transactional
    fun `findAllExceptArchived Should return all beacon malfunctions except end of follow up`() {
        // When
        val baconMalfunctions = jpaBeaconMalfunctionsRepository.findAllExceptArchived()

        assertThat(baconMalfunctions).hasSize(11)
        assertThat(baconMalfunctions.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(baconMalfunctions.first().stage).isEqualTo(Stage.INITIAL_ENCOUNTER)
        assertThat(baconMalfunctions.first().vesselStatus).isEqualTo(VesselStatus.ACTIVITY_DETECTED)
    }

    @Test
    @Transactional
    fun `findLastSixtyArchived Should return last thirty end of follow up beacon malfunctions`() {
        // When
        val baconMalfunctions = jpaBeaconMalfunctionsRepository.findLastSixtyArchived()

        assertThat(baconMalfunctions).hasSize(1)
        assertThat(baconMalfunctions.first().internalReferenceNumber).isEqualTo("FR263465414")
        assertThat(baconMalfunctions.first().stage).isEqualTo(Stage.ARCHIVED)
        assertThat(baconMalfunctions.first().vesselStatus).isEqualTo(VesselStatus.ON_SALE)
    }

    @Test
    @Transactional
    fun `update Should update vesselStatus When not null`() {
        // Given
        val beaconMalfunctions = jpaBeaconMalfunctionsRepository.findAll()
        val updateDateTime = ZonedDateTime.now()

        // When
        assertThat(beaconMalfunctions.find { it.id == 1 }?.vesselStatus).isEqualTo(VesselStatus.ACTIVITY_DETECTED)
        jpaBeaconMalfunctionsRepository.update(
            id = 1,
            vesselStatus = VesselStatus.AT_SEA,
            null,
            null,
            updateDateTime,
        )

        // Then
        val updatedBeaconMalfunction = jpaBeaconMalfunctionsRepository.findAll().find { it.id == 1 }
        assertThat(updatedBeaconMalfunction?.vesselStatus).isEqualTo(VesselStatus.AT_SEA)
        assertThat(updatedBeaconMalfunction?.vesselStatusLastModificationDateTime).isCloseTo(
            updateDateTime,
            within(100, ChronoUnit.MILLIS),
        )
    }

    @Test
    @Transactional
    fun `update Should update end of beacon malfunction reason and end of malfunction date time When not null`() {
        // Given
        val beaconMalfunctions = jpaBeaconMalfunctionsRepository.findAll()
        val updateDateTime = ZonedDateTime.now()

        // When
        assertThat(beaconMalfunctions.find { it.id == 1 }?.vesselStatus).isEqualTo(VesselStatus.ACTIVITY_DETECTED)
        jpaBeaconMalfunctionsRepository.update(
            id = 1,
            null,
            Stage.END_OF_MALFUNCTION,
            EndOfBeaconMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED,
            updateDateTime,
        )

        // Then
        val updatedBeaconMalfunction = jpaBeaconMalfunctionsRepository.findAll().find { it.id == 1 }
        assertThat(updatedBeaconMalfunction?.stage).isEqualTo(Stage.END_OF_MALFUNCTION)
        assertThat(updatedBeaconMalfunction?.vesselStatusLastModificationDateTime).isCloseTo(
            updateDateTime,
            within(100, ChronoUnit.MILLIS),
        )
        assertThat(updatedBeaconMalfunction?.endOfBeaconMalfunctionReason).isEqualTo(
            EndOfBeaconMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED,
        )
        assertThat(updatedBeaconMalfunction?.malfunctionEndDateTime).isCloseTo(
            updateDateTime,
            within(100, ChronoUnit.MILLIS),
        )
    }

    @Test
    @Transactional
    fun `requestNotification Should update the requestNotification field`() {
        // Given
        val initialBeaconMalfunction = jpaBeaconMalfunctionsRepository.findAll().find { it.id == 2 }
        assertThat(initialBeaconMalfunction?.notificationRequested).isNull()

        // When
        jpaBeaconMalfunctionsRepository
            .requestNotification(2, BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION, null)

        // then
        val updatedBeaconMalfunction = jpaBeaconMalfunctionsRepository.findAll().find { it.id == 2 }
        assertThat(updatedBeaconMalfunction?.notificationRequested).isEqualTo(
            BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION,
        )
    }

    @Test
    @Transactional
    fun `requestNotification Should update the requestNotification and foreignFmcCode fields`() {
        // Given
        val initialBeaconMalfunction = jpaBeaconMalfunctionsRepository.findAll().find { it.id == 2 }
        assertThat(initialBeaconMalfunction?.notificationRequested).isNull()

        // When
        jpaBeaconMalfunctionsRepository
            .requestNotification(2, BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC, "ABC")

        // then
        val updatedBeaconMalfunction = jpaBeaconMalfunctionsRepository.findAll().find { it.id == 2 }
        assertThat(updatedBeaconMalfunction?.notificationRequested).isEqualTo(
            BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC,
        )
        assertThat(updatedBeaconMalfunction?.requestedNotificationForeignFmcCode).isEqualTo("ABC")
    }
}
