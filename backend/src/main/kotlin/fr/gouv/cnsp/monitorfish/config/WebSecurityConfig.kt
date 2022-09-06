package fr.gouv.cnsp.monitorfish.config

import org.springframework.context.annotation.Bean
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@EnableWebSecurity
class WebSecurityConfig() : WebSecurityConfigurerAdapter() {
  override fun configure(http: HttpSecurity) {
    http
      .cors().and()
      .csrf().disable()
      .authorizeRequests()
      .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
  }

  @Bean
  fun corsConfigurationSource(): CorsConfigurationSource {
    val configuration = CorsConfiguration().apply {
      allowedOrigins = listOf("*")
      allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "DELETE")
      allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type")
    }

    val source = UrlBasedCorsConfigurationSource()
    source.registerCorsConfiguration("/**", configuration)

    return source
  }
}
