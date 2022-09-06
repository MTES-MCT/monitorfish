package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate

@Configuration
class RestTemplateConfig {
  @Bean
  fun restTemplate(restTemplateBuilder: RestTemplateBuilder): RestTemplate {
    return restTemplateBuilder.build()
  }
}
