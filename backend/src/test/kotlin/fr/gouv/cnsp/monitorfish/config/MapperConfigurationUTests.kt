package fr.gouv.cnsp.monitorfish.config

import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input.PatchableMissionActionDataInput
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime
import java.util.Optional

class MapperConfigurationUTests {
    private val mapper = MapperConfiguration().objectMapper()

    @Test
    fun `objectMapper Should register the Jdk8 module required to deserialize Optional fields`() {
        // The MVC mapper must not depend on classpath scanning to find the Jdk8 module:
        // jackson-datatype-jdk8 is present on the test classpath through test-only
        // dependencies, but production only has the dependencies declared in build.gradle.kts.
        assertThat(mapper.registeredModuleIds).contains("com.fasterxml.jackson.datatype.jdk8.Jdk8Module")
    }

    @Test
    fun `objectMapper Should deserialize Optional datetime fields of a PATCH mission action payload`() {
        // Given
        val payload =
            """{"observationsByUnit":null,"actionDatetimeUtc":"2026-06-10T08:42:00Z","actionEndDatetimeUtc":"2026-06-10T09:30:59Z"}"""

        // When
        val input = mapper.readValue(payload, PatchableMissionActionDataInput::class.java)

        // Then
        assertThat(input.actionDatetimeUtc).isEqualTo(Optional.of(ZonedDateTime.parse("2026-06-10T08:42:00Z")))
        assertThat(input.actionEndDatetimeUtc).isEqualTo(Optional.of(ZonedDateTime.parse("2026-06-10T09:30:59Z")))
        assertThat(input.observationsByUnit).isEqualTo(Optional.empty<String>())
    }
}
