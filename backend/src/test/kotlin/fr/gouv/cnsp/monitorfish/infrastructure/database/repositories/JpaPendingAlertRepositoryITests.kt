package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import jakarta.persistence.EntityManager
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaPendingAlertRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPendingAlertRepository: JpaPendingAlertRepository

    @Autowired
    private lateinit var entityManager: EntityManager

    @Test
    @Transactional
    fun `findAlertsOfTypes Should return an alert with the type entered`() {
        // Given
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
        jpaPendingAlertRepository.save(positionAlertOne)

        // When
        val alerts = jpaPendingAlertRepository.findAlertsOfTypes(listOf(AlertType.POSITION_ALERT))

        // Then
        assertThat(alerts).hasSize(17)
        assertThat(alerts.first().externalReferenceNumber).isEqualTo("DONTSINK")
        assertThat(alerts.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(alerts.first().value.type).isEqualTo(AlertType.POSITION_ALERT)
        assertThat(alerts.last().vesselId).isEqualTo(123)
    }

    @Test
    @Transactional
    fun `find Should return an alert with the dml found in the value object`() {
        // When
        val alert = jpaPendingAlertRepository.find(1)

        // Then
        assertThat(alert.externalReferenceNumber).isEqualTo("DONTSINK")
        assertThat(alert.internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(alert.value.type).isEqualTo(AlertType.POSITION_ALERT)
        assertThat(alert.value.dml).isEqualTo("DML 13")
        assertThat(alert.value.seaFront).isEqualTo("NAMO")
    }

    @Test
    @Transactional
    fun `deleteAllByAlertId should delete all pending alerts with the given alertId `() {
        // Given
        val pendingPositionAlerts = jpaPendingAlertRepository.findAlertsOfTypes(listOf(AlertType.POSITION_ALERT))

        val pendingAlert = pendingPositionAlerts.first()
        val alertIdToDelete = pendingAlert.value.alertId!!

        // When
        jpaPendingAlertRepository.deleteAllByAlertId(alertIdToDelete)

        // Then
        // We need to clear the persistence context to not retrieve the deleted alert
        entityManager.clear()
        assertThrows<NoSuchElementException> {
            jpaPendingAlertRepository.find(pendingAlert.id!!)
        }
    }
}
