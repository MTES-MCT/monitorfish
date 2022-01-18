package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetOperationalAlertsUTests {

    @MockBean
    private lateinit var pendingAlertRepository: PendingAlertRepository

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @Test
    fun `execute Should return the alerts enriched with the risk factor found in the last position table`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = LastPosition(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, riskFactor = 1.23, dateTime = now.minusHours(4))
        val secondPosition = LastPosition(null, "FR224226855", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, riskFactor = 1.54, dateTime = now.minusHours(3))
        val thirdPosition = LastPosition(null, "FR224226856", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, riskFactor = 1.98, dateTime = now.minusHours(2))
        val fourthPosition = LastPosition(null, "FR224226857", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, riskFactor = 1.24, dateTime = now.minusHours(1))
        given(lastPositionRepository.findAll()).willReturn(listOf(firstPosition, fourthPosition, secondPosition, thirdPosition))
        given(pendingAlertRepository.findAlertsOfTypes(any())).willReturn(listOf(PendingAlert(
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                tripNumber = 123456,
                creationDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert())))

        // When
        val enrichedAlerts = GetOperationalAlerts(pendingAlertRepository, lastPositionRepository).execute()

        // Then
        assertThat(enrichedAlerts).hasSize(1)
        assertThat(enrichedAlerts.first().riskFactor).isEqualTo(1.23)
        assertThat(enrichedAlerts.first().internalReferenceNumber).isEqualTo("FR224226850")
    }
}
