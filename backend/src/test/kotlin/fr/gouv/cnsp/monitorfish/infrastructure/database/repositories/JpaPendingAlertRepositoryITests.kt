package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@RunWith(SpringRunner::class)
class JpaPendingAlertRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaPendingAlertRepository: JpaPendingAlertRepository

    @Test
    @Transactional
    fun `findAlertsOfTypes Should return an alert with the type entered`() {
        // Given
        val alertOne = PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                tripNumber = 123456,
                creationDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert())
        jpaPendingAlertRepository.save(alertOne)

        // When
        val alerts = jpaPendingAlertRepository.findAlertsOfTypes(listOf(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT))

        // Then
        assertThat(alerts).hasSize(15)
        assertThat(alerts.first().externalReferenceNumber).isEqualTo("DONTSINK")
        assertThat(alerts.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(alerts.first().value.type).isEqualTo(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
    }
}
