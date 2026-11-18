package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.filter.ShallowEtagHeaderFilter

/**
 * When a proxy replaces the `Cache-Control` of the versioned referentials by `no-cache`, the browser revalidates them:
 * the ETag turns this revalidation into a `304` without body instead of a full download.
 */
@Configuration
class ReferentialsEtagConfig {
    @Bean
    fun referentialsEtagFilter(): FilterRegistrationBean<ShallowEtagHeaderFilter> {
        val registrationBean = FilterRegistrationBean(ShallowEtagHeaderFilter())
        registrationBean.setUrlPatterns(REFERENTIAL_PATHS)

        return registrationBean
    }

    companion object {
        val REFERENTIAL_PATHS =
            listOf(
                "/api/v1/infractions",
                "/bff/v1/gears",
                "/bff/v1/ports",
                "/bff/v1/referentials/versions",
                "/bff/v1/regulations/catalogue",
                "/bff/v1/species",
            )
    }
}
