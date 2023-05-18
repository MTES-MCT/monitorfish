package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class BffFilterConfig(
    private val userAuthorizationCheckFilter: UserAuthorizationCheckFilter,
) {

    @Bean(name = ["userAuthorizationCheckFilter"])
    fun userAuthorizationCheckFilter(): FilterRegistrationBean<UserAuthorizationCheckFilter> {
        val registrationBean = FilterRegistrationBean<UserAuthorizationCheckFilter>()

        registrationBean.filter = userAuthorizationCheckFilter
        registrationBean.addUrlPatterns("/bff/*")

        return registrationBean
    }
}
