package fr.gouv.cnsp.monitorfish.infrastructure.api.proxy

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import io.ktor.client.request.forms.*
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.cloud.gateway.mvc.ProxyExchange
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.RestTemplate
import java.nio.charset.StandardCharsets

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

    @Autowired
    private val restTemplate: RestTemplate? = null


    @GetMapping("/realms/**")
    @Throws(Exception::class)
    fun get(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val targetUri = StringBuilder("${oidcProperties.proxyUrl}${request.requestURI}?${request.queryString}")

        logger.info("Forwarding ${request.requestURI} to $targetUri")

        // Extract cookies from the request
        val cookies = request.cookies
        if (cookies != null) {
            val cookieHeader = cookies.joinToString("; ") { "${it.name}=${it.value}" }
            logger.info("With cookies $cookieHeader")
            // Set the cookies in the proxy request headers
            proxy.header("Cookie", cookieHeader)
        }

        // Forward all headers from the incoming request to the proxy
        val headerNames = request.headerNames
        while (headerNames.hasMoreElements()) {
            val headerName = headerNames.nextElement()
            val headerValues = request.getHeaders(headerName)
            logger.info("Header is $headerName")

            // Forward all values for each header
            while (headerValues.hasMoreElements()) {
                proxy.header(headerName, headerValues.nextElement())
            }
        }

        logger.info("Sending $proxy")
        val response = proxy.uri(targetUri.toString())
            .get()

        // Log the response details
        logger.debug("Proxied response status: {}", response.statusCode)
        logger.debug("Proxied response headers: {}", response.headers)

        return response
    }

    @GetMapping("/resources/**")
    @Throws(Exception::class)
    fun getResources(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val targetUri = "${oidcProperties.proxyUrl}${request.requestURI}"

        return proxy.uri(targetUri).get()
    }

    @PostMapping(value = ["/realms/**"], consumes = ["application/x-www-form-urlencoded", "application/x-www-form-urlencoded;charset=UTF-8"])
    @Throws(Exception::class)
    fun post(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val params = request.parameterMap
        val targetUri = StringBuilder("${oidcProperties.proxyUrl}${request.requestURI}?${request.queryString}")
        logger.info("Forwarding ${request.requestURI} to $targetUri")

        // Extract cookies from the request
        val cookies = request.cookies
        if (cookies != null) {
            val cookieHeader = cookies.joinToString("; ") { "${it.name}=${it.value}" }
            logger.info("With cookies $cookieHeader")
            // Set the cookies in the proxy request headers
            proxy.header("Cookie", cookieHeader)
        }

        // Forward all headers from the incoming request to the proxy
        val headerNames = request.headerNames
        while (headerNames.hasMoreElements()) {
            val headerName = headerNames.nextElement()
            val headerValues = request.getHeaders(headerName)
            logger.info("Header is $headerName")

            // Forward all values for each header
            while (headerValues.hasMoreElements()) {
                proxy.header(headerName, headerValues.nextElement())
            }
        }

        val formData = StringBuilder()
        if (params.isNotEmpty()) {
            params.entries.joinToString("&") { (key, values) ->
                "$key=${values.joinToString(",")}"
            }.let { formData.append(it) }
        }

        logger.info("Raw Form Data: $formData")
        val formDataBytes = formData.toString().toByteArray(StandardCharsets.UTF_8)

        // Ensure the content length matches the size of the byte array
        proxy.header("Content-Type", MediaType.APPLICATION_FORM_URLENCODED_VALUE)
            .header("Content-Length", formDataBytes.size.toString())  // Set correct content length

        return proxy.uri(targetUri.toString()).body(formDataBytes).post()
    }
}
