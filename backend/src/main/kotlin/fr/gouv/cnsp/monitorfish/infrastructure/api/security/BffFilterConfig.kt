package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.ProtectedPathsAPIProperties
import fr.gouv.cnsp.monitorfish.config.SuperUserAPIProperties
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class BffFilterConfig(
    private val superUserAPIProperties: SuperUserAPIProperties,
    private val protectedPathsAPIProperties: ProtectedPathsAPIProperties,
    private val oidcProperties: OIDCProperties,
    private val apiClient: ApiClient,
    private val getIsAuthorizedUser: GetIsAuthorizedUser,
) {
    private val logger: Logger = LoggerFactory.getLogger(BffFilterConfig::class.java)

    @Bean(name = ["userAuthorizationCheckFilter"])
    fun userAuthorizationCheckFilter(): FilterRegistrationBean<UserAuthorizationCheckFilter> {
        val registrationBean = FilterRegistrationBean<UserAuthorizationCheckFilter>()

        registrationBean.filter = UserAuthorizationCheckFilter(
            oidcProperties,
            superUserAPIProperties,
            apiClient,
            getIsAuthorizedUser,
        )
        registrationBean.urlPatterns = protectedPathsAPIProperties.paths

        if (registrationBean.urlPatterns == null) {
            logger.warn(
                "WARNING: No user authentication path given." +
                    "See `monitorfish.api.protected.path` application property.",
            )
        }

        logger.info("Adding user authentication for paths: ${protectedPathsAPIProperties.paths}")
        logger.info("Super-user protected paths : ${superUserAPIProperties.paths}")

        return registrationBean
    }
}
