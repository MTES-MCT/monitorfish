package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilenceAlertPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SilenceOperationalAlertDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SilencedAlertDataInput
import org.assertj.core.api.Assertions.assertThat
import org.hamcrest.Matchers
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Import(SentryConfig::class, MapperConfiguration::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PendingAlertController::class)])
class PendingAlertControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getPendingAlerts: GetPendingAlerts

    @MockBean
    private lateinit var validatePendingAlert: ValidatePendingAlert

    @MockBean
    private lateinit var silencePendingAlert: SilencePendingAlert

    @MockBean
    private lateinit var getSilencedAlerts: GetSilencedAlerts

    @MockBean
    private lateinit var deleteSilencedAlert: DeleteSilencedAlert

    @MockBean
    private lateinit var silenceAlert: SilenceAlert

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all pending alerts`() {
        // Given
        BDDMockito.given(getPendingAlerts.execute()).willReturn(
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
                    value =
                        Alert(
                            type = AlertType.POSITION_ALERT,
                            seaFront = NAMO.toString(),
                            alertId = 1,
                            natinfCode = 7059,
                            name = "Chalutage dans les 3 milles",
                        ),
                ),
            ),
        )

        // When
        api
            .perform(MockMvcRequestBuilders.get("/bff/v1/operational_alerts"))
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.length()", Matchers.equalTo(1)))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].internalReferenceNumber", Matchers.equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].value.natinfCode", Matchers.equalTo(7059)))
    }

    @Test
    fun `Should validate a pending alert`() {
        // When
        api
            .perform(MockMvcRequestBuilders.put("/bff/v1/operational_alerts/666/validate"))
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
    }

    @Test
    fun `Should silence a pending alert`() {
        // Given
        given(silencePendingAlert.execute(any(), any(), any())).willReturn(
            SilencedAlert(
                id = 666,
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                silencedBeforeDate = ZonedDateTime.now(),
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
            ),
        )
        val before = ZonedDateTime.now()

        // When
        api
            .perform(
                MockMvcRequestBuilders
                    .put("/bff/v1/operational_alerts/666/silence")
                    .content(
                        objectMapper.writeValueAsString(
                            SilenceOperationalAlertDataInput(
                                silencedAlertPeriod = SilenceAlertPeriod.CUSTOM,
                                beforeDateTime = before,
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.internalReferenceNumber", Matchers.equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.flagState", Matchers.equalTo("FR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.id", Matchers.equalTo(666)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.type", Matchers.equalTo("POSITION_ALERT")))

        argumentCaptor<ZonedDateTime>().apply {
            verify(silencePendingAlert).execute(eq(666), eq(SilenceAlertPeriod.CUSTOM), capture())

            assertThat(allValues.first().withZoneSameInstant(UTC).toString()).isEqualTo(
                before.withZoneSameInstant(UTC).toString(),
            )
        }
    }

    @Test
    fun `Should get all silenced alerts`() {
        // Given
        BDDMockito.given(getSilencedAlerts.execute()).willReturn(
            listOf(
                SilencedAlert(
                    internalReferenceNumber = "FRFGRGR",
                    externalReferenceNumber = "RGD",
                    ircs = "6554fEE",
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    flagState = CountryCode.FR,
                    silencedBeforeDate = ZonedDateTime.now(),
                    value =
                        Alert(
                            type = AlertType.POSITION_ALERT,
                            seaFront = NAMO.toString(),
                            alertId = 1,
                            natinfCode = 7059,
                            name = "Chalutage dans les 3 milles",
                        ),
                ),
            ),
        )

        // When
        api
            .perform(MockMvcRequestBuilders.get("/bff/v1/operational_alerts/silenced"))
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.length()", Matchers.equalTo(1)))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].internalReferenceNumber", Matchers.equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].value.natinfCode", Matchers.equalTo(7059)))
            .andExpect(
                MockMvcResultMatchers.jsonPath("$[0].value.type", Matchers.equalTo("POSITION_ALERT")),
            )
    }

    @Test
    fun `Should delete a silenced alert`() {
        // When
        api
            .perform(MockMvcRequestBuilders.delete("/bff/v1/operational_alerts/silenced/666"))
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
    }

    @Test
    fun `Should silence an alert`() {
        // Given
        given(silenceAlert.execute(any())).willReturn(
            SilencedAlert(
                id = 666,
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                silencedBeforeDate = ZonedDateTime.now(),
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
            ),
        )

        // When
        api
            .perform(
                MockMvcRequestBuilders
                    .post("/bff/v1/operational_alerts/silenced")
                    .content(
                        objectMapper.writeValueAsString(
                            SilencedAlertDataInput(
                                internalReferenceNumber = "FRFGRGR",
                                externalReferenceNumber = "RGD",
                                ircs = "6554fEE",
                                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                                flagState = CountryCode.FR,
                                silencedBeforeDate = ZonedDateTime.now(),
                                value = "{\"type\": \"POSITION_ALERT\"," +
                                        "\"name\": \"Chalutage dans les 3 milles\"," +
                                        "\"alertId\": \"1\"}"
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.internalReferenceNumber", Matchers.equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.flagState", Matchers.equalTo("FR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.type", Matchers.equalTo("POSITION_ALERT")))
    }

    @Test
    fun `Should silence an MISSING_FAR_48_HOURS_ALERT alert`() {
        // Given
        given(silenceAlert.execute(any())).willReturn(
            SilencedAlert(
                id = 666,
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                silencedBeforeDate = ZonedDateTime.now(),
                value = AlertType.MISSING_FAR_48_HOURS_ALERT.getValue(),
            ),
        )

        // When
        api
            .perform(
                MockMvcRequestBuilders
                    .post("/bff/v1/operational_alerts/silenced")
                    .content(
                        objectMapper.writeValueAsString(
                            SilencedAlertDataInput(
                                internalReferenceNumber = "FRFGRGR",
                                externalReferenceNumber = "RGD",
                                ircs = "6554fEE",
                                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                                flagState = CountryCode.FR,
                                silencedBeforeDate = ZonedDateTime.now(),
                                value = "{\"type\": \"MISSING_FAR_48_HOURS_ALERT\", \"name\": \"FAR manquant en 48h\"}",
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.internalReferenceNumber", Matchers.equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.flagState", Matchers.equalTo("FR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.type", Matchers.equalTo("MISSING_FAR_48_HOURS_ALERT")))
    }
}
