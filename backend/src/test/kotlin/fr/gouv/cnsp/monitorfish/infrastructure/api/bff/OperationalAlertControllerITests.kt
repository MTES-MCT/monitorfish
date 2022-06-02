package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilenceAlertPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.GetOperationalAlerts
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.SilenceOperationalAlert
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.ValidateOperationalAlert
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SilenceOperationalAlertDataInput
import org.assertj.core.api.Assertions.assertThat
import org.hamcrest.Matchers
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
@WebMvcTest(value = [(OperationalAlertController::class)])
class OperationalAlertControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getOperationalAlerts: GetOperationalAlerts

    @MockBean
    private lateinit var validateOperationalAlert: ValidateOperationalAlert

    @MockBean
    private lateinit var silenceOperationalAlert: SilenceOperationalAlert

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all operational alerts`() {
        // Given
        BDDMockito.given(this.getOperationalAlerts.execute()).willReturn(
                listOf(PendingAlert(
                        internalReferenceNumber = "FRFGRGR",
                        externalReferenceNumber = "RGD",
                        ircs = "6554fEE",
                        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        tripNumber = "123456",
                        creationDate = ZonedDateTime.now(),
                        value = ThreeMilesTrawlingAlert())))

        // When
        mockMvc.perform(MockMvcRequestBuilders.get("/bff/v1/operational_alerts"))
                // Then
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()", Matchers.equalTo(1)))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].internalReferenceNumber", Matchers.equalTo("FRFGRGR")))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].value.natinfCode", Matchers.equalTo("7059")))
    }

    @Test
    fun `Should validate an operational alert`() {
        // When
        mockMvc.perform(MockMvcRequestBuilders.put("/bff/v1/operational_alerts/666/validate"))
                // Then
                .andExpect(MockMvcResultMatchers.status().isOk)
    }

    @Test
    fun `Should silence an operational alert`() {
        // Given
        val before = ZonedDateTime.now()
        val after = ZonedDateTime.now().minusMinutes(56)

        // When
        mockMvc.perform(MockMvcRequestBuilders.put("/bff/v1/operational_alerts/666/silence")
                .content(objectMapper.writeValueAsString(SilenceOperationalAlertDataInput(
                        silencedAlertPeriod = SilenceAlertPeriod.CUSTOM,
                        beforeDateTime = before,
                        afterDateTime = after)))
                .contentType(MediaType.APPLICATION_JSON))
                // Then
                .andExpect(MockMvcResultMatchers.status().isOk)

        argumentCaptor<ZonedDateTime>().apply {
            verify(silenceOperationalAlert).execute(eq(666), eq(SilenceAlertPeriod.CUSTOM), capture(), capture())

            assertThat(allValues).hasSize(2)
            assertThat(allValues.first().withZoneSameInstant(UTC).toString()).isEqualTo(after.withZoneSameInstant(UTC).toString())
            assertThat(allValues.last().withZoneSameInstant(UTC).toString()).isEqualTo(before.withZoneSameInstant(UTC).toString())
        }
    }

}
