package fr.gouv.cnsp.monitorfish.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.Collections;

@Configuration
@EnableSwagger2
public class SwaggerConfig {
    @Bean
    public Docket airQualityApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.basePackage("fr.gouv.cnsp.monitorfish"))
                .paths(PathSelectors.any())
                .build()
                .apiInfo(new ApiInfo(
                        "API Documentation",
                        "This is public API",
                        "v1",
                        "",
                        new Contact("CNSP", "URL", "EMAIL"),
                        "APACHE",
                        "LICENSE URL",
                        Collections.emptyList()
                ))
                .enableUrlTemplating(true);
    }
}
