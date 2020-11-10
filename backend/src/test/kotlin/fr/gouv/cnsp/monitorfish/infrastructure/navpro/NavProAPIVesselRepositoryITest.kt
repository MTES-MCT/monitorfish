package fr.gouv.cnsp.monitorfish.infrastructure.navpro

import fr.gouv.cnsp.monitorfish.config.ThirdPartyProperties
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CaffeineConfiguration
import okhttp3.HttpUrl
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Import
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit.jupiter.SpringExtension


@ExtendWith(SpringExtension::class)
@SpringBootTest
@ContextConfiguration(classes = [CaffeineConfiguration::class, ThirdPartyProperties::class])
@Import(CaffeineConfiguration::class, NavProAPIVesselRepository::class)
@ConfigurationPropertiesScan
internal class NavProAPIVesselRepositoryITest {
    private var server = MockWebServer()
    private lateinit var baseUrl: HttpUrl

    @Autowired
    lateinit var cacheManager: CacheManager

    @Autowired
    lateinit var vesselRepository: VesselRepository

    @BeforeEach
    fun setup() {
        server.start(8082)
        baseUrl = server.url("/api/v1/navires")
        cacheManager.getCache("vessel")?.clear()
    }

    @AfterEach
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun `findVessel Should return a vessel`() {
        // Given
        server.enqueue(MockResponse().setBody("""
            {
                "internalReferenceNumber": "FR2136546",
                "externalReferenceNumber": "2136546",
                "vesselName": "DUMMY NAME",
                "flagState": "FR",
                "gearType": "Trawler",
                "vesselType": "Fishing"
            }
        """.trimIndent()))

        // When
        val vessel = vesselRepository.findVessel("DUMMY_REFERENCE_NUMBER")

        // Then
        assertThat(vessel.internalReferenceNumber).isEqualTo("FR2136546")
        assertThat(vessel.externalReferenceNumber).isEqualTo("2136546")
        assertThat(vessel.vesselName).isEqualTo("DUMMY NAME")
        assertThat(vessel.flagState?.alpha2).isEqualTo("FR")
        assertThat(vessel.gearType).isEqualTo("Trawler")
        assertThat(vessel.vesselType).isEqualTo("Fishing")
    }

    @Test
    fun `findVessel Should throw an exception When a vessel is not found`() {
        // Given
        server.enqueue(MockResponse().setResponseCode(400).setBody("""
            {
              "codeErreur": "string",
              "listeErreurs": [
                {}
              ],
              "messageDebug": "string",
              "messageErreur": "string",
              "status": "100",
              "timestamp": "dd-MM-yyyy HH:mm:ss"
            }
        """.trimIndent()))

        // When
        val throwable = catchThrowable {
            vesselRepository.findVessel("DUMMY_REFERENCE_NUMBER")
        }

        // Then
        assertThat(throwable.message).contains("Could not obtain vessel data")
    }

    @Test
    fun `findVessel Should use the cache When a vessel is requested two times`() {
        // Given the server will return two different responses
        server.enqueue(MockResponse().setBody("""
            {
                "internalReferenceNumber": "FR2136546",
                "externalReferenceNumber": "2136546",
                "vesselName": "DUMMY NAME",
                "flagState": "FR",
                "gearType": "Trawler",
                "vesselType": "Fishing"
            }
        """.trimIndent()))
        server.enqueue(MockResponse().setBody("""
            {
                "internalReferenceNumber": "ANOTHER REF",
                "externalReferenceNumber": "ANOTHER REF",
                "vesselName": "ANOTHER NAME",
                "flagState": "XX",
                "gearType": "Trawler",
                "vesselType": "Fishing"
            }
        """.trimIndent()))

        // When
        val expectedVessel = vesselRepository.findVessel("DUMMY_REFERENCE_NUMBER")
        val cacheVessel = vesselRepository.findVessel("DUMMY_REFERENCE_NUMBER")

        // Then the response will be the same as it is cached
        assertThat(expectedVessel).isEqualTo(cacheVessel)
    }
}
