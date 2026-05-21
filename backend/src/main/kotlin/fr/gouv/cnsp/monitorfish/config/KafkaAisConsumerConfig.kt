package fr.gouv.cnsp.monitorfish.config

import fr.gouv.cnsp.monitorfish.infrastructure.kafka.AisPositionMessage
import org.apache.kafka.common.serialization.StringDeserializer
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.autoconfigure.kafka.KafkaProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.annotation.EnableKafka
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory
import org.springframework.kafka.core.ConsumerFactory
import org.springframework.kafka.core.DefaultKafkaConsumerFactory
import org.springframework.kafka.listener.ConsumerRecordRecoverer
import org.springframework.kafka.listener.DefaultErrorHandler
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
import org.springframework.kafka.support.serializer.JsonDeserializer
import org.springframework.util.backoff.FixedBackOff

@EnableKafka
@Configuration
@ConditionalOnProperty(value = ["monitorfish.kafka.ais.enabled"], havingValue = "true")
class KafkaAisConsumerConfig(
    val kafkaProperties: KafkaProperties,
    val kafkaAisProperties: KafkaAisProperties,
) {
    private val logger = LoggerFactory.getLogger(KafkaAisConsumerConfig::class.java)

    @Bean
    fun consumerFactory(): ConsumerFactory<String, AisPositionMessage> =
        DefaultKafkaConsumerFactory(
            kafkaProperties.buildConsumerProperties(),
            ErrorHandlingDeserializer<String>(StringDeserializer()),
            ErrorHandlingDeserializer<AisPositionMessage>(
                JsonDeserializer(AisPositionMessage::class.java).apply { addTrustedPackages("*") },
            ),
        )

    @Bean
    fun errorHandler(): DefaultErrorHandler {
        val recoverer =
            ConsumerRecordRecoverer { record, exception ->
                logger.error(
                    "Failed to deserialize message from topic=${record.topic()} partition=${record.partition()} offset=${record.offset()}: ${exception?.message}",
                )
            }
        return DefaultErrorHandler(recoverer, FixedBackOff(0L, 0L))
    }

    @Bean
    fun kafkaListenerContainerFactory(): ConcurrentKafkaListenerContainerFactory<String, AisPositionMessage> {
        val factory = ConcurrentKafkaListenerContainerFactory<String, AisPositionMessage>()
        factory.setConsumerFactory(consumerFactory())
        factory.setCommonErrorHandler(errorHandler())
        factory.isBatchListener = true
        factory.containerProperties.idleBetweenPolls = kafkaAisProperties.idleBetweenPolls
        return factory
    }
}
