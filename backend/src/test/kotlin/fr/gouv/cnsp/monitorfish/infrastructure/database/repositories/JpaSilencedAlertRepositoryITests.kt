package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
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
    fun `save Should save a silenced alert created from scratch`() {
        // Given
        val now = ZonedDateTime.now()
        val positionAlertToSilence =
            SilencedAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Chalutage dans les 3 milles",
                    ),
                silencedBeforeDate = now.plusDays(25),
            )

        // When
        val silencedAlert = jpaSilencedAlertRepository.save(positionAlertToSilence)

        // Then
        assertThat(silencedAlert.internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(silencedAlert.externalReferenceNumber).isEqualTo("RGD")
        assertThat(silencedAlert.value.type).isEqualTo(AlertType.POSITION_ALERT)
        assertThat(silencedAlert.silencedBeforeDate).isEqualTo(now.plusDays(25))
        assertThat(silencedAlert.wasValidated).isNull()

        val alerts = jpaSilencedAlertRepository.findAllCurrentSilencedAlerts()
        assertThat(alerts).hasSize(5)
    }

    @Test
    @Transactional
    fun `save Should save a silenced alert from the pending alert`() {
        // Given
        val now = ZonedDateTime.now()
        val positionAlertOne =
            PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Chalutage dans les 3 milles",
                    ),
            )

        // When
        val silencedAlert = jpaSilencedAlertRepository.save(positionAlertOne, now.plusHours(1), false)

        // Then
        assertThat(silencedAlert.internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(silencedAlert.externalReferenceNumber).isEqualTo("RGD")
        assertThat(silencedAlert.value.type).isEqualTo(AlertType.POSITION_ALERT)
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
        val positionAlertOne =
            PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = null,
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Chalutage dans les 3 milles",
                    ),
            )

        // When
        val silencedAlert = jpaSilencedAlertRepository.save(positionAlertOne, now.plusHours(1), false)

        // Then
        assertThat(silencedAlert.internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(silencedAlert.externalReferenceNumber).isEqualTo("RGD")
        assertThat(silencedAlert.value.type).isEqualTo(AlertType.POSITION_ALERT)
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
        val positionAlertOne =
            PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Chalutage dans les 3 milles",
                    ),
            )
        jpaSilencedAlertRepository.save(positionAlertOne, now, false)

        // When
        val alerts = jpaSilencedAlertRepository.findAllCurrentSilencedAlerts()

        // Then, the last inserted alert is not fetched
        assertThat(alerts).hasSize(4)
    }
}
