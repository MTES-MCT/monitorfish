package fr.gouv.cnsp.monitorfish.infrastructure.api.development

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.cache.Cache
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Import
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(E2eCacheController::class)])
@TestPropertySource(properties = ["monitorfish.e2e.cache-reset.enabled=true"])
class E2eCacheControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var cacheManager: CacheManager

    @Test
    fun `Should clear all caches`() {
        // Given
        val firstCache = mock(Cache::class.java)
        val secondCache = mock(Cache::class.java)
        given(cacheManager.cacheNames).willReturn(listOf("first", "second"))
        given(cacheManager.getCache("first")).willReturn(firstCache)
        given(cacheManager.getCache("second")).willReturn(secondCache)

        // When
        api
            .perform(delete("/api/v1/e2e/caches"))
            // Then
            .andExpect(status().isNoContent)

        verify(firstCache).clear()
        verify(secondCache).clear()
    }
}
