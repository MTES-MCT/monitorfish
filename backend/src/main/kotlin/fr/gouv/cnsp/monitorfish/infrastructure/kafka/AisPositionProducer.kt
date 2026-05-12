package fr.gouv.cnsp.monitorfish.infrastructure.kafka

import fr.gouv.cnsp.monitorfish.config.KafkaAisProperties
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.ZonedDateTime
import kotlin.random.Random

/**
 * ⚠ For dev and testing purposes only. Do not enable in production. ⚠
 */
@Component
@ConditionalOnProperty(
    value = ["monitorfish.kafka.ais.enabled", "monitorfish.kafka.ais.producer.enabled"],
    havingValue = "true",
)
class AisPositionProducer(
    private val kafkaTemplate: KafkaTemplate<String, AisPositionMessage>,
    private val kafkaAisProperties: KafkaAisProperties,
) {
    private val logger = LoggerFactory.getLogger(AisPositionProducer::class.java)

    @Scheduled(fixedRateString = "\${monitorfish.kafka.ais.producer.rate-ms:1000}")
    fun sendMessage() {
        repeat(kafkaAisProperties.producer.batchSize) {
            try {
                val message =
                    AisPositionMessage(
                        mmsi = Random.nextLong(100_000_000L, 999_999_999L),
                        coord = randomCoord(),
                        ts = ZonedDateTime.now(),
                        course = Random.nextDouble(0.0, 360.0),
                        speed = Random.nextDouble(0.0, 15.0),
                        status = "Under way using engine",
                    )
                kafkaTemplate.send(kafkaAisProperties.topic, message)
            } catch (ex: Exception) {
                logger.error("Failed to send AIS position", ex)
            }
        }
        logger.info("Sent ${kafkaAisProperties.producer.batchSize} AIS positions to topic ${kafkaAisProperties.topic}")
    }

    private fun randomCoord(): String {
        val lon = Random.nextDouble(-20.0, 15.0)
        val lat = Random.nextDouble(35.0, 60.0)
        return "POINT($lon $lat)"
    }
}
