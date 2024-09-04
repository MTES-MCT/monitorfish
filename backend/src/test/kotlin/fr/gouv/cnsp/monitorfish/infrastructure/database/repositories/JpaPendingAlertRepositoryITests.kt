package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaPendingAlertRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPendingAlertRepository: JpaPendingAlertRepository

    @Test
    @Transactional
    fun `findAlertsOfTypes Should return an alert with the type entered`() {
        // Given
        val alertOne =
            PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert(),
            )
        jpaPendingAlertRepository.save(alertOne)

        // When
        val alerts = jpaPendingAlertRepository.findAlertsOfTypes(listOf(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT))

        // Then
        assertThat(alerts).hasSize(15)
        assertThat(alerts.first().externalReferenceNumber).isEqualTo("DONTSINK")
        assertThat(alerts.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(alerts.first().value.type).isEqualTo(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
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
        assertThat(alert.value.type).isEqualTo(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
        assertThat(alert.value.dml).isEqualTo("DML 13")
        assertThat(alert.value.seaFront).isEqualTo("NAMO")
    }
}
