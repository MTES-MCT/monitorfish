package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.MonitorFishApplication
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.kafka.config.KafkaListenerEndpointRegistry
import org.springframework.kafka.test.utils.ContainerTestUtils
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.wait.strategy.Wait
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import org.testcontainers.kafka.ConfluentKafkaContainer

@SpringBootTest(
    classes = [MonitorFishApplication::class],
    properties = ["monitorfish.scheduling.enabled=false"],
)
@Testcontainers
abstract class AbstractKafkaTests : AbstractDBTests() {
    @Autowired
    lateinit var registry: KafkaListenerEndpointRegistry

    @BeforeEach
    fun setUp() {
        registry.listenerContainers.forEach { container ->
            ContainerTestUtils.waitForAssignment(
                container,
                container.containerProperties.topics?.size ?: 1,
            )
        }
    }

    companion object {
        @JvmStatic
        @Container
        val kafka =
            ConfluentKafkaContainer("confluentinc/cp-kafka:8.1.0").apply {
                withExposedPorts(9092)
                waitingFor(
                    Wait.forLogMessage(".*Kafka Server started.*\\s", 2),
                )
                start()
            }

        @JvmStatic
        @DynamicPropertySource
        fun kafkaProps(reg: DynamicPropertyRegistry) {
            reg.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers)
            reg.add("spring.kafka.properties.security.protocol") { "PLAINTEXT" }
            reg.add("spring.kafka.producer.value-serializer") { "org.springframework.kafka.support.serializer.JsonSerializer" }
            reg.add("monitorfish.kafka.ais.enabled") { true }
        }
    }
}
