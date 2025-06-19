package fr.gouv.cnsp.monitorfish.domain.mappers

import fr.gouv.cnsp.monitorfish.config.Patchable
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import java.util.*

data class PatchedEntity(
    @Patchable
    var name: String?,
    @Patchable
    var age: Int,
    val ignored: String? = null,
)

data class EntityUpdate(
    val name: Optional<String>?,
    val age: Optional<Int>?,
    val ignored: Optional<String>? = null,
)

class PatchEntityUTests {
    private val patcherOptional = PatchEntity<PatchedEntity, EntityUpdate>()

    @Test
    fun `patch with non-null values replaces existing ones`() {
        // Given
        val patched = PatchedEntity(name = "Alice", age = 30)
        val update = EntityUpdate(name = Optional.of("Bob"), age = Optional.of(40))

        // When
        val result = patcherOptional.execute(patched, update)

        // Then
        assertThat(result.name).isEqualTo("Bob")
        assertThat(result.age).isEqualTo(40)
    }

    @Test
    fun `patch with null values keeps existing ones`() {
        // Given
        val patched = PatchedEntity(name = "Alice", age = 30)
        val update = EntityUpdate(name = null, age = null)

        // When
        val result = patcherOptional.execute(patched, update)

        // Then
        assertThat(result.name).isEqualTo("Alice")
        assertThat(result.age).isEqualTo(30)
    }

    @Test
    fun `patch with Optional present values replaces existing ones`() {
        // Given
        val patched = PatchedEntity(name = "Alice", age = 30)
        val update =
            EntityUpdate(
                name = Optional.of("Bob"),
                age = Optional.of(40),
            )

        // When
        val result = patcherOptional.execute(patched, update)

        // Then
        assertThat(result.name).isEqualTo("Bob")
        assertThat(result.age).isEqualTo(40)
    }

    @Test
    fun `patch with Optional empty values Should throw an exception When setting an non-nullable value to null`() {
        // Given
        val patched = PatchedEntity(name = "Alice", age = 30)
        val update =
            EntityUpdate(
                name = Optional.empty(),
                age = Optional.empty(),
            )

        // When
        val exception =
            catchThrowable {
                patcherOptional.execute(patched, update)
            }

        // Then
        assertThat(exception.message).isEqualTo("Could not set property 'age'")
    }

    @Test
    fun `patch with null Optional values keeps existing ones`() {
        // Given
        val patched = PatchedEntity(name = "Alice", age = 30)
        val update =
            EntityUpdate(
                name = null,
                age = null,
            )

        // When
        val result = patcherOptional.execute(patched, update)

        // Then
        assertThat(result.name).isEqualTo("Alice")
        assertThat(result.age).isEqualTo(30)
    }

    @Test
    fun `non-patchable fields are not updated`() {
        // Given
        val patched = PatchedEntity(name = "Alice", age = 30, ignored = "Original")
        val update =
            EntityUpdate(
                name = Optional.of("Bob"),
                age = Optional.of(40),
                ignored = Optional.of("Updated"),
            )

        // When
        val result = patcherOptional.execute(patched, update)

        // Then
        assertThat(result.name).isEqualTo("Bob")
        assertThat(result.age).isEqualTo(40)
        assertThat(result.ignored).isEqualTo("Original") // Not patchable
    }
}
