package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetPriorNotificationsUTests {
    @MockBean
    private lateinit var facadeAreasRepository: FacadeAreasRepository

    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var reportingRepository: ReportingRepository

    @Test
    fun `execute Should return a list of prior notifications`() {
        // Given
        given(logbookReportRepository.findAllPriorNotifications(LogbookReportFilter())).willReturn(
            listOf(
                PriorNotification(
                    id = 1,
                    expectedArrivalDate = null,
                    expectedLandingDate = null,
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
                    vessel = Vessel(
                        id = 1,
                        externalReferenceNumber = null,
                        flagState = CountryCode.FR,
                        internalReferenceNumber = null,
                        ircs = null,
                        length = null,
                        mmsi = null,
                        underCharter = null,
                        vesselName = null,
                    ),
                    vesselLastControlDate = null,
                    vesselRiskFactorImpact = null,
                    vesselRiskFactorProbability = null,
                    vesselRiskFactorDetectability = null,
                    vesselRiskFactor = null,
                ),

                PriorNotification(
                    id = 2,
                    expectedArrivalDate = null,
                    expectedLandingDate = null,
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
                    vessel = Vessel(
                        id = 1,
                        externalReferenceNumber = null,
                        flagState = CountryCode.UK,
                        internalReferenceNumber = null,
                        ircs = null,
                        length = null,
                        mmsi = null,
                        underCharter = null,
                        vesselName = null,
                    ),
                    vesselLastControlDate = null,
                    vesselRiskFactorImpact = null,
                    vesselRiskFactorProbability = null,
                    vesselRiskFactorDetectability = null,
                    vesselRiskFactor = null,
                ),
            ),
        )

        // When
        val result = GetPriorNotifications(
            facadeAreasRepository,
            logbookReportRepository,
            portRepository,
            reportingRepository,
        ).execute(LogbookReportFilter())

        // Then
        Assertions.assertThat(result).hasSize(2)
        Assertions.assertThat(result[0].id).isEqualTo(1)
        Assertions.assertThat(result[1].id).isEqualTo(2)
    }
}
