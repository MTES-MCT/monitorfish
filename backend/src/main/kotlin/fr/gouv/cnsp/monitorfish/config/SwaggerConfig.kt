package fr.gouv.cnsp.monitorfish.config

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import springfox.documentation.builders.PathSelectors
import springfox.documentation.builders.RequestHandlerSelectors
import springfox.documentation.service.ApiInfo
import springfox.documentation.service.Contact
import springfox.documentation.spi.DocumentationType
import springfox.documentation.spring.web.plugins.Docket
import springfox.documentation.swagger2.annotations.EnableSwagger2

@Configuration
@EnableSwagger2
class SwaggerConfig {

    @Autowired
    private val hostProperties: HostProperties? = null

    @Bean
    fun api(): Docket {
        println("YEAH")
        println(hostProperties?.ip)
        return Docket(DocumentationType.SWAGGER_2)
                .host(hostProperties?.ip ?: "localhost")
                .select()
                .apis(RequestHandlerSelectors.basePackage("fr.gouv.cnsp.monitorfish"))
                .paths(PathSelectors.any())
                .build()
                .apiInfo(ApiInfo(
                        "API Documentation",
                        "This is public API",
                        "v1",
                        "",
                        Contact("CNSP", "URL", "EMAIL"),
                        "APACHE 2",
                        "LICENSE URL", emptyList()))
                .enableUrlTemplating(true)
    }
}