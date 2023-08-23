package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilenceAlertPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SilenceOperationalAlertDataInput
import org.assertj.core.api.Assertions.assertThat
import org.hamcrest.Matchers
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Import(SecurityConfig::class, OIDCProperties::class, SentryConfig::class)
@WebMvcTest(value = [(OperationalAlertController::class)])
class PublicOperationalAlertControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getOperationalAlerts: GetOperationalAlerts

    @MockBean
    private lateinit var validateOperationalAlert: ValidateOperationalAlert

    @MockBean
    private lateinit var silenceOperationalAlert: SilenceOperationalAlert

    @MockBean
    private lateinit var getSilencedAlerts: GetSilencedAlerts

    @MockBean
    private lateinit var deleteSilencedOperationalAlert: DeleteSilencedOperationalAlert

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all operational alerts`() {
        // Given
        BDDMockito.given(this.getOperationalAlerts.execute()).willReturn(
            listOf(
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
                ),
            ),
        )

        // When
        api.perform(MockMvcRequestBuilders.get("/bff/v1/operational_alerts"))
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.length()", Matchers.equalTo(1)))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].internalReferenceNumber", Matchers.equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].value.natinfCode", Matchers.equalTo(7059)))
    }

    @Test
    fun `Should validate an operational alert`() {
        // When
        api.perform(MockMvcRequestBuilders.put("/bff/v1/operational_alerts/666/validate"))
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
    }

    @Test
    fun `Should silence an operational alert`() {
        // Given
        given(this.silenceOperationalAlert.execute(any(), any(), any())).willReturn(
            SilencedAlert(
                id = 666,
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                silencedBeforeDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert(),
            ),
        )
        val before = ZonedDateTime.now()

        // When
        api.perform(
            MockMvcRequestBuilders.put("/bff/v1/operational_alerts/666/silence")
                .content(
                    objectMapper.writeValueAsString(
                        SilenceOperationalAlertDataInput(
                            silencedAlertPeriod = SilenceAlertPeriod.CUSTOM,
                            beforeDateTime = before,
                        ),
                    ),
                )
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.internalReferenceNumber", Matchers.equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.flagState", Matchers.equalTo("FR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.id", Matchers.equalTo(666)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.type", Matchers.equalTo("THREE_MILES_TRAWLING_ALERT")))

        argumentCaptor<ZonedDateTime>().apply {
            verify(silenceOperationalAlert).execute(eq(666), eq(SilenceAlertPeriod.CUSTOM), capture())

            assertThat(allValues.first().withZoneSameInstant(UTC).toString()).isEqualTo(
                before.withZoneSameInstant(UTC).toString(),
            )
        }
    }

    @Test
    fun `Should get all silenced alerts`() {
        // Given
        BDDMockito.given(this.getSilencedAlerts.execute()).willReturn(
            listOf(
                SilencedAlert(
                    internalReferenceNumber = "FRFGRGR",
                    externalReferenceNumber = "RGD",
                    ircs = "6554fEE",
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    flagState = CountryCode.FR,
                    silencedBeforeDate = ZonedDateTime.now(),
                    value = ThreeMilesTrawlingAlert(),
                ),
            ),
        )

        // When
        api.perform(MockMvcRequestBuilders.get("/bff/v1/operational_alerts/silenced"))
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.length()", Matchers.equalTo(1)))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].internalReferenceNumber", Matchers.equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].value.natinfCode", Matchers.equalTo(7059)))
            .andExpect(
                MockMvcResultMatchers.jsonPath("$[0].value.type", Matchers.equalTo("THREE_MILES_TRAWLING_ALERT")),
            )
    }

    @Test
    fun `Should delete a silenced alert`() {
        // When
        api.perform(MockMvcRequestBuilders.delete("/bff/v1/operational_alerts/silenced/666"))
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
    }
}
