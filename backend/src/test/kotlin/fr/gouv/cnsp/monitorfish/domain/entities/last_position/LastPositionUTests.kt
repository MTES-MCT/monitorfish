package fr.gouv.cnsp.monitorfish.domain.entities.last_position

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.ZoneFilter
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.Polygon
import java.time.ZonedDateTime

class LastPositionUTests {
    private val geometryFactory = GeometryFactory()

    private fun square(
        minX: Double,
        minY: Double,
        size: Double,
    ): Array<Coordinate> =
        arrayOf(
            Coordinate(minX, minY),
            Coordinate(minX + size, minY),
            Coordinate(minX + size, minY + size),
            Coordinate(minX, minY + size),
            Coordinate(minX, minY),
        )

    private fun polygon(
        shell: Array<Coordinate>,
        vararg holes: Array<Coordinate>,
    ): Polygon =
        geometryFactory.createPolygon(
            geometryFactory.createLinearRing(shell),
            holes.map { geometryFactory.createLinearRing(it) }.toTypedArray(),
        )

    private fun groupWithZone(
        zone: Geometry,
        countryCodes: List<CountryCode> = listOf(),
    ) = DynamicVesselGroup(
        id = 1,
        name = "Group with a zone",
        isDeleted = false,
        description = null,
        pointsOfAttention = null,
        color = "#000000",
        sharing = Sharing.PRIVATE,
        createdBy = "dummy@email.gouv.fr",
        createdAtUtc = ZonedDateTime.now(),
        filters =
            VesselGroupFilters(
                countryCodes = countryCodes,
                hasLogbook = null,
                lastControlAtSeaPeriod = null,
                lastControlAtQuayPeriod = null,
                lastPositionHoursAgo = null,
                vesselSize = null,
                zones = listOf(ZoneFilter(feature = zone, label = "Zone", value = "ZONE")),
            ),
    )

    private fun lastPositionAt(
        longitude: Double,
        latitude: Double,
    ) = LastPosition(
        internalReferenceNumber = "FR224226850",
        flagState = CountryCode.FR,
        positionType = PositionType.VMS,
        latitude = latitude,
        longitude = longitude,
        dateTime = ZonedDateTime.now(),
        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
    )

    @Test
    fun `isInGroup Should match a position inside a zone and not a position outside of it`() {
        // Given
        val group = groupWithZone(geometryFactory.createMultiPolygon(arrayOf(polygon(square(0.0, 0.0, 10.0)))))

        // When
        val inside = lastPositionAt(longitude = 5.0, latitude = 5.0).isInGroup(group, null, ZonedDateTime.now())
        val outside = lastPositionAt(longitude = 15.0, latitude = 5.0).isInGroup(group, null, ZonedDateTime.now())

        // Then
        assertThat(inside).isTrue()
        assertThat(outside).isFalse()
    }

    @Test
    fun `isInGroup Should match a position inside any part of a multi-part zone`() {
        // Given
        val group =
            groupWithZone(
                geometryFactory.createMultiPolygon(
                    arrayOf(polygon(square(0.0, 0.0, 10.0)), polygon(square(20.0, 0.0, 10.0))),
                ),
            )

        // When
        val inSecondPart =
            lastPositionAt(longitude = 25.0, latitude = 5.0).isInGroup(group, null, ZonedDateTime.now())
        val betweenParts =
            lastPositionAt(longitude = 15.0, latitude = 5.0).isInGroup(group, null, ZonedDateTime.now())

        // Then
        assertThat(inSecondPart).isTrue()
        assertThat(betweenParts).isFalse()
    }

    @Test
    fun `isInGroup Should not match a position inside a hole of the zone`() {
        // Given
        val group =
            groupWithZone(
                geometryFactory.createMultiPolygon(
                    arrayOf(polygon(square(0.0, 0.0, 10.0), square(4.0, 4.0, 2.0))),
                ),
            )

        // When
        val inHole = lastPositionAt(longitude = 5.0, latitude = 5.0).isInGroup(group, null, ZonedDateTime.now())
        val inZone = lastPositionAt(longitude = 1.0, latitude = 1.0).isInGroup(group, null, ZonedDateTime.now())

        // Then
        assertThat(inHole).isFalse()
        assertThat(inZone).isTrue()
    }

    @Test
    fun `isInGroup Should not match a position inside the zone When another filter does not match`() {
        // Given
        val group =
            groupWithZone(
                zone = geometryFactory.createMultiPolygon(arrayOf(polygon(square(0.0, 0.0, 10.0)))),
                countryCodes = listOf(CountryCode.ES),
            )

        // When
        val isInGroup = lastPositionAt(longitude = 5.0, latitude = 5.0).isInGroup(group, null, ZonedDateTime.now())

        // Then
        assertThat(isInGroup).isFalse()
    }
}
