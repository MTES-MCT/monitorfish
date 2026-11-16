package fr.gouv.cnsp.monitorfish.infrastructure.api.referential

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class VersionedReferentialUTests {
    @Test
    fun `of Should give the same version to the same content`() {
        // When
        val first = VersionedReferential.of("A", """{"code":"COD"}""".toByteArray())
        val second = VersionedReferential.of("B", """{"code":"COD"}""".toByteArray())

        // Then
        assertThat(first.version).hasSize(16)
        assertThat(first.version).isEqualTo(second.version)
    }

    @Test
    fun `of Should give another version to another content`() {
        // When
        val first = VersionedReferential.of("A", """{"code":"COD"}""".toByteArray())
        val second = VersionedReferential.of("A", """{"code":"HKE"}""".toByteArray())

        // Then
        assertThat(first.version).isNotEqualTo(second.version)
    }

    @Test
    fun `toResponse Should only let the browser keep the current version`() {
        // Given
        val referential = VersionedReferential("A", "a1b2")

        // When
        val current = referential.toResponse("a1b2")
        val outdated = referential.toResponse("c3d4")
        val unversioned = referential.toResponse(null)

        // Then
        assertThat(current.headers.cacheControl).isEqualTo("max-age=31536000, private, immutable")
        assertThat(outdated.headers.cacheControl).isNull()
        assertThat(unversioned.headers.cacheControl).isNull()
        assertThat(current.body).isEqualTo("A")
        assertThat(outdated.body).isEqualTo("A")
    }
}
