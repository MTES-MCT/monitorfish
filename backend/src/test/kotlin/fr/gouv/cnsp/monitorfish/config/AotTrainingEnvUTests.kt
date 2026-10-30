package fr.gouv.cnsp.monitorfish.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

/**
 * The AOT cache training run of the app image (see ADR-0014) starts the backend with the dummy values of
 * `infra/docker/app/aot-training.env`: a required variable missing there makes the image build fail late,
 * in the middle of the Docker logs.
 */
class AotTrainingEnvUTests {
    private val variablesSetByTheImage = setOf("STATIC_FILES_PATH")

    @Test
    fun `aot-training env Should define every environment variable required by application yml`() {
        // Given
        val requiredVariables =
            Regex("""\$\{([A-Z0-9_]+)}""")
                .findAll(File("src/main/resources/application.yml").readText())
                .map { it.groupValues[1] }
                .toSet() - variablesSetByTheImage

        // When
        val trainingVariables =
            File("../infra/docker/app/aot-training.env")
                .readLines()
                .filterNot { it.isBlank() || it.startsWith("#") }
                .map { it.substringBefore("=") }
                .toSet()

        // Then
        assertThat(trainingVariables)
            .describedAs("Add the missing variables to infra/docker/app/aot-training.env")
            .containsAll(requiredVariables)
    }
}
