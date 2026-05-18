package fr.gouv.cnsp.monitorfish.infrastructure.kafka

import fr.gouv.cnsp.monitorfish.config.KafkaAisProperties
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AisPositionPK
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.AbstractKafkaTests
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBAisPositionRepository
import org.assertj.core.api.Assertions.assertThat
import org.awaitility.Awaitility
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.kafka.core.KafkaTemplate
import java.time.ZonedDateTime
import java.util.concurrent.TimeUnit

class AisPositionKafkaConsumerITests : AbstractKafkaTests() {
    @Autowired
    lateinit var kafkaTemplate: KafkaTemplate<String, AisPositionMessage>

    @Autowired
    lateinit var dbAisPositionRepository: DBAisPositionRepository

    @Autowired
    lateinit var kafkaAisProperties: KafkaAisProperties

    @Test
    fun `consume Should save AIS position that comes from the AIS topic`() {
        // Given
        val mmsi = 1234567890L
        val ts = ZonedDateTime.parse("2025-01-01T00:00:00.00Z")
        val message =
            AisPositionMessage(
                mmsi = mmsi,
                coord = "POINT(-2.7335 47.6078)",
                ts = ts,
                status = "Under way using engine",
                course = 12.12,
                speed = 10.12,
                features =
                    AisFeatures(
                        ais =
                            AisDetails(
                                imo = "IMO1234567",
                                callsign = "ABCD",
                                shipname = "TEST VESSEL",
                                shiptype = 70,
                                destination = "FRBST",
                            ),
                    ),
            )

        // When
        kafkaTemplate.send(kafkaAisProperties.topic, message).get(10, TimeUnit.SECONDS)

        // Then
        Awaitility
            .await()
            .pollInterval(1, TimeUnit.SECONDS)
            .atMost(30, TimeUnit.SECONDS)
            .untilAsserted {
                val saved = dbAisPositionRepository.findByIdOrNull(AisPositionPK(mmsi = mmsi, dateTime = ts))
                assertThat(saved).isNotNull()
                assertThat(saved!!.pk.mmsi).isEqualTo(mmsi)
                assertThat(saved.pk.dateTime).isEqualTo(ts)
                assertThat(saved.longitude).isEqualTo(-2.7335)
                assertThat(saved.latitude).isEqualTo(47.6078)
                assertThat(saved.status).isEqualTo("Under way using engine")
                assertThat(saved.course).isEqualTo(12.12)
                assertThat(saved.imo).isEqualTo("IMO1234567")
                assertThat(saved.ircs).isEqualTo("ABCD")
                assertThat(saved.vesselName).isEqualTo("TEST VESSEL")
                assertThat(saved.shipType).isEqualTo(70)
                assertThat(saved.destination).isEqualTo("FRBST")
            }
    }

    @Test
    fun `consume Should save navpro fields When message contains navpro features`() {
        // Given
        val mmsi = 9876543210L
        val ts = ZonedDateTime.parse("2025-02-01T00:00:00.00Z")
        val message =
            AisPositionMessage(
                mmsi = mmsi,
                coord = "POINT(-1.5 46.0)",
                ts = ts,
                features =
                    AisFeatures(
                        navpro =
                            NavproDetails(
                                imo = 7654321L,
                                cfr = "FRA000123456",
                                externalImmatriculation = "LH123456",
                                vesselName = "NAVPRO VESSEL",
                                ircs = "FRAB",
                                flagState = "FR",
                            ),
                    ),
            )

        // When
        kafkaTemplate.send(kafkaAisProperties.topic, message).get(10, TimeUnit.SECONDS)

        // Then
        Awaitility
            .await()
            .pollInterval(1, TimeUnit.SECONDS)
            .atMost(30, TimeUnit.SECONDS)
            .untilAsserted {
                val saved = dbAisPositionRepository.findByIdOrNull(AisPositionPK(mmsi = mmsi, dateTime = ts))
                assertThat(saved).isNotNull()
                assertThat(saved!!.imo).isEqualTo("7654321")
                assertThat(saved.cfr).isEqualTo("FRA000123456")
                assertThat(saved.externalImmatriculation).isEqualTo("LH123456")
                assertThat(saved.vesselName).isEqualTo("NAVPRO VESSEL")
                assertThat(saved.ircs).isEqualTo("FRAB")
                assertThat(saved.flagState).isEqualTo("FR")
            }
    }
}
