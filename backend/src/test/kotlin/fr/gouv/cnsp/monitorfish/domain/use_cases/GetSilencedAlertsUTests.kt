package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.GetSilencedAlerts
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetSilencedAlertsUTests {
    @MockBean
    private lateinit var silencedAlertRepository: SilencedAlertRepository

    @Test
    fun `execute Should return silenced alerts without validated alerts`() {
        // Given
        val silencedAlertOne =
            SilencedAlert(
                internalReferenceNumber = "INTERNAL_REF_ONE",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value = ThreeMilesTrawlingAlert(),
                silencedBeforeDate = ZonedDateTime.now().plusHours(5),
            )
        val silencedAlertTwo =
            SilencedAlert(
                internalReferenceNumber = "INTERNAL_REF_TWO",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value = ThreeMilesTrawlingAlert(),
                silencedBeforeDate = ZonedDateTime.now().plusHours(5),
                wasValidated = true,
            )
        val silencedAlertThree =
            SilencedAlert(
                internalReferenceNumber = "INTERNAL_REF_THREE",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value = ThreeMilesTrawlingAlert(),
                silencedBeforeDate = ZonedDateTime.now().plusHours(5),
                wasValidated = false,
            )
        given(silencedAlertRepository.findAllCurrentSilencedAlerts()).willReturn(
            listOf(
                silencedAlertOne,
                silencedAlertTwo,
                silencedAlertThree,
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
