package fr.gouv.cnsp.monitorfish.infrastructure.api.development

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import io.ktor.client.request.forms.*
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.cloud.gateway.mvc.ProxyExchange
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import java.nio.charset.StandardCharsets

/**
 * ⚠️ DEVELOPMENT ONLY - Keycloak Authentication Proxy
 *
 * This controller is ONLY used for local development and E2E testing.
 * It provides a proxy between the MonitorFish application and a Keycloak server
 * to handle authentication flows during development.
 *
 * ❌ This controller is NEVER enabled in production environments.
 * ✅ Only activated when `monitorfish.keycloak.proxy.enabled=true`
 *
 * Purpose:
 * - Local development authentication testing
 * - E2E/Cypress test authentication flows
 * - URL rewriting for localhost development environment
 *
 * @see KeycloakProxyProperties for configuration
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

    init {
        logger.warn(
            """
            ⚠️ DEVELOPMENT ONLY: Keycloak Proxy Controller is ACTIVE
            This controller should NEVER be enabled in production!
            Current configuration: monitorfish.keycloak.proxy.enabled=true
            """.trimIndent(),
        )
    }

    /**
     * ⚠️ DEVELOPMENT ONLY - Proxy GET requests to Keycloak realms
     *
     * Forwards authentication page requests to the Keycloak server
     * and rewrites HTML responses to fix URLs for local development.
     */
    @GetMapping("/realms/**")
    @Throws(Exception::class)
    fun get(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val targetUri = StringBuilder("${oidcProperties.proxyUrl}${request.requestURI}?${request.queryString}")
        logger.info("[DEV-PROXY] Forwarding ${request.requestURI} to $targetUri")

        return try {
            // TODO Use properties to pass all sensitive headers
            // @see https://docs.spring.io/spring-cloud-gateway/reference/appendix.html
            // NOTE: This is acceptable for development/testing only
            val headerNames = request.headerNames
            while (headerNames.hasMoreElements()) {
                val headerName = headerNames.nextElement()
                val headerValues = request.getHeaders(headerName)

                while (headerValues.hasMoreElements()) {
                    proxy.header(headerName, headerValues.nextElement())
                }
            }

            val response =
                proxy
                    .uri(targetUri.toString())
                    .get()

            // Remove duplicate CORS header added by Spring Cloud Gateway MVC
            // See: https://github.com/spring-cloud/spring-cloud-gateway/issues/3787
            val cleanedResponse = removeCorsHeader(response)

            // Rewrite HTML responses to fix form action URLs
            if (isHtmlResponse(cleanedResponse)) {
                rewriteHtmlResponse(cleanedResponse, request)
            } else {
                cleanedResponse
            }
        } catch (e: Exception) {
            logger.error("[DEV-PROXY] Error forwarding request to $targetUri", e)
            throw e
        }
    }

    /**
     * ⚠️ DEVELOPMENT ONLY - Proxy GET requests for Keycloak resources
     *
     * Forwards requests for Keycloak static resources (CSS, JS, images)
     * to the Keycloak server for local development.
     */
    @GetMapping("/resources/**")
    @Throws(Exception::class)
    fun getResources(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val targetUri = "${oidcProperties.proxyUrl}${request.requestURI}"

        val response =
            proxy
                .uri(targetUri)
                .get()

        // Remove duplicate CORS header added by Spring Cloud Gateway MVC
        // See: https://github.com/spring-cloud/spring-cloud-gateway/issues/3787
        return removeCorsHeader(response)
    }

    /**
     * ⚠️ DEVELOPMENT ONLY - Proxy POST requests to Keycloak realms
     *
     * Forwards form submissions (login, logout, etc.) to the Keycloak server
     * and rewrites HTML responses to fix URLs for local development.
     */
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
        logger.info("[DEV-PROXY] Forwarding ${request.requestURI} to $targetUri")

        return try {
            // TODO Use properties to pass all sensitive headers
            // @see https://docs.spring.io/spring-cloud-gateway/reference/appendix.html
            // NOTE: This is acceptable for development/testing only
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
            // NOTE: This is acceptable for development/testing only
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
            val response =
                proxy
                    .uri(targetUri.toString())
                    .body(formDataBytes)
                    .post()

            // Remove duplicate CORS header added by Spring Cloud Gateway MVC
            // See: https://github.com/spring-cloud/spring-cloud-gateway/issues/3787
            val cleanedResponse = removeCorsHeader(response)

            // Rewrite HTML responses to fix form action URLs
            if (isHtmlResponse(cleanedResponse)) {
                rewriteHtmlResponse(cleanedResponse, request)
            } else {
                cleanedResponse
            }
        } catch (e: Exception) {
            logger.error("[DEV-PROXY] Error forwarding POST request to $targetUri", e)
            throw e
        }
    }

    private fun removeCorsHeader(response: ResponseEntity<*>): ResponseEntity<*> {
        // In Spring Boot 3.4+, headers are ReadOnlyHttpHeaders and cannot be modified
        // We need to create a new ResponseEntity with filtered headers
        val newHeaders = response.headers.toMutableMap()
        newHeaders.remove("Access-Control-Allow-Origin")

        return ResponseEntity
            .status(response.statusCode)
            .headers { headers ->
                newHeaders.forEach { (key, values) ->
                    headers.addAll(key, values)
                }
            }.body(response.body)
    }

    private fun isHtmlResponse(response: ResponseEntity<*>): Boolean {
        val contentType = response.headers.contentType
        return contentType?.toString()?.contains("text/html") == true
    }

    private fun rewriteHtmlResponse(response: ResponseEntity<*>, request: HttpServletRequest): ResponseEntity<*> {
        try {
            val body = response.body as? ByteArray ?: return response
            val html = String(body, StandardCharsets.UTF_8)

            // Detect the origin of the request to rewrite URLs appropriately
            // This allows Cypress tests to work in dev mode (localhost:3000) as well as in CI (localhost:8880 or app:8880)
            val targetOrigin = detectTargetOrigin(request)
            logger.info("[DEV-PROXY] Rewriting HTML responses to use origin: $targetOrigin")

            // Replace Keycloak internal URLs with proxy URLs for local development
            val rewrittenHtml =
                html
                    .replace("http://keycloak:8080", targetOrigin)
                    .replace("action=\"/realms/", "action=\"$targetOrigin/realms/")
                    .replace("href=\"/realms/", "href=\"$targetOrigin/realms/")
                    .replace("src=\"/realms/", "src=\"$targetOrigin/realms/")

            val rewrittenBody = rewrittenHtml.toByteArray(StandardCharsets.UTF_8)

            // Create new headers without Content-Length (Spring will set it automatically)
            val newHeaders = response.headers.toMutableMap()
            newHeaders.remove("Content-Length")

            return ResponseEntity
                .status(response.statusCode)
                .headers { headers ->
                    newHeaders.forEach { (key, values) ->
                        headers.addAll(key, values)
                    }
                }.body(rewrittenBody)
        } catch (e: Exception) {
            logger.error("Error rewriting HTML response", e)
            return response
        }
    }

    /**
     * Detect the target origin for URL rewriting based on the request origin
     *
     * - If request comes from localhost:3000 (dev mode frontend), rewrite to localhost:3000
     * - If request comes from localhost:8880 (dev mode or CI frontend on same port), rewrite to localhost:8880
     * - If request comes from app:8880 (Docker CI environment), rewrite to app:8880
     * - Default to localhost:8880
     */
    private fun detectTargetOrigin(request: HttpServletRequest): String {
        // Check Referer header first (most reliable for POST requests)
        val referer = request.getHeader("Referer")
        if (!referer.isNullOrBlank()) {
            logger.debug("[DEV-PROXY] Detected referer: $referer")
            return when {
                referer.contains("localhost:3000") -> "http://localhost:3000"
                referer.contains("localhost:8880") -> "http://localhost:8880"
                referer.contains("app:8880") -> "http://app:8880"
                else -> "http://localhost:8880" // Default
            }
        }

        // Check Origin header as fallback (for CORS preflight or certain requests)
        val origin = request.getHeader("Origin")
        if (!origin.isNullOrBlank()) {
            logger.debug("[DEV-PROXY] Detected origin header: $origin")
            return origin
        }

        // Check X-Forwarded-Host for proxy scenarios
        val forwardedHost = request.getHeader("X-Forwarded-Host")
        if (!forwardedHost.isNullOrBlank()) {
            logger.debug("[DEV-PROXY] Detected forwarded host: $forwardedHost")
            return when {
                forwardedHost.contains("localhost:3000") -> "http://localhost:3000"
                forwardedHost.contains("localhost:8880") -> "http://localhost:8880"
                forwardedHost.contains("app") -> "http://app:8880"
                else -> "http://localhost:8880"
            }
        }

        // Default fallback
        logger.debug("[DEV-PROXY] No origin detected, defaulting to localhost:8880")
        return "http://localhost:8880"
    }
}
