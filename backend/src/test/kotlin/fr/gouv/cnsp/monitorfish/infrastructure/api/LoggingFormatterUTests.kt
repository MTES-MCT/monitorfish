package fr.gouv.cnsp.monitorfish.infrastructure.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateReportingDataInput
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
        val log = LoggingFormatter.formatRequest(
            mapper,
            request,
            UpdateReportingDataInput(
                reportingActor = ReportingActor.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                natinfCode = 123456,
                authorTrigram = "LTH",
                title = "A title",
            ),
        )

        // Then
        assertThat(log).isEqualTo(
            "REQUEST PUT /healthcheck {} " +
                "{\"reportingActor\":\"OPS\"," +
                "\"type\":\"INFRACTION_SUSPICION\"," +
                "\"controlUnitId\":null," +
                "\"authorTrigram\":\"LTH\"," +
                "\"authorContact\":null," +
                "\"title\":\"A title\"," +
                "\"description\":null," +
                "\"natinfCode\":123456}",
        )
    }

    @Test
    fun `formatRequest Should return the logged request our custom object mapper (creationDate as ISO)`() {
        // Given
        val request = MockHttpServletRequest("POST", "/healthcheck")
        request.setContent("TEST".toByteArray())
        val dateTime = ZonedDateTime.of(2019, 1, 18, 7, 19, 45, 45, ZoneOffset.UTC)

        // When
        val log = LoggingFormatter.formatRequest(
            mapper,
            request,
            CreateReportingDataInput(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = dateTime,
                value = InfractionSuspicion(
                    ReportingActor.OPS,
                    natinfCode = 123456,
                    authorTrigram = "LTH",
                    title = "A title",
                ),
                type = ReportingType.INFRACTION_SUSPICION,
            ),
        )

        // Then
        assertThat(log).isEqualTo(
            "REQUEST POST /healthcheck {} " +
                "{\"type\":\"INFRACTION_SUSPICION\"," +
                "\"vesselId\":null," +
                "\"vesselName\":null," +
                "\"internalReferenceNumber\":\"FRFGRGR\"," +
                "\"externalReferenceNumber\":\"RGD\"," +
                "\"ircs\":\"6554fEE\"," +
                "\"vesselIdentifier\":\"INTERNAL_REFERENCE_NUMBER\"," +
                "\"flagState\":\"FR\"," +
                "\"creationDate\":\"2019-01-18T07:19:45.000000045Z\"," +
                "\"validationDate\":null," +
                "\"value\":{\"type\":\"INFRACTION_SUSPICION\"," +
                "\"reportingActor\":\"OPS\"," +
                "\"controlUnitId\":null," +
                "\"authorTrigram\":\"LTH\"," +
                "\"authorContact\":null," +
                "\"title\":\"A title\"," +
                "\"description\":null," +
                "\"natinfCode\":123456," +
                "\"seaFront\":null," +
                "\"dml\":null," +
                "\"type\":\"INFRACTION_SUSPICION\"}}",
        )
    }

    @Test
    fun `formatResponse Should format the response`() {
        // Given
        val request = MockHttpServletRequest("POST", "/healthcheck")
        val response = MockHttpServletResponse()
        response.status = 201
        val body = UpdateReportingDataInput(
            reportingActor = ReportingActor.OPS,
            type = ReportingType.INFRACTION_SUSPICION,
            natinfCode = 123456,
            authorTrigram = "LTH",
            title = "A title",
        )

        // When
        val log = LoggingFormatter.formatResponse(mapper, request, response, body)

        // Then
        assertThat(log).isEqualTo(
            "RESPONSE POST 201 /healthcheck " +
                "{\"reportingActor\":\"OPS\"," +
                "\"type\":\"INFRACTION_SUSPICION\"," +
                "\"controlUnitId\":null," +
                "\"authorTrigram\":\"LTH\"," +
                "\"authorContact\":null," +
                "\"title\":\"A title\"," +
                "\"description\":null," +
                "\"natinfCode\":123456}",
        )
    }
}
