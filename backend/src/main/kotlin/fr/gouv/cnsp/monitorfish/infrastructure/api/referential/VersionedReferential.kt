package fr.gouv.cnsp.monitorfish.infrastructure.api.referential

import org.springframework.http.CacheControl
import org.springframework.http.ResponseEntity
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

/**
 * A referential with the version of its content, so that browsers can keep it between sessions:
 * requested with `?v=<version>`, it is cached as long as the version does not change.
 */
data class VersionedReferential<T : Any>(
    val data: T,
    val version: String,
) {
    /**
     * Only the current version may be cached for good: an outdated `v` (a referential updated since the versions
     * were fetched) must not pin the new content to the old URL.
     */
    fun toResponse(requestedVersion: String?): ResponseEntity<T> {
        val response = ResponseEntity.ok()
        if (requestedVersion == version) {
            response.cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePrivate().immutable())
        }

        return response.body(data)
    }

    companion object {
        private const val VERSION_BYTES = 8

        fun <T : Any> of(
            data: T,
            content: ByteArray,
        ): VersionedReferential<T> = VersionedReferential(data, versionOf(content))

        private fun versionOf(content: ByteArray): String =
            MessageDigest
                .getInstance("SHA-256")
                .digest(content)
                .take(VERSION_BYTES)
                .joinToString("") { "%02x".format(it) }
    }
}
