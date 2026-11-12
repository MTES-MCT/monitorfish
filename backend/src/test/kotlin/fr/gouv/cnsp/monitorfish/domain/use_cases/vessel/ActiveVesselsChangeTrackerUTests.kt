package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZoneOffset
import java.time.ZonedDateTime

class ActiveVesselsChangeTrackerUTests {
    private val positionDateTime = ZonedDateTime.of(2026, 11, 11, 10, 0, 0, 0, ZoneOffset.UTC)

    private fun gear(code: String) =
        Gear().apply {
            gear = code
            mesh = 80.0
        }

    private fun vesselEmittingPositions(
        cfr: String,
        latitude: Double = 47.5,
        dateTime: ZonedDateTime = positionDateTime,
        reportingTypes: List<ReportingType> = emptyList(),
    ) = EnrichedActiveVessel(
        lastPosition =
            LastPosition(
                vesselId = cfr.hashCode(),
                internalReferenceNumber = cfr,
                ircs = "IRCS",
                flagState = CountryCode.FR,
                positionType = PositionType.VMS,
                latitude = latitude,
                longitude = -3.5,
                dateTime = dateTime,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                // A new instance at each record, as when read from the database
                gearOnboard = listOf(gear("OTB")),
            ),
        vesselProfile = null,
        vessel = null,
        producerOrganization = null,
        riskFactor = VesselRiskFactor(),
        landingPort = null,
        reportingTypes = reportingTypes,
    )

    private fun vesselEmittingLogbook(cfr: String) =
        EnrichedActiveVessel(
            lastPosition = null,
            vesselProfile = null,
            vessel =
                Vessel(
                    id = cfr.hashCode(),
                    internalReferenceNumber = cfr,
                    externalReferenceNumber = "SB125334",
                    flagState = CountryCode.FR,
                    hasLogbookEsacapt = false,
                ),
            producerOrganization = null,
            riskFactor = VesselRiskFactor(),
            landingPort = null,
        )

    @Test
    fun `getChangesSince Should return all the vessels with their fingerprint When no previous state is given`() {
        // Given
        val tracker = ActiveVesselsChangeTracker()
        tracker.record(listOf(vesselEmittingPositions("FR224226850"), vesselEmittingLogbook("FR263418260")))

        // When
        val changes = tracker.getChangesSince(null)

        // Then
        assertThat(changes.isFull).isTrue()
        assertThat(changes.vessels).hasSize(2)
        assertThat(changes.positions).isEmpty()
        assertThat(changes.activeVesselsCount).isEqualTo(2)
        assertThat(changes.asOf).isNotBlank()
        // Same value computed by the frontend (see `getActiveVesselsFingerprint()`)
        assertThat(
            ActiveVesselsChangeTracker.getFingerprint(
                listOf("VESSELS_POINTS:FR224226850/FQ7058/UNKNOWN", "VESSELS:FR263418260/UNKNOWN/SB125334"),
            ),
        ).isEqualTo(2497665112L)
        assertThat(changes.fingerprint).isEqualTo(
            ActiveVesselsChangeTracker.getFingerprint(
                listOf("VESSELS_POINTS:FR224226850/IRCS/UNKNOWN", "VESSELS:FR263418260/UNKNOWN/SB125334"),
            ),
        )
    }

    @Test
    fun `getChangesSince Should return nothing When the vessels did not change`() {
        // Given
        val tracker = ActiveVesselsChangeTracker()
        tracker.record(listOf(vesselEmittingPositions("FR224226850"), vesselEmittingLogbook("FR263418260")))
        val asOf = tracker.getChangesSince(null).asOf

        // When
        tracker.record(listOf(vesselEmittingPositions("FR224226850"), vesselEmittingLogbook("FR263418260")))
        val changes = tracker.getChangesSince(asOf)

        // Then
        assertThat(changes.isFull).isFalse()
        assertThat(changes.vessels).isEmpty()
        assertThat(changes.positions).isEmpty()
        assertThat(changes.removedVesselFeatureIds).isEmpty()
        assertThat(changes.activeVesselsCount).isEqualTo(2)
    }

