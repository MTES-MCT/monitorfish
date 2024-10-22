package fr.gouv.cnsp.monitorfish.infrastructure.api.proxy

import jakarta.servlet.http.HttpServletRequest
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.cloud.gateway.mvc.ProxyExchange
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

/**
 * Used for EE tests
 */
@RestController
@ConditionalOnProperty(
    value = ["monitorfish.keycloak.proxy.enabled"],
    havingValue = "true",
    matchIfMissing = false,
)
class KeycloakProxyController {
    @GetMapping("/realms/**")
    @Throws(Exception::class)
    fun get(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val params = request.parameterMap
        val targetUri = StringBuilder("http://0.0.0.0:8085/${request.requestURI}")

        if (params.isNotEmpty()) {
            targetUri.append("?")
            params.entries.joinToString("&") { (key, values) ->
                "${key}=${values.joinToString(",")}"
            }.let { targetUri.append(it) }
        }

        return proxy.uri(targetUri.toString()).get()
    }

    @GetMapping("/resources/**")
    @Throws(Exception::class)
    fun getResources(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val targetUri = "http://0.0.0.0:8085${request.requestURI}"

        return proxy.uri(targetUri).get()
    }

    @PostMapping("/realms/**")
    @Throws(Exception::class)
    fun post(
        proxy: ProxyExchange<ByteArray?>,
        request: HttpServletRequest,
    ): ResponseEntity<*> {
        val targetUri = "http://0.0.0.0:8085${request.requestURI}"

        return proxy.uri(targetUri).post()
    }
}
