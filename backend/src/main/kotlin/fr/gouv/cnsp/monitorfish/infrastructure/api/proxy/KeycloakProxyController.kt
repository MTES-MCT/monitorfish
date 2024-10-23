package fr.gouv.cnsp.monitorfish.infrastructure.api.proxy

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.APIControlUnitRepository
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.Logger
import org.slf4j.LoggerFactory
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
    private val logger: Logger = LoggerFactory.getLogger(KeycloakProxyController::class.java)

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
        logger.info("Forwarding $request to $targetUri")
        logger.info("With cookies ${request.cookies}")

        // Extract cookies from the request
        val cookies = request.cookies
        if (cookies != null) {
            val cookieHeader = cookies.joinToString("; ") { "${it.name}=${it.value}" }
            // Set the cookies in the proxy request headers
            proxy.header("Cookie", cookieHeader)
        }

        // Forward all headers from the incoming request to the proxy
        val headerNames = request.headerNames
        logger.info("Headers are $headerNames")
        while (headerNames.hasMoreElements()) {
            val headerName = headerNames.nextElement()
            val headerValues = request.getHeaders(headerName)

            // Forward all values for each header
            while (headerValues.hasMoreElements()) {
                proxy.header(headerName, headerValues.nextElement())
            }
        }

        logger.info("Sending $proxy")
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
