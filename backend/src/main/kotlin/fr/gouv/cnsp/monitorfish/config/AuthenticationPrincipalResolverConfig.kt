package fr.gouv.cnsp.monitorfish.config

import org.springframework.context.annotation.Configuration
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Registers Spring Security's [AuthenticationPrincipalArgumentResolver] so that controller parameters
 * annotated with `@AuthenticationPrincipal` (e.g. `OidcUser`) are resolved.
 *
 * In the full application this resolver is also contributed by `@EnableWebSecurity`, but it is not
 * auto-registered in `@WebMvcTest` slices under Spring Boot 4 / Spring Security 7. Declaring it through a
 * [WebMvcConfigurer] makes it available in both the full context and the test slices (duplicate
 * registration is harmless: the first matching resolver wins).
 */
@Configuration
class AuthenticationPrincipalResolverConfig : WebMvcConfigurer {
    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        resolvers.add(AuthenticationPrincipalArgumentResolver())
    }
}
