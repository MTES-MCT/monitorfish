package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.GetSilencedAlerts
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetSilencedAlertsUTests {
    @MockitoBean
    private lateinit var silencedAlertRepository: SilencedAlertRepository

    @Test
    fun `execute Should return silenced alerts without validated alerts`() {
        // Given
        val silencedPositionAlertOne =
            SilencedAlert(
                internalReferenceNumber = "INTERNAL_REF_ONE",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
                silencedBeforeDate = ZonedDateTime.now().plusHours(5),
            )
        val silencedPositionAlertTwo =
            SilencedAlert(
                internalReferenceNumber = "INTERNAL_REF_TWO",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
                silencedBeforeDate = ZonedDateTime.now().plusHours(5),
                wasValidated = true,
            )
        val silencedPositionAlertThree =
            SilencedAlert(
                internalReferenceNumber = "INTERNAL_REF_THREE",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
                silencedBeforeDate = ZonedDateTime.now().plusHours(5),
                wasValidated = false,
            )
        given(silencedAlertRepository.findAllCurrentSilencedAlerts()).willReturn(
            listOf(
                silencedPositionAlertOne,
                silencedPositionAlertTwo,
                silencedPositionAlertThree,
            ),
        )

        // When
        val silencedAlerts = GetSilencedAlerts(silencedAlertRepository).execute()

        // Then
        assertThat(silencedAlerts).hasSize(2)
        assertThat(silencedAlerts.first().internalReferenceNumber).isEqualTo("INTERNAL_REF_ONE")
        assertThat(silencedAlerts.last().internalReferenceNumber).isEqualTo("INTERNAL_REF_THREE")
    }
}
