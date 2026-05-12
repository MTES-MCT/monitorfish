package fr.gouv.cnsp.monitorfish.infrastructure.kafka

import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.SaveAisPositions
import jakarta.annotation.PreDestroy
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(value = ["monitorfish.kafka.ais.enabled"], havingValue = "true")
class AisPositionKafkaConsumer(
    private val saveAisPositions: SaveAisPositions,
) {
    private val logger = LoggerFactory.getLogger(AisPositionKafkaConsumer::class.java)

    @KafkaListener(topics = ["\${monitorfish.kafka.ais.topic:monitor.ais.position}"])
    fun consume(messages: List<AisPositionMessage>) {
        try {
            saveAisPositions.execute(messages.map { it.toAisPosition() })
        } catch (ex: Exception) {
            logger.error("Could not save AIS batch", ex)
        }
    }

    @PreDestroy
    fun shutdown() {
        logger.info("Shutting down AisPositionKafkaConsumer batch thread")
    }
}
