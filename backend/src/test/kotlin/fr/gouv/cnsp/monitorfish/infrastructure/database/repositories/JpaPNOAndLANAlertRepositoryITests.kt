package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.PNOAndLANWeightToleranceAlert
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import java.util.*

class JpaPNOAndLANAlertRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaAlertRepository: JpaPNOAndLANAlertRepository

    @Test
    @Transactional
    fun `findAlertsOfTypes Should return all alert of a specific rule`() {
        // Given
        val alertOne =
            PNOAndLANAlert(
                id = UUID.randomUUID(),
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value = PNOAndLANWeightToleranceAlert(),
            )
        jpaAlertRepository.save(alertOne)

        val alertTwo =
            PNOAndLANAlert(
                id = UUID.randomUUID(),
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value = PNOAndLANWeightToleranceAlert(),
            )
        jpaAlertRepository.save(alertTwo)

        // When
        val alerts =
            jpaAlertRepository.findAlertsOfTypes(
                listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
                "FRFGRGR",
                "123456",
            )

        // Then
        assertThat(alerts).hasSize(2)
    }

    @Test
    @Transactional
    fun `findAlertsOfTypes Should return no alert When the rule name is wrong`() {
        // Given
        val alertOne =
            PNOAndLANAlert(
                id = UUID.randomUUID(),
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value = PNOAndLANWeightToleranceAlert(),
            )
        jpaAlertRepository.save(alertOne)

        // When
        val alerts =
            jpaAlertRepository.findAlertsOfTypes(
                listOf(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT),
                "FRFGRGR",
                "123456",
            )

        // Then
        assertThat(alerts).hasSize(0)
    }
}
