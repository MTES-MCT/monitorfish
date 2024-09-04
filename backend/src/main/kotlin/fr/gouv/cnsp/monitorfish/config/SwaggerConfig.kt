package fr.gouv.cnsp.monitorfish.config

import io.swagger.v3.oas.models.ExternalDocumentation
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.License
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class SwaggerConfig {
    @Autowired
    private val hostProperties: HostProperties? = null

    @Bean
    fun api(): OpenAPI {
        return OpenAPI()
            .info(
                Info().title("MonitorFish API")
                    .description("MonitorFish")
                    .version("v1.19.2")
                    .license(License().name("Apache 2.0").url("https://monitorfish.readthedocs.io/en/latest")),
            )
            .externalDocs(
                ExternalDocumentation()
                    .description("MonitorFish Documentation")
                    .url("https://monitorfish.readthedocs.io/en/latest"),
            )
    }
}
