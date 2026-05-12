package fr.gouv.cnsp.monitorfish.infrastructure.kafka

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class AisPositionMessageUTests {
    @Test
    fun `toAisPosition Should parse WKT coord into latitude and longitude`() {
        // Given
        val message =
            AisPositionMessage(
                mmsi = 123456789L,
                coord = "POINT(-2.7335 47.6078)",
                ts = ZonedDateTime.parse("2025-01-01T00:00:00Z"),
            )

        // When
        val position = message.toAisPosition()

        // Then
        assertThat(position.longitude).isEqualTo(-2.7335)
        assertThat(position.latitude).isEqualTo(47.6078)
    }

    @Test
    fun `toAisPosition Should map nested feature fields onto the domain entity`() {
        // Given
        val ts = ZonedDateTime.parse("2025-01-01T00:00:00Z")
        val message =
            AisPositionMessage(
                mmsi = 123456789L,
                coord = "POINT(-2.7335 47.6078)",
                ts = ts,
                course = 12.12,
                speed = 10.5,
                status = "Under way",
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
        val position = message.toAisPosition()

        // Then
        assertThat(position.mmsi).isEqualTo(123456789L)
        assertThat(position.dateTime).isEqualTo(ts)
        assertThat(position.course).isEqualTo(12.12)
        assertThat(position.speed).isEqualTo(10.5)
        assertThat(position.status).isEqualTo("Under way")
        assertThat(position.imo).isEqualTo("IMO1234567")
        assertThat(position.ircs).isEqualTo("ABCD")
        assertThat(position.vesselName).isEqualTo("TEST VESSEL")
        assertThat(position.shipType).isEqualTo(70)
        assertThat(position.destination).isEqualTo("FRBST")
    }

    @Test
    fun `toAisPosition Should return zero coordinates When coord is null`() {
        // Given
        val message =
            AisPositionMessage(
                mmsi = 123456789L,
                coord = null,
                ts = ZonedDateTime.parse("2025-01-01T00:00:00Z"),
            )

        // When
        val position = message.toAisPosition()

        // Then
        assertThat(position.latitude).isEqualTo(0.0)
        assertThat(position.longitude).isEqualTo(0.0)
    }

    @Test
    fun `toAisPosition Should map navpro fields onto the domain entity`() {
        // Given
        val message =
            AisPositionMessage(
                mmsi = 123456789L,
                coord = "POINT(-2.7335 47.6078)",
                ts = ZonedDateTime.parse("2025-01-01T00:00:00Z"),
                features =
                    AisFeatures(
                        navpro =
                            NavproDetails(
                                cfr = "FRA000123456",
                                externalImmatriculation = "LH123456",
                                vesselName = "NAVPRO VESSEL",
                                ircs = "FRAB",
                                flagState = "FR",
                            ),
                    ),
            )

        // When
        val position = message.toAisPosition()

        // Then
        assertThat(position.cfr).isEqualTo("FRA000123456")
        assertThat(position.externalImmatriculation).isEqualTo("LH123456")
        assertThat(position.vesselName).isEqualTo("NAVPRO VESSEL")
        assertThat(position.ircs).isEqualTo("FRAB")
        assertThat(position.flagState).isEqualTo("FR")
    }

    @Test
    fun `toAisPosition Should fall back to navpro imo When ais imo is null`() {
        // Given
        val message =
            AisPositionMessage(
                mmsi = 123456789L,
                coord = null,
                ts = ZonedDateTime.parse("2025-01-01T00:00:00Z"),
                features =
                    AisFeatures(
                        ais = AisDetails(imo = null),
                        navpro = NavproDetails(imo = 9999999L),
                    ),
            )

        // When
        val position = message.toAisPosition()

        // Then
        assertThat(position.imo).isEqualTo("9999999")
    }

    @Test
    fun `toAisPosition Should fall back to navpro ircs When ais callsign is null`() {
        // Given
        val message =
            AisPositionMessage(
                mmsi = 123456789L,
                coord = null,
                ts = ZonedDateTime.parse("2025-01-01T00:00:00Z"),
                features =
                    AisFeatures(
                        ais = AisDetails(callsign = null),
                        navpro = NavproDetails(ircs = "FRAB"),
                    ),
            )

        // When
        val position = message.toAisPosition()

        // Then
        assertThat(position.ircs).isEqualTo("FRAB")
    }
}
