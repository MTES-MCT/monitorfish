package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SuperUserAPIProperties
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class BffFilterConfig(
    private val superUserAPIProperties: SuperUserAPIProperties,
    private val oidcProperties: OIDCProperties,
    private val apiClient: ApiClient,
    private val getIsAuthorizedUser: GetIsAuthorizedUser,
) {
    @Bean(name = ["userAuthorizationCheckFilter"])
    fun userAuthorizationCheckFilter(): FilterRegistrationBean<UserAuthorizationCheckFilter> {
        val registrationBean = FilterRegistrationBean<UserAuthorizationCheckFilter>()

        registrationBean.filter = UserAuthorizationCheckFilter(oidcProperties, apiClient, getIsAuthorizedUser)
        superUserAPIProperties.paths?.forEach { restrictedPath ->
            registrationBean.addUrlPatterns(restrictedPath)
        }

        return registrationBean
    }
}
