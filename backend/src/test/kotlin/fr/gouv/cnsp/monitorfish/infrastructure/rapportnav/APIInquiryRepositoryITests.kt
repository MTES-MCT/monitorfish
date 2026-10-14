package fr.gouv.cnsp.monitorfish.infrastructure.rapportnav

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.RapportnavProperties
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.engine.mock.respondError
import io.ktor.client.request.HttpRequestData
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.cache.concurrent.ConcurrentMapCacheManager
import java.time.ZonedDateTime
import java.util.UUID

class APIInquiryRepositoryITests {
    private val inquiryId = UUID.fromString("8a3c6b6e-2f1a-4c0e-9d3b-1f2e3d4c5b6a")
    private val afterDateTime = ZonedDateTime.parse("2021-01-01T00:00:00Z")
    private val inquiriesJson =
        """
        [
            {
                "id": "$inquiryId",
                "vesselId": 42,
                "missionId": 12,
                "type": "VEHICLE",
                "origin": "FOLLOW_UP_CONTROL",
                "status": "CLOSED",
                "conclusion": "WITH_REPORT",
                "startDateTimeUtc": "2024-03-01T10:00:00Z",
                "endDateTimeUtc": "2024-03-15T10:00:00Z",
                "isSignedByInspector": true,
                "service": { "id": 6, "name": "ULAM 56", "controlUnitIds": [10449] },
                "infractions": [
                    {
                        "controlType": "LANDING_OBLIGATION",
                        "infractionType": "WITH_REPORT",
                        "natinfs": ["7064"],
                        "observations": "Débarquement sous taille"
                    }
                ],
                "observations": ["Commentaire de l'unité"],
                "unknownField": "ignored"
            }
        ]
        """

    private fun buildRepository(mockEngine: MockEngine): APIInquiryRepository {
        val rapportnavProperties = RapportnavProperties()
        rapportnavProperties.url = "http://test"
        rapportnavProperties.apiKey = "SECRET"
        val cacheManager = ConcurrentMapCacheManager()

        return APIInquiryRepository(ApiClient(mockEngine), rapportnavProperties, cacheManager)
    }

    @Test
    fun `findAllByVesselId Should fetch and map the inquiries of a vessel`() {
        // Given
        val requests = mutableListOf<HttpRequestData>()
        val mockEngine =
            MockEngine { request ->
                requests.add(request)
                respond(
                    content = inquiriesJson,
                    status = HttpStatusCode.OK,
                    headers = headersOf(HttpHeaders.ContentType, "application/json"),
                )
            }

        // When
        val inquiries = buildRepository(mockEngine).findAllByVesselId(42, afterDateTime)

        // Then
        val request = requests.single()
        assertThat(request.url.toString())
            .isEqualTo("http://test/api/v1/public/inquiries?vesselId=42&startDateTimeUtc=2021-01-01T00%3A00%3A00Z")
        assertThat(request.headers["X-API-Key"]).isEqualTo("SECRET")

        val inquiry = inquiries.single()
        assertThat(inquiry.id).isEqualTo(inquiryId)
        assertThat(inquiry.vesselId).isEqualTo(42)
        assertThat(inquiry.status).isEqualTo("CLOSED")
        assertThat(inquiry.startDateTimeUtc).isEqualTo(ZonedDateTime.parse("2024-03-01T10:00:00Z"))
        assertThat(inquiry.missionId).isEqualTo(12)
        assertThat(inquiry.isSignedByInspector).isTrue()
        assertThat(inquiry.service?.name).isEqualTo("ULAM 56")
        assertThat(inquiry.service?.controlUnitIds).containsExactly(10449)
        assertThat(inquiry.infractions.single().controlType).isEqualTo("LANDING_OBLIGATION")
        assertThat(inquiry.infractions.single().natinfs).containsExactly("7064")
        assertThat(inquiry.observations).containsExactly("Commentaire de l'unité")
    }

    @Test
    fun `findAllByVesselId Should return the last known inquiries When RapportNav is down`() {
        // Given
        var isRapportNavUp = true
        val mockEngine =
            MockEngine { _ ->
                if (isRapportNavUp) {
                    respond(
                        content = inquiriesJson,
                        status = HttpStatusCode.OK,
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                } else {
                    respondError(HttpStatusCode.ServiceUnavailable)
                }
            }
        val repository = buildRepository(mockEngine)
        repository.findAllByVesselId(42, afterDateTime)
        isRapportNavUp = false

        // When
        val inquiries = repository.findAllByVesselId(42, afterDateTime)

        // Then
        assertThat(inquiries.single().id).isEqualTo(inquiryId)
    }

    @Test
    fun `findAllByVesselId Should throw When RapportNav is down and there is no last known inquiries`() {
        // Given
        val mockEngine = MockEngine { _ -> respondError(HttpStatusCode.ServiceUnavailable) }

        // When, Then
        assertThatThrownBy { buildRepository(mockEngine).findAllByVesselId(42, afterDateTime) }
            .isInstanceOf(BackendInternalException::class.java)
    }
}
