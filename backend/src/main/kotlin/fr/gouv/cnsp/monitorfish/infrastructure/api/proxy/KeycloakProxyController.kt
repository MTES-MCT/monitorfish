package fr.gouv.cnsp.monitorfish.infrastructure.api.proxy

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.cloud.gateway.mvc.ProxyExchange
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
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
class KeycloakProxyController(
    private val oidcProperties: OIDCProperties,
) {
    private val logger: Logger = LoggerFactory.getLogger(KeycloakProxyController::class.java)

    @GetMapping("/realms/**")
    @Throws(Exception::class)
    fun get(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val queryString = request.queryString?.let { "?$it" } ?: ""
        val targetUri = "${oidcProperties.proxyUrl}${request.requestURI}$queryString"
        logger.info("Forwarding ${request.requestURI} to $targetUri")

        // TODO Use properties to pass all sensitive headers
        // @see https://docs.spring.io/spring-cloud-gateway/reference/appendix.html
        val headerNames = request.headerNames
        while (headerNames.hasMoreElements()) {
            val headerName = headerNames.nextElement()
            val headerValues = request.getHeaders(headerName)
            while (headerValues.hasMoreElements()) {
                proxy.header(headerName, headerValues.nextElement())
            }
        }

        val response = proxy.uri(targetUri).get()
        return ResponseEntity
            .status(response.statusCode)
            .headers(
                HttpHeaders().apply {
                    putAll(response.headers)
                    // Remove CORS header put by keycloak
                    remove("Access-Control-Allow-Origin")
                },
            ).body(response.body)
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

    @PostMapping(
        value = ["/realms/**"],
        consumes = ["application/x-www-form-urlencoded", "application/x-www-form-urlencoded;charset=UTF-8"],
    )
    @Throws(Exception::class)
    fun post(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val params = request.parameterMap
        val targetUri = StringBuilder("${oidcProperties.proxyUrl}${request.requestURI}?${request.queryString}")
        logger.info("Forwarding ${request.requestURI} to $targetUri")

        // TODO Use properties to pass all sensitive headers
        // @see https://docs.spring.io/spring-cloud-gateway/reference/appendix.html
        val headerNames = request.headerNames
        while (headerNames.hasMoreElements()) {
            val headerName = headerNames.nextElement()
            val headerValues = request.getHeaders(headerName)

            while (headerValues.hasMoreElements()) {
                proxy.header(headerName, headerValues.nextElement())
            }
        }

        // TODO Use properties to pass form data
        // @see spring.cloud.gateway.mvc.form-filter.enabled=false
        val formData = StringBuilder()
        if (params.isNotEmpty()) {
            params.entries
                .joinToString("&") { (key, values) ->
                    "$key=${values.joinToString(",")}"
                }.let { formData.append(it) }
        }

        val formDataBytes = formData.toString().toByteArray(StandardCharsets.UTF_8)

        // Ensure the content length matches the size of the byte array
        proxy
            .header("Content-Type", MediaType.APPLICATION_FORM_URLENCODED_VALUE)
            .header("Content-Length", formDataBytes.size.toString())
        return proxy.uri(targetUri.toString()).body(formDataBytes).post()
    }
}
