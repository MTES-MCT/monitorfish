package fr.gouv.cnsp.monitorfish.infrastructure.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateReportingDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.NatinfDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ThreatCharacterizationDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ThreatHierarchyDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateReportingDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.log.LoggingFormatter
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZoneOffset
import java.time.ZonedDateTime

@Import(MapperConfiguration::class)
@ExtendWith(SpringExtension::class)
class LoggingFormatterUTests {
    @Autowired
    private lateinit var mapper: ObjectMapper

    @Test
    fun `formatRequest Should return a logged request`() {
        // Given
        val request = MockHttpServletRequest("PUT", "/healthcheck")
        request.setContent("TEST".toByteArray())

        // When
        val log =
            LoggingFormatter.formatRequest(
                mapper,
                request,
                UpdateReportingDataInput(
                    flagState = CountryCode.FR,
                    reportingSource = ReportingSource.OPS,
                    type = ReportingType.INFRACTION_SUSPICION,
                    reportingDate = ZonedDateTime.now(),
                    threatHierarchy =
                        ThreatHierarchyDataInput(
                            children =
                                listOf(
                                    ThreatCharacterizationDataInput(
                                        children =
                                            listOf(
                                                NatinfDataInput(
                                                    label = "27689",
                                                    value = 27689,
                                                ),
                                            ),
                                        label = "Pêche sans autorisation par navire tiers",
                                        value = "Pêche sans autorisation par navire tiers",
                                    ),
                                ),
                            label = "Activités INN",
                            value = "Activités INN",
                        ),
                    title = "A title",
                ),
            )

        // Then
        assertThat(log).startsWith("REQUEST PUT /healthcheck {} ")
        assertThat(log).contains("\"reportingSource\":\"OPS\"")
        assertThat(log).contains("\"type\":\"INFRACTION_SUSPICION\"")
        assertThat(log).contains("\"flagState\":\"FR\"")
        assertThat(log).contains("\"title\":\"A title\"")
        assertThat(log).contains("\"threatHierarchy\"")
    }

    @Test
    fun `formatRequest Should return the logged request our custom object mapper (creationDate as ISO)`() {
        // Given
        val request = MockHttpServletRequest("POST", "/healthcheck")
        request.setContent("TEST".toByteArray())
        val dateTime = ZonedDateTime.of(2019, 1, 18, 7, 19, 45, 45, ZoneOffset.UTC)

        // When
        val log =
            LoggingFormatter.formatRequest(
                mapper,
                request,
                CreateReportingDataInput(
                    cfr = "FRFGRGR",
                    externalMarker = "RGD",
                    ircs = "6554fEE",
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    flagState = CountryCode.FR,
                    creationDate = dateTime,
                    reportingDate = dateTime,
                    threatHierarchy =
                        ThreatHierarchyDataInput(
                            children =
                                listOf(
                                    ThreatCharacterizationDataInput(
                                        children =
                                            listOf(
                                                NatinfDataInput(
                                                    label = "27689",
                                                    value = 27689,
                                                ),
                                            ),
                                        label = "Pêche sans autorisation par navire tiers",
                                        value = "Pêche sans autorisation par navire tiers",
                                    ),
                                ),
                            label = "Activités INN",
                            value = "Activités INN",
                        ),
                    reportingSource = ReportingSource.OPS,
                    title = "A title",
                    type = ReportingType.INFRACTION_SUSPICION,
                ),
            )

        // Then
        assertThat(log).startsWith("REQUEST POST /healthcheck {} ")
        assertThat(log).contains("\"type\":\"INFRACTION_SUSPICION\"")
        assertThat(log).contains("\"cfr\":\"FRFGRGR\"")
        assertThat(log).contains("\"externalMarker\":\"RGD\"")
        assertThat(log).contains("\"ircs\":\"6554fEE\"")
        assertThat(log).contains("\"reportingSource\":\"OPS\"")
        assertThat(log).contains("\"creationDate\":\"2019-01-18T07:19:45.000000045Z\"")
    }

    @Test
    fun `formatResponse Should format the response`() {
        // Given
        val request = MockHttpServletRequest("POST", "/healthcheck")
        val response = MockHttpServletResponse()
        response.status = 201
        val body =
            UpdateReportingDataInput(
                flagState = CountryCode.FR,
                reportingSource = ReportingSource.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                reportingDate = ZonedDateTime.now(),
                threatHierarchy =
                    ThreatHierarchyDataInput(
                        children =
                            listOf(
                                ThreatCharacterizationDataInput(
                                    children =
                                        listOf(
                                            NatinfDataInput(
                                                label = "27689",
                                                value = 27689,
                                            ),
                                        ),
                                    label = "Pêche sans autorisation par navire tiers",
                                    value = "Pêche sans autorisation par navire tiers",
                                ),
                            ),
                        label = "Activités INN",
                        value = "Activités INN",
                    ),
                title = "A title",
            )

        // When
        val log = LoggingFormatter.formatResponse(mapper, request, response, body)

        // Then
        assertThat(log).startsWith("RESPONSE POST 201 /healthcheck ")
        assertThat(log).contains("\"reportingSource\":\"OPS\"")
        assertThat(log).contains("\"type\":\"INFRACTION_SUSPICION\"")
        assertThat(log).contains("\"flagState\":\"FR\"")
        assertThat(log).contains("\"title\":\"A title\"")
        assertThat(log).contains("\"threatHierarchy\"")
    }
}
