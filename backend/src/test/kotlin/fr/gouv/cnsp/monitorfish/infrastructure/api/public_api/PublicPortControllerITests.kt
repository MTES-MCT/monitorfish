package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CaffeineConfiguration
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

@Import(SentryConfig::class, CaffeineConfiguration::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [PublicPortController::class])
class PublicPortControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    lateinit var cacheManager: CacheManager

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
