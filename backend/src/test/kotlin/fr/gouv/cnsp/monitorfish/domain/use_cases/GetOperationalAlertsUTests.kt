package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.GetOperationalAlerts
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetOperationalAlertsUTests {

    @MockBean
    private lateinit var pendingAlertRepository: PendingAlertRepository

    @MockBean
    private lateinit var infractionRepository: InfractionRepository

    @Test
    fun `execute Should return alerts with associated infractions`() {
        // Given
        val pendingAlert = PendingAlert(
            internalReferenceNumber = "FRFGRGR",
            externalReferenceNumber = "RGD",
            ircs = "6554fEE",
            vesselId = 123,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            tripNumber = "123456",
            creationDate = ZonedDateTime.now(),
            value = ThreeMilesTrawlingAlert(),
        )
        given(infractionRepository.findInfractionByNatinfCode(eq("7059"))).willReturn(
            Infraction(1, natinfCode = "7059", infractionCategory = InfractionCategory.FISHING),
        )
        given(pendingAlertRepository.findAlertsOfTypes(any())).willReturn(listOf(pendingAlert))

        // When
        val alerts = GetOperationalAlerts(pendingAlertRepository, infractionRepository).execute()

        // Then
        assertThat(alerts.first().value.natinfCode).isEqualTo("7059")
        assertThat(alerts.first().infraction?.natinfCode).isEqualTo("7059")
        assertThat(alerts.first().infraction?.infractionCategory).isEqualTo(InfractionCategory.FISHING)

        Mockito.verify(pendingAlertRepository).findAlertsOfTypes(
            listOf(
                AlertTypeMapping.THREE_MILES_TRAWLING_ALERT,
                AlertTypeMapping.FRENCH_EEZ_FISHING_ALERT,
                AlertTypeMapping.TWELVE_MILES_FISHING_ALERT,
                AlertTypeMapping.MISSING_FAR_ALERT,
            ),
        )
        Mockito.verify(infractionRepository, Mockito.times(1)).findInfractionByNatinfCode(eq("7059"))
    }
}
