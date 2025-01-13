package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CaffeineConfiguration
import fr.gouv.cnsp.monitorfish.domain.use_cases.port.GetActivePorts
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.hamcrest.Matchers.equalTo
import org.mockito.BDDMockito.given

@Import(SentryConfig::class, CaffeineConfiguration::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [PublicPortController::class])
class PublicPortControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    lateinit var cacheManager: CacheManager

    @MockBean
    private lateinit var getActivePorts: GetActivePorts

    @Test
    fun `Should get all active ports`() {
        // Given
        given(this.getActivePorts.execute()).willReturn(
            listOf(
                PortFaker.fakePort(locode = "ET", name = "Etel", latitude = 47.123, longitude = 0.123),
                PortFaker.fakePort(locode = "AY", name = "Auray"),
            ),
        )

        // When
        api.perform(get("/api/v1/ports"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].locode", equalTo("ET")))
            .andExpect(jsonPath("$[0].name", equalTo("Etel")))
            .andExpect(jsonPath("$[0].latitude", equalTo(47.123)))
            .andExpect(jsonPath("$[0].longitude", equalTo(0.123)))
    }

    @Test
    fun `Should invalidate the cache`() {
        // Given
        cacheManager.getCache("ports")?.put("PORT123", PortFaker.fakePort(locode = "AY", name = "Auray"))
        assertThat(cacheManager.getCache("ports")?.get("PORT123")).isNotNull()

        // When
        api.perform(put("/api/v1/ports/invalidate"))
            .andExpect(status().isOk)

        // Then
        val cache = cacheManager.getCache("ports")?.get("PORT123")
        assertThat(cache).isNull()
    }
}
