package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.API_KEY_FILTER_PRECEDENCE
import fr.gouv.cnsp.monitorfish.infrastructure.api.USER_AUTH_FILTER_PRECEDENCE
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class BffFilterConfig(
    private val protectedPathsAPIProperties: ProtectedPathsAPIProperties,
    private val oidcProperties: OIDCProperties,
    private val apiClient: ApiClient,
    private val getIsAuthorizedUser: GetIsAuthorizedUser,
) {
    private val logger: Logger = LoggerFactory.getLogger(BffFilterConfig::class.java)

    @Bean(name = ["userAuthorizationCheckFilter"])
    fun userAuthorizationCheckFilter(): FilterRegistrationBean<UserAuthorizationCheckFilter> {
        val registrationBean = FilterRegistrationBean<UserAuthorizationCheckFilter>()

        registrationBean.order = USER_AUTH_FILTER_PRECEDENCE
        registrationBean.filter = UserAuthorizationCheckFilter(
            oidcProperties,
            protectedPathsAPIProperties,
            apiClient,
            getIsAuthorizedUser,
        )
        registrationBean.urlPatterns = protectedPathsAPIProperties.paths

        if (registrationBean.urlPatterns == null) {
            logger.warn(
                "WARNING: No user authentication path given." +
                    "See `monitorfish.api.protected.paths` application property.",
            )
        }

        logger.info("Adding user authentication for paths: ${protectedPathsAPIProperties.paths}")
        logger.info("Super-user protected paths : ${protectedPathsAPIProperties.superUserPaths}")

        return registrationBean
    }

    @Bean(name = ["publicPathsApiKeyCheckFilter"])
    fun publicPathsApiKeyCheckFilter(): FilterRegistrationBean<ApiKeyCheckFilter> {
        val registrationBean = FilterRegistrationBean<ApiKeyCheckFilter>()

        registrationBean.order = API_KEY_FILTER_PRECEDENCE
        registrationBean.filter = ApiKeyCheckFilter(
            protectedPathsAPIProperties,
        )
        registrationBean.urlPatterns = protectedPathsAPIProperties.publicPaths
        if (registrationBean.urlPatterns == null) {
            logger.warn(
                "WARNING: Public paths are not protected." +
                    "See `monitorfish.api.protected.public-paths` application property.",
            )
        }

        logger.info("Adding api key authentication for public paths: ${protectedPathsAPIProperties.publicPaths}")

        return registrationBean
    }
}
