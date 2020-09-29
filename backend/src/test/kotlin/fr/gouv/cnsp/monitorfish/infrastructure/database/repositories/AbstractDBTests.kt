package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.context.TestPropertySource
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers


@Testcontainers
@SpringBootTest
@TestPropertySource("classpath:/application.properties")
abstract class AbstractDBTests {

    companion object {
        @JvmStatic
        @Container
        val container = GenericContainer<Nothing>("timescale/timescaledb-postgis:1.7.4-pg11")
                .apply {
                    withExposedPorts(5432)
                    withEnv("POSTGRES_DB", "testdb")
                    withEnv("POSTGRES_USER", "postgres")
                    withEnv("POSTGRES_PASSWORD", "postgres")
                }

        @JvmStatic
        @DynamicPropertySource
        fun properties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") { getJdbcUrl() }
        }

        private fun getJdbcUrl(): String {
            return "jdbc:postgresql://" + container.containerIpAddress + ":" + container.getMappedPort(PostgreSQLContainer.POSTGRESQL_PORT).toString() + "/testdb?user=postgres&password=postgres"
        }
    }
}