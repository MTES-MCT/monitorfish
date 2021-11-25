package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.PNOAndLANWeightToleranceAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import java.util.*

@RunWith(SpringRunner::class)
class JpaAlertRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaAlertRepository: JpaAlertRepository

    @Test
    @Transactional
    fun `findAlertsOfTypes Should return all alert of a specific rule`() {
        // Given
        val alertOne = Alert(
                id = UUID.randomUUID(),
                name = AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT.name,
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                tripNumber = 123456,
                creationDate = ZonedDateTime.now(),
                value = PNOAndLANWeightToleranceAlert())
        jpaAlertRepository.save(alertOne)

        val alertTwo = Alert(
                id = UUID.randomUUID(),
                name = AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT.name,
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                tripNumber = 123456,
                creationDate = ZonedDateTime.now(),
                value = PNOAndLANWeightToleranceAlert())
        jpaAlertRepository.save(alertTwo)

        // When
        val alerts = jpaAlertRepository.findAlertsOfTypes(
                listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
        "FRFGRGR",
                123456)

        // Then
        assertThat(alerts).hasSize(2)
    }

    @Test
    @Transactional
    fun `findAlertsOfTypes Should return no alert When the rule name is wrong`() {
        // Given
        val alertOne = Alert(
                id = UUID.randomUUID(),
                name = "BAD_RULE_NAME",
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                tripNumber = 123456,
                creationDate = ZonedDateTime.now(),
                value = PNOAndLANWeightToleranceAlert())
        jpaAlertRepository.save(alertOne)

        // When
        val alerts = jpaAlertRepository.findAlertsOfTypes(
                listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
                "FRFGRGR",
                123456)

        // Then
        assertThat(alerts).hasSize(0)
    }

    @Test
    @Transactional
    fun `findAlertsOfTypes Should return an alert with the type entered`() {
        // Given
        val alertOne = Alert(
                id = UUID.randomUUID(),
                name = AlertTypeMapping.THREE_MILES_TRAWLING_ALERT.name,
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                tripNumber = 123456,
                creationDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert(speed = 2.36, numberOfIncursion = 3))
        jpaAlertRepository.save(alertOne)

        // When
        val alerts = jpaAlertRepository.findAlertsOfTypes(listOf(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT))

        // Then
        assertThat(alerts).hasSize(15)
        assertThat(alerts.first().externalReferenceNumber).isEqualTo("DONTSINK")
        assertThat(alerts.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(alerts.first().value.name).isEqualTo(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
    }
}
