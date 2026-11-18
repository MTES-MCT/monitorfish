package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialInvalidation
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CaffeineConfiguration
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
    CaffeineConfiguration::class,
    ReferentialInvalidation::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [PublicReferentialController::class])
class PublicReferentialControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    private lateinit var cacheManager: CacheManager

    @ParameterizedTest
    @CsvSource(
        "infractions, ${CacheName.INFRACTIONS}",
        "infractions, ${CacheName.REFERENTIAL_INFRACTIONS}",
        "regulations, ${CacheName.REFERENTIAL_REGULATIONS}",
        "species, ${CacheName.ALL_SPECIES}",
        "species, ${CacheName.ALL_SPECIES_GROUPS}",
        "species, ${CacheName.REFERENTIAL_SPECIES}",
    )
    fun `Should invalidate the caches of a referential`(
        referential: String,
        cacheName: String,
    ) {
        // Given
        cacheManager.getCache(cacheName)?.put("KEY", "VALUE")
        assertThat(cacheManager.getCache(cacheName)?.get("KEY")).isNotNull()

        // When
        api
            .perform(put("/api/v1/$referential/invalidate"))
            // Then
            .andExpect(status().isOk)

        assertThat(cacheManager.getCache(cacheName)?.get("KEY")).isNull()
    }
}
