package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotificationTypes
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotifications
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SecurityConfig::class, OIDCProperties::class, SentryConfig::class)
@WebMvcTest(value = [(PriorNotificationController::class)])
class PriorNotificationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getPriorNotifications: GetPriorNotifications

    @MockBean
    private lateinit var getPriorNotificationTypes: GetPriorNotificationTypes

    @Test
    fun `Should get a list of prior notifications`() {
        // Given
        given(this.getPriorNotifications.execute(LogbookReportFilter())).willReturn(
            listOf(
                PriorNotification(
                    id = 1,
                    expectedArrivalDate = null,
                    expectedLandingDate = null,
                    isVesselUnderCharter = null,
                    notificationTypeLabel = null,
                    onboardCatches = emptyList(),
                    portLocode = null,
                    portName = null,
                    purposeCode = null,
                    reportingsCount = null,
                    seaFront = null,
                    sentAt = null,
                    tripGears = emptyList(),
                    tripSegments = emptyList(),
                    types = emptyList(),
                    vesselId = 1,
                    vesselExternalReferenceNumber = null,
                    vesselFlagCountryCode = null,
                    vesselInternalReferenceNumber = null,
                    vesselIrcs = null,
                    vesselLastControlDate = null,
                    vesselLength = null,
                    vesselMmsi = null,
                    vesselName = null,
                    vesselRiskFactorImpact = null,
                    vesselRiskFactorProbability = null,
                    vesselRiskFactorDetectability = null,
                    vesselRiskFactor = null,
                ),

                PriorNotification(
                    id = 2,
                    expectedArrivalDate = null,
                    expectedLandingDate = null,
                    isVesselUnderCharter = null,
                    notificationTypeLabel = null,
                    onboardCatches = emptyList(),
                    portLocode = null,
                    portName = null,
                    purposeCode = null,
                    reportingsCount = null,
                    seaFront = null,
                    sentAt = null,
                    tripGears = emptyList(),
                    tripSegments = emptyList(),
                    types = emptyList(),
                    vesselId = 2,
                    vesselExternalReferenceNumber = null,
                    vesselFlagCountryCode = null,
                    vesselInternalReferenceNumber = null,
                    vesselIrcs = null,
                    vesselLastControlDate = null,
                    vesselLength = null,
                    vesselMmsi = null,
                    vesselName = null,
                    vesselRiskFactorImpact = null,
                    vesselRiskFactorProbability = null,
                    vesselRiskFactorDetectability = null,
                    vesselRiskFactor = null,
                ),
            ),
        )

        // When
        api.perform(get("/bff/v1/prior_notifications"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].id", equalTo(1)))
            .andExpect(jsonPath("$[1].id", equalTo(2)))
    }

    @Test
    fun `Should get a list of prior notification types`() {
        // Given
        given(this.getPriorNotificationTypes.execute()).willReturn(listOf("Préavis de Type A", "Préavis de Type B"))

        // When
        api.perform(get("/bff/v1/prior_notifications/types"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0]", equalTo("Préavis de Type A")))
            .andExpect(jsonPath("$[1]", equalTo("Préavis de Type B")))
    }
}
