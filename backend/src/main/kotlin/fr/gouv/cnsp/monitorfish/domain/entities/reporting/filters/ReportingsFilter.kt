package fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingOrigin
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.GeometryFactory
import java.time.ZonedDateTime

/**
 * The filters shared by the reporting map layer and the reporting list, so that both views
 * always agree on what a given filter selects.
 *
 * [toReportingFilter] holds everything that can be pushed down to SQL; [matches] holds what has
 * to be evaluated on the mapped [Reporting] (the source lives in the `value` jsonb column, and
 * the zone is a geometry the table has no index for).
 */
data class ReportingsFilter(
    val reportingPeriod: ReportingPeriod? = null,
    val startDate: ZonedDateTime? = null,
    val endDate: ZonedDateTime? = null,
    val isArchived: Boolean? = null,
    val isIUU: Boolean? = null,
    val reportingType: ReportingType? = null,
    val origin: ReportingOrigin? = null,
    val zone: Geometry? = null,
    val ids: List<Int>? = null,
) {
    fun toReportingFilter(
        hasPosition: Boolean? = null,
        absentVessel: Boolean? = null,
    ): ReportingFilter {
        val (afterCreationDate, beforeCreationDate) =
            reportingPeriod?.toDateRange(startDate = startDate, endDate = endDate) ?: Pair(null, null)

        return ReportingFilter(
            isArchived = isArchived,
            isDeleted = false,
            isIUU = isIUU,
            types = reportingType?.let { expandType(it) },
            afterCreationDate = afterCreationDate,
            beforeCreationDate = beforeCreationDate,
            hasPosition = hasPosition,
            absentVessel = absentVessel,
            ids = ids,
        )
    }

    fun matches(reporting: Reporting): Boolean = matchesOrigin(reporting) && matchesZone(reporting)

    private fun matchesOrigin(reporting: Reporting): Boolean =
        origin == null || ReportingOrigin.fromReporting(reporting) == origin

    private fun matchesZone(reporting: Reporting): Boolean {
        val zone = this.zone ?: return true
        val longitude = reporting.longitude ?: return false
        val latitude = reporting.latitude ?: return false

        val point = GEOMETRY_FACTORY.createPoint(Coordinate(longitude, latitude))

        // The envelope check is a cheap reject before the exact — and much more costly — one.
        return zone.envelopeInternal.intersects(point.coordinate) && zone.contains(point)
    }

    companion object {
        private val GEOMETRY_FACTORY = GeometryFactory()

        /**
         * Alerts are infraction suspicions from the user's point of view, so both types are
         * always selected together.
         */
        private val INFRACTION_SUSPICION_TYPES = listOf(ReportingType.INFRACTION_SUSPICION, ReportingType.ALERT)

        private fun expandType(type: ReportingType): List<ReportingType> =
            if (INFRACTION_SUSPICION_TYPES.contains(type)) INFRACTION_SUSPICION_TYPES else listOf(type)
    }
}
