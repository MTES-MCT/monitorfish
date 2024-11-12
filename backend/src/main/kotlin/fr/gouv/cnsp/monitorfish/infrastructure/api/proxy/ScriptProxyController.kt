package fr.gouv.cnsp.monitorfish.infrastructure.api.proxy

import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.RestTemplate

@RestController
@RequestMapping("/proxy/scripts")
class ScriptProxyController(
    private val restTemplate: RestTemplate,
) {
    @GetMapping("/smallchat.js")
    fun proxySmallChatScript(): ResponseEntity<String> {
        println("Proxying SmallChat script")

        val smallChatUrl = "https://embed.small.chat/T0176BBUCEQC01SV3W4464.js"

        val scriptResponse = restTemplate.getForEntity(smallChatUrl, String::class.java)

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "application/javascript")
            .body(scriptResponse.body)
    }
}
