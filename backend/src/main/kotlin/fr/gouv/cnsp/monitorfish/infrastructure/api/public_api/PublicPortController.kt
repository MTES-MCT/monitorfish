package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.cache.CacheManager
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/ports")
@Tag(name = "Public APIs for ports")
class PublicPortController(
    private val cacheManager: CacheManager,
) {
    @PutMapping(value = ["/invalidate"])
    @Operation(summary = "Invalidate ports cache")
    fun invalidatePorts() {
        cacheManager.getCache("ports")?.invalidate()
        cacheManager.getCache("port")?.invalidate()
        cacheManager.getCache("active_ports")?.invalidate()
    }
}
