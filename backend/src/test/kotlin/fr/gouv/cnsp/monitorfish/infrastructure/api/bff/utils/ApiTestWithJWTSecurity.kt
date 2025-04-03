package fr.gouv.cnsp.monitorfish.infrastructure.api.bff.utils

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.ProtectedPathsAPIProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.VesselGroupController
import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CustomAuthenticationEntryPoint
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.UserAuthorizationCheckFilter
import fr.gouv.cnsp.monitorfish.infrastructure.oidc.APIOIDCRepository
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.core.annotation.AliasFor
import kotlin.reflect.KClass

@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@Import(
    SecurityConfig::class,
    OIDCProperties::class,
    ProtectedPathsAPIProperties::class,
    UserAuthorizationCheckFilter::class,
    SentryConfig::class,
    CustomAuthenticationEntryPoint::class,
    APIOIDCRepository::class,
    TestApiClient::class,
    JwtDecoderTestConfig::class,
)
@WebMvcTest(
    properties = [
        "monitorfish.oidc.enabled=true",
        "spring.security.oauth2.resourceserver.jwt.public-key-location=classpath:oidc-issuer.pub",
        "monitorfish.oidc.userinfo-endpoint=/api/user",
        "monitorfish.oidc.issuer-uri=http://issuer-uri.gouv.fr",
    ],
)
annotation class ApiTestWithJWTSecurity(
    @get:AliasFor(annotation = WebMvcTest::class, attribute = "value")
    val value: Array<KClass<*>> = [VesselGroupController::class],
)
