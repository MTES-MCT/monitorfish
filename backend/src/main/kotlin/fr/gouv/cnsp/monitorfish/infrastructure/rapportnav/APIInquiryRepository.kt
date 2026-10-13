package fr.gouv.cnsp.monitorfish.infrastructure.rapportnav

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.RapportnavProperties
import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.Inquiry
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import fr.gouv.cnsp.monitorfish.domain.repositories.InquiryRepository
import fr.gouv.cnsp.monitorfish.infrastructure.rapportnav.responses.InquiryDataResponse
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.parameter
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.interceptor.SimpleKey
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class APIInquiryRepository(
    val apiClient: ApiClient,
    val rapportnavProperties: RapportnavProperties,
    val cacheManager: CacheManager,
) : InquiryRepository {
    private val logger: Logger = LoggerFactory.getLogger(APIInquiryRepository::class.java)

    @Cacheable(value = ["vessel_inquiries"], sync = true)
    override fun findAllByVesselId(
        vesselId: Int,
        afterDateTime: ZonedDateTime,
    ): List<Inquiry> {
        val inquiriesUrl = "${rapportnavProperties.url}/api/v1/public/inquiries"
        val lastKnownCache = cacheManager.getCache(VESSEL_INQUIRIES_LAST_KNOWN)
        val cacheKey = SimpleKey(vesselId, afterDateTime)

        return try {
            val inquiries =
                runBlocking {
                    withTimeout(rapportnavProperties.timeout) {
                        apiClient.httpClient
                            .get(inquiriesUrl) {
                                header(API_KEY_HEADER, rapportnavProperties.apiKey)
                                parameter("vesselId", vesselId)
                                parameter("startDateTimeUtc", afterDateTime.toInstant().toString())
                            }.body<List<InquiryDataResponse>>()
                            .map { it.toInquiry() }
                    }
                }
            lastKnownCache?.put(cacheKey, inquiries)

            inquiries
        } catch (e: Exception) {
            // Historical data is more useful to the user than an error while RapportNav is unavailable
            @Suppress("UNCHECKED_CAST")
            val lastKnownInquiries = lastKnownCache?.get(cacheKey)?.get() as List<Inquiry>?
            if (lastKnownInquiries != null) {
                logger.warn("Could not fetch inquiries at $inquiriesUrl, returning last known inquiries.", e)

                return lastKnownInquiries
            }

            throw BackendInternalException(
                message = "Could not fetch inquiries of vessel $vesselId from RapportNav.",
                cause = e,
            )
        }
    }

    companion object {
        const val API_KEY_HEADER = "X-API-Key"
        const val VESSEL_INQUIRIES_LAST_KNOWN = "vessel_inquiries_last_known"
    }
}
