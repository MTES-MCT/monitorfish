package fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionThreat
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.locationtech.jts.io.WKTReader
import java.time.ZonedDateTime

class ReportingsFilterUTests {
    private val overlappingZones =
        WKTReader().read("MULTIPOLYGON(((0 0,0 10,10 10,10 0,0 0)),((5 5,5 15,15 15,15 5,5 5)))")

    private fun reportingLocatedAt(
        longitude: Double?,
        latitude: Double?,
    ) = Reporting.InfractionSuspicion(
        flagState = CountryCode.FR,
        creationDate = ZonedDateTime.now(),
        reportingDate = ZonedDateTime.now(),
        lastUpdateDate = ZonedDateTime.now(),
        reportingSource = ReportingSource.OPS,
        infractions =
            listOf(
                InfractionSuspicionThreat(
                    natinfCode = 123456,
                    threat = "Obligations déclaratives",
                    threatCharacterization = "DEP",
                ),
            ),
        title = "A title",
        type = ReportingType.INFRACTION_SUSPICION,
        isDeleted = false,
        isArchived = false,
        createdBy = "test@example.gouv.fr",
        longitude = longitude,
        latitude = latitude,
    )

    @Test
    fun `matches Should keep a reporting located in any of the zones`() {
        val filter = ReportingsFilter(zone = overlappingZones)

        assertThat(filter.matches(reportingLocatedAt(longitude = 2.0, latitude = 2.0))).isTrue()
        assertThat(filter.matches(reportingLocatedAt(longitude = 12.0, latitude = 12.0))).isTrue()
    }

    @Test
    fun `matches Should keep a reporting located where two zones overlap`() {
        val filter = ReportingsFilter(zone = overlappingZones)

        assertThat(filter.matches(reportingLocatedAt(longitude = 7.0, latitude = 7.0))).isTrue()
    }

    @Test
    fun `matches Should reject a reporting outside of the zones or without position`() {
        val filter = ReportingsFilter(zone = overlappingZones)

        assertThat(filter.matches(reportingLocatedAt(longitude = 20.0, latitude = 20.0))).isFalse()
        assertThat(filter.matches(reportingLocatedAt(longitude = null, latitude = null))).isFalse()
    }
}
