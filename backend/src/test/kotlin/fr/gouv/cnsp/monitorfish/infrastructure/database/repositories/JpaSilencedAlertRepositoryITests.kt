package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaSilencedAlertRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaSilencedAlertRepository: JpaSilencedAlertRepository

    @Test
    @Transactional
    fun `save Should save a silenced alert from the pending alert`() {
        // Given
        val now = ZonedDateTime.now()
        val alertOne = PendingAlert(
            internalReferenceNumber = "FRFGRGR",
            externalReferenceNumber = "RGD",
            ircs = "6554fEE",
            vesselId = 123,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            tripNumber = "123456",
            creationDate = ZonedDateTime.now(),
            value = ThreeMilesTrawlingAlert(),
        )

        // When
        val silencedAlert = jpaSilencedAlertRepository.save(alertOne, now.plusHours(1), false)

        // Then
        assertThat(silencedAlert.internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(silencedAlert.externalReferenceNumber).isEqualTo("RGD")
        assertThat(silencedAlert.value.type).isEqualTo(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
        assertThat(silencedAlert.silencedBeforeDate).isEqualTo(now.plusHours(1))
        assertThat(silencedAlert.wasValidated).isEqualTo(false)

        val alerts = jpaSilencedAlertRepository.findAllCurrentSilencedAlerts()
        assertThat(alerts).hasSize(5)
    }

    @Test
    @Transactional
    fun `save Should save a silenced alert When the ircs is null`() {
        // Given
        val now = ZonedDateTime.now()
        val alertOne = PendingAlert(
            internalReferenceNumber = "FRFGRGR",
            externalReferenceNumber = "RGD",
            ircs = null,
            vesselId = 123,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            tripNumber = "123456",
            creationDate = ZonedDateTime.now(),
            value = ThreeMilesTrawlingAlert(),
        )

        // When
        val silencedAlert = jpaSilencedAlertRepository.save(alertOne, now.plusHours(1), false)

        // Then
        assertThat(silencedAlert.internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(silencedAlert.externalReferenceNumber).isEqualTo("RGD")
        assertThat(silencedAlert.value.type).isEqualTo(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
        assertThat(silencedAlert.silencedBeforeDate).isEqualTo(now.plusHours(1))

        val alerts = jpaSilencedAlertRepository.findAllCurrentSilencedAlerts()
        assertThat(alerts).hasSize(5)
    }

    @Test
    @Transactional
    fun `findAllCurrentSilencedAlerts Should not return silenced alerts silenced before now`() {
        // Given
        assertThat(jpaSilencedAlertRepository.findAllCurrentSilencedAlerts()).hasSize(4)
        val now = ZonedDateTime.now()
        val alertOne = PendingAlert(
            internalReferenceNumber = "FRFGRGR",
            externalReferenceNumber = "RGD",
            ircs = "6554fEE",
            vesselId = 123,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            tripNumber = "123456",
            creationDate = ZonedDateTime.now(),
            value = ThreeMilesTrawlingAlert(),
        )
        jpaSilencedAlertRepository.save(alertOne, now, false)

        // When
        val alerts = jpaSilencedAlertRepository.findAllCurrentSilencedAlerts()

        // Then, the last inserted alert is not fetched
        assertThat(alerts).hasSize(4)
    }
}
