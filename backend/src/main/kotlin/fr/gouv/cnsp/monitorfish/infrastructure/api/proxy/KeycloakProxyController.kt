package fr.gouv.cnsp.monitorfish.infrastructure.api.proxy

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import jakarta.servlet.http.HttpServletRequest
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.cloud.gateway.mvc.ProxyExchange
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Used for E2E tests
 */
@RestController
@ConditionalOnProperty(
    value = ["monitorfish.keycloak.proxy.enabled"],
    havingValue = "true",
    matchIfMissing = false,
)
class KeycloakProxyController (
    private val oidcProperties: OIDCProperties,
) {
    @GetMapping("/realms/**")
    @Throws(Exception::class)
    fun get(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val params = request.parameterMap
        val targetUri = StringBuilder("${oidcProperties.proxyUrl}/${request.requestURI}")

        if (params.isNotEmpty()) {
            targetUri.append("?")
            params.entries.joinToString("&") { (key, values) ->
                "$key=${values.joinToString(",")}"
            }.let { targetUri.append(it) }
        }

        // Extract cookies from the request
        val cookies = request.cookies
        if (cookies != null) {
            val cookieHeader = cookies.joinToString("; ") { "${it.name}=${it.value}" }
            // Set the cookies in the proxy request headers
            proxy.header("Cookie", cookieHeader)
        }

        return proxy.uri(targetUri.toString()).get()
    }

    @GetMapping("/resources/**")
    @Throws(Exception::class)
    fun getResources(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val targetUri = "${oidcProperties.proxyUrl}/${request.requestURI}"

        return proxy.uri(targetUri).get()
    }

    @PostMapping("/realms/**")
    @Throws(Exception::class)
    fun post(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val targetUri = "${oidcProperties.proxyUrl}/${request.requestURI}"

        return proxy.uri(targetUri).post()
    }
}