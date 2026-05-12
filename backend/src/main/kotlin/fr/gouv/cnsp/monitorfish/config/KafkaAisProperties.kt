package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "monitorfish.kafka.ais")
data class KafkaAisProperties(
    val enabled: Boolean = false,
    val topic: String = "monitor.ais.position",
    val idleBetweenPolls: Long = 0,
    val producer: Producer = Producer(),
) {
    data class Producer(
        val enabled: Boolean = false,
        val rateMs: Long = 1000,
        val batchSize: Int = 10,
    )
}
