package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CustomAuthenticationEntryPoint
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.context.TestPropertySource
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.output.OutputFrame
import org.testcontainers.containers.output.ToStringConsumer
import org.testcontainers.containers.wait.strategy.Wait
import org.testcontainers.junit.jupiter.Testcontainers
import java.time.Duration
import java.time.temporal.ChronoUnit

@Testcontainers
@TestPropertySource("classpath:/application.properties")
@SpringBootTest
abstract class AbstractDBTests {

    @MockBean
    private lateinit var jwtDecoder: JwtDecoder

    @MockBean
    private lateinit var customAuthenticationEntryPoint: CustomAuthenticationEntryPoint

    companion object {
        @JvmStatic
        val container = GenericContainer("ghcr.io/mtes-mct/monitorfish/monitorfish-database:pg16-ts2.14.2-postgis3.4.2")
            .apply {
                withExposedPorts(5432)
                withEnv("POSTGRES_DB", "testdb")
                withEnv("POSTGRES_USER", "postgres")
                withEnv("POSTGRES_PASSWORD", "postgres")
                waitingFor(
                    Wait.forLogMessage(".*ready to accept connections.*\\s", 2),
                )
                withStartupTimeout(Duration.of(60L, ChronoUnit.SECONDS))
                this.start()
            }

        @JvmStatic
        @DynamicPropertySource
        fun properties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") { getJdbcUrl() }
        }

        private fun getJdbcUrl(): String {
            val toStringConsumer = ToStringConsumer()
            container.followOutput(toStringConsumer, OutputFrame.OutputType.STDOUT)

            return "jdbc:postgresql://" + container.host + ":" + container.getMappedPort(
                PostgreSQLContainer.POSTGRESQL_PORT,
            ).toString() + "/testdb?user=postgres&password=postgres"
        }
    }
}