    @Test
    fun `getChangesSince Should only return the position of a vessel When only its position changed`() {
        // Given
        val tracker = ActiveVesselsChangeTracker()
        tracker.record(listOf(vesselEmittingPositions("FR224226850"), vesselEmittingPositions("FR000000002")))
        val asOf = tracker.getChangesSince(null).asOf

        // When
        tracker.record(
            listOf(
                vesselEmittingPositions("FR224226850", latitude = 47.6, dateTime = positionDateTime.plusHours(1)),
                vesselEmittingPositions("FR000000002"),
            ),
        )
        val changes = tracker.getChangesSince(asOf)

        // Then
        assertThat(changes.vessels).isEmpty()
        assertThat(changes.positions).hasSize(1)
        assertThat(
            changes.positions
                .single()
                .lastPosition
                ?.latitude,
        ).isEqualTo(47.6)
    }

    @Test
    fun `getChangesSince Should return the whole vessel When another property than its position changed`() {
        // Given
        val tracker = ActiveVesselsChangeTracker()
        tracker.record(listOf(vesselEmittingPositions("FR224226850")))
        val asOf = tracker.getChangesSince(null).asOf

        // When
        tracker.record(
            listOf(
                vesselEmittingPositions(
                    "FR224226850",
                    latitude = 47.6,
                    reportingTypes = listOf(ReportingType.INFRACTION_SUSPICION),
                ),
            ),
        )
        val changes = tracker.getChangesSince(asOf)

        // Then
        assertThat(changes.positions).isEmpty()
        assertThat(changes.vessels).hasSize(1)
        assertThat(changes.vessels.single().hasInfractionSuspicion).isTrue()
    }

    @Test
    fun `getChangesSince Should return the added and removed vessels`() {
        // Given
        val tracker = ActiveVesselsChangeTracker()
        tracker.record(listOf(vesselEmittingPositions("FR224226850"), vesselEmittingLogbook("FR263418260")))
        val asOf = tracker.getChangesSince(null).asOf

        // When
        tracker.record(listOf(vesselEmittingPositions("FR224226850"), vesselEmittingPositions("FR000000003")))
        val changes = tracker.getChangesSince(asOf)

        // Then
        assertThat(changes.vessels.map { it.getFeatureId() }).containsExactly("VESSELS_POINTS:FR000000003/IRCS/UNKNOWN")
        assertThat(changes.removedVesselFeatureIds).containsExactly("VESSELS:FR263418260/UNKNOWN/SB125334")
        assertThat(changes.activeVesselsCount).isEqualTo(2)
    }

    @Test
    fun `getChangesSince Should return all the changes since the given state, over several records`() {
        // Given
        val tracker = ActiveVesselsChangeTracker()
        tracker.record(listOf(vesselEmittingPositions("FR224226850"), vesselEmittingLogbook("FR263418260")))
        val firstAsOf = tracker.getChangesSince(null).asOf
        tracker.record(
            listOf(
                vesselEmittingPositions("FR224226850", latitude = 47.6),
                vesselEmittingLogbook("FR263418260"),
            ),
        )
        val secondAsOf = tracker.getChangesSince(null).asOf

        // When
        tracker.record(listOf(vesselEmittingPositions("FR224226850", latitude = 47.6)))

        // Then
        val sinceFirst = tracker.getChangesSince(firstAsOf)
        assertThat(sinceFirst.positions.map { it.lastPosition?.latitude }).containsExactly(47.6)
        assertThat(sinceFirst.removedVesselFeatureIds).containsExactly("VESSELS:FR263418260/UNKNOWN/SB125334")
        val sinceSecond = tracker.getChangesSince(secondAsOf)
        assertThat(sinceSecond.positions).isEmpty()
        assertThat(sinceSecond.removedVesselFeatureIds).containsExactly("VESSELS:FR263418260/UNKNOWN/SB125334")
    }

    @Test
    fun `getChangesSince Should return all the vessels When the given state comes from another tracker or is invalid`() {
        // Given
        val otherTracker = ActiveVesselsChangeTracker()
        otherTracker.record(listOf(vesselEmittingPositions("FR224226850")))
        val otherAsOf = otherTracker.getChangesSince(null).asOf
        // e.g. another backend instance, or a restarted one
        val tracker = ActiveVesselsChangeTracker()
        tracker.record(listOf(vesselEmittingPositions("FR224226850")))

        // When, then
        assertThat(tracker.getChangesSince(otherAsOf).isFull).isTrue()
        assertThat(tracker.getChangesSince("not-a-state").isFull).isTrue()
        assertThat(tracker.getChangesSince(otherAsOf).vessels).hasSize(1)
    }
}
