package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.NonCompliantTrip
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.RiskElementMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaVesselRiskElementRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaVesselRiskElementRepository: JpaVesselRiskElementRepository

    @Test
    @Transactional
    fun `findAllByCfr Should return the risk elements computed from trips`() {
        // When
        val riskElements = jpaVesselRiskElementRepository.findAllByCfr("FAK000999999")

        // Then
        assertThat(riskElements.map { it.code }).containsExactly("MOT_MR", "PNO_MR")

        val marginOfTolerance = riskElements.first()
        assertThat(marginOfTolerance.name).isEqualTo("Exceeding the margin of tolerance")
        assertThat(marginOfTolerance.riskLevel).isEqualTo(4)
        assertThat(marginOfTolerance.metrics).isEqualTo(
            RiskElementMetrics.Trips(
                totalTrips = 4,
                compliantTrips = 2,
                shareOfNonCompliantTrips = 0.5,
                nonCompliantTrips =
                    listOf(
                        NonCompliantTrip(
                            tripNumber = "9463714",
                            startDateTimeUtc = ZonedDateTime.parse("2019-02-17T01:05:00Z"),
                            endDateTimeUtc = ZonedDateTime.parse("2020-08-09T13:47:00Z"),
                        ),
                        NonCompliantTrip(
                            tripNumber = "9463715",
                            startDateTimeUtc = ZonedDateTime.parse("2019-10-11T01:40:00Z"),
                            endDateTimeUtc = ZonedDateTime.parse("2019-10-11T01:40:00Z"),
                        ),
                    ),
            ),
        )

        val priorNotificationMetrics = riskElements.last().metrics as RiskElementMetrics.Trips
        assertThat(priorNotificationMetrics.nonCompliantTrips).containsExactly(
            NonCompliantTrip(tripNumber = "9463713", startDateTimeUtc = null, endDateTimeUtc = null),
        )
    }

    @Test
    @Transactional
    fun `findAllByCfr Should return the risk elements computed from occurrences`() {
        // When
        val riskElements = jpaVesselRiskElementRepository.findAllByCfr("ABC000180832")

        // Then
        assertThat(riskElements.map { it.code }).containsExactly("CLA_CM", "VMS_MR")
        assertThat(riskElements.first().metrics).isEqualTo(
            RiskElementMetrics.Occurrences(
                occurrences = 3,
                reportingIds = listOf(1, 2, 3),
            ),
        )
        assertThat(riskElements.last().metrics).isEqualTo(
            RiskElementMetrics.Occurrences(
                occurrences = 0,
                reportingIds = emptyList(),
            ),
        )
    }

    @Test
    @Transactional
    fun `findAllByCfr Should return an empty list When the vessel has no risk elements`() {
        // When
        val riskElements = jpaVesselRiskElementRepository.findAllByCfr("UNKNOWN")

        // Then
        assertThat(riskElements).isEmpty()
    }
}
