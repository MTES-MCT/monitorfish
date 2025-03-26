package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.TestUtils.Companion.getMockApiClient
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean

@TestConfiguration
class TestApiClient {
    @Bean
    fun mockApiClient(): ApiClient = getMockApiClient()
}
