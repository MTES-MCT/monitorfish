package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionThreat
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingOrigin
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.sorters.ReportingsSortColumn
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.locationtech.jts.io.WKTReader
import org.springframework.data.domain.Sort
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetReportingsListUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var vesselRepository: VesselRepository

    @MockitoBean
    private lateinit var infractionRepository: InfractionRepository

    @MockitoBean
    private lateinit var getAllLegacyControlUnits: GetAllLegacyControlUnits

    private fun getReportingsList() =
        GetReportingsList(
            reportingRepository,
            vesselRepository,
            infractionRepository,
            getAllLegacyControlUnits,
        )

    private fun execute(
        filter: ReportingsFilter = ReportingsFilter(),
        seafrontGroup: SeafrontGroup = SeafrontGroup.ALL,
        searchQuery: String? = null,
        absentVessel: Boolean? = null,
        sortColumn: ReportingsSortColumn = ReportingsSortColumn.REPORTING_DATE,
        sortDirection: Sort.Direction = Sort.Direction.DESC,
        pageNumber: Int = 0,
        pageSize: Int = 50,
    ) = getReportingsList().execute(
        filter = filter,
        seafrontGroup = seafrontGroup,
        searchQuery = searchQuery,
        absentVessel = absentVessel,
        sortColumn = sortColumn,
        sortDirection = sortDirection,
        pageNumber = pageNumber,
        pageSize = pageSize,
    )

    private fun anInfractionSuspicion(
        id: Int,
        vesselName: String? = null,
        cfr: String? = null,
        vesselIdentifier: VesselIdentifier? = null,
        natinfCode: Int = 27689,
        reportingSource: ReportingSource = ReportingSource.OPS,
        seaFront: String? = null,
        isIUU: Boolean = false,
        latitude: Double? = null,
        longitude: Double? = null,
        reportingDate: ZonedDateTime = ZonedDateTime.now(),
        title: String = "A title",
    ) = Reporting.InfractionSuspicion(
        id = id,
        vesselName = vesselName,
        cfr = cfr,
        externalMarker = "RGD",
        ircs = "6554fEE",
        vesselIdentifier = vesselIdentifier,
        flagState = CountryCode.FR,
        creationDate = reportingDate,
        reportingDate = reportingDate,
        lastUpdateDate = reportingDate,
        reportingSource = reportingSource,
        infractions =
            listOf(
                InfractionSuspicionThreat(
                    natinfCode = natinfCode,
                    threat = "Activités INN",
                    threatCharacterization = "Pêche sans autorisation par navire tiers",
                ),
            ),
        title = title,
        isDeleted = false,
        isArchived = false,
        isIUU = isIUU,
        latitude = latitude,
        longitude = longitude,
        seaFront = seaFront,
        createdBy = "test@example.gouv.fr",
    )

    @Test
    fun `execute Should enrich the page with the underCharter and infractions fields`() {
        // Given
        val reporting =
            anInfractionSuspicion(
                id = 1,
                cfr = "FRFGRGR",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )
        given(reportingRepository.findAll(any())).willReturn(listOf(reporting))
        given(
            vesselRepository.findUnderCharterForVessel(
                eq(VesselIdentifier.INTERNAL_REFERENCE_NUMBER),
                eq("FRFGRGR"),
            ),
        ).willReturn(true)
        given(infractionRepository.findInfractionByNatinfCode(eq(27689))).willReturn(
            Infraction(
                natinfCode = 27689,
                infraction = "Peche maritime non autorisee",
                infractionCategory = InfractionCategory.FISHING,
            ),
        )

        // When
        val page = execute()

        // Then
        assertThat(page.data).hasSize(1)
        val (enriched, _) = page.data.first()
        assertThat(enriched.cfr).isEqualTo("FRFGRGR")
        assertThat(enriched.underCharter).isTrue
        assertThat((enriched as Reporting.InfractionSuspicion).infractions.first().infraction).isNotNull
    }

    @Test
    fun `execute Should not throw When the last position is not found to obtain the underCharter field`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(
            listOf(anInfractionSuspicion(id = 1, vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER)),
        )

        // When
        val throwable = catchThrowable { execute() }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    fun `execute Should only enrich the returned page`() {
        // Given
        val reportings =
            (1..10).map {
                anInfractionSuspicion(
                    id = it,
                    cfr = "CFR$it",
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                )
            }
        given(reportingRepository.findAll(any())).willReturn(reportings)

        // When
        val page = execute(pageSize = 3)

        // Then
        assertThat(page.data).hasSize(3)
        assertThat(page.totalLength).isEqualTo(10)
        // The under-charter lookup is one query per reporting, so it must never run on the whole set.
        verify(vesselRepository, times(3)).findUnderCharterForVessel(any(), any())
    }

    @Test
    fun `execute Should count the seafront groups before applying the seafront filter`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(
            listOf(
                anInfractionSuspicion(id = 1, seaFront = Seafront.NAMO.toString()),
                anInfractionSuspicion(id = 2, seaFront = Seafront.MED.toString()),
                anInfractionSuspicion(id = 3, seaFront = Seafront.MED.toString()),
            ),
        )

        // When
        val page = execute(seafrontGroup = SeafrontGroup.NAMO)

        // Then
        assertThat(page.data).hasSize(1)
        assertThat(page.totalLength).isEqualTo(1)
        assertThat(page.extraData.perSeafrontGroupCount[SeafrontGroup.NAMO]).isEqualTo(1)
        assertThat(page.extraData.perSeafrontGroupCount[SeafrontGroup.MED]).isEqualTo(2)
        assertThat(page.extraData.perSeafrontGroupCount[SeafrontGroup.ALL]).isEqualTo(3)
    }

    @Test
    fun `execute Should not throw When the stored seafront is unknown`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(
            listOf(anInfractionSuspicion(id = 1, seaFront = "A seafront that does not exist")),
        )

        // When
        val page = execute(seafrontGroup = SeafrontGroup.ALL)

        // Then
        assertThat(page.data).hasSize(1)
        assertThat(page.extraData.perSeafrontGroupCount[SeafrontGroup.NO_FACADE]).isEqualTo(1)
    }

    @Test
    fun `execute Should filter by origin`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(
            listOf(
                anInfractionSuspicion(id = 1, reportingSource = ReportingSource.OPS),
                anInfractionSuspicion(id = 2, reportingSource = ReportingSource.SIP),
                // Legacy sources are folded into OTHER.
                anInfractionSuspicion(id = 3, reportingSource = ReportingSource.DML),
            ),
        )

        // When
        val page = execute(filter = ReportingsFilter(origin = ReportingOrigin.OTHER))

        // Then
        assertThat(page.data).hasSize(1)
        assertThat(
            page.data
                .first()
                .first.id,
        ).isEqualTo(3)
    }

    @Test
    fun `execute Should filter by zone, excluding reportings without a position`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(
            listOf(
                anInfractionSuspicion(id = 1, latitude = 1.0, longitude = 1.0),
                anInfractionSuspicion(id = 2, latitude = 50.0, longitude = 50.0),
                anInfractionSuspicion(id = 3, latitude = null, longitude = null),
            ),
        )
        val zone = WKTReader().read("POLYGON ((0 0, 0 10, 10 10, 10 0, 0 0))")

        // When
        val page = execute(filter = ReportingsFilter(zone = zone))

        // Then
        assertThat(page.data).hasSize(1)
        assertThat(
            page.data
                .first()
                .first.id,
        ).isEqualTo(1)
    }

    @Test
    fun `execute Should exclude a reporting sitting in the hole of a zone`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(
            listOf(anInfractionSuspicion(id = 1, latitude = 5.0, longitude = 5.0)),
        )
        val zone =
            WKTReader().read(
                "POLYGON ((0 0, 0 10, 10 10, 10 0, 0 0), (4 4, 4 6, 6 6, 6 4, 4 4))",
            )

        // When
        val page = execute(filter = ReportingsFilter(zone = zone))

        // Then
        assertThat(page.data).isEmpty()
        verify(vesselRepository, never()).findUnderCharterForVessel(any(), any())
    }

    @Test
    fun `execute Should filter by search query, ignoring case and accents`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(
            listOf(
                anInfractionSuspicion(id = 1, vesselName = "PÊCHEUR DU NORD"),
                anInfractionSuspicion(id = 2, vesselName = "AUTRE NAVIRE"),
            ),
        )

        // When
        val page = execute(searchQuery = "pecheur")

        // Then
        assertThat(page.data).hasSize(1)
        assertThat(
            page.data
                .first()
                .first.id,
        ).isEqualTo(1)
    }

    @Test
    fun `execute Should sort and paginate`() {
        // Given
        val now = ZonedDateTime.now()
        given(reportingRepository.findAll(any())).willReturn(
            listOf(
                anInfractionSuspicion(id = 1, reportingDate = now.minusDays(2)),
                anInfractionSuspicion(id = 2, reportingDate = now),
                anInfractionSuspicion(id = 3, reportingDate = now.minusDays(1)),
            ),
        )

        // When
        val page =
            execute(sortColumn = ReportingsSortColumn.REPORTING_DATE, sortDirection = Sort.Direction.DESC, pageSize = 2)

        // Then
        assertThat(page.data.map { it.first.id }).containsExactly(2, 3)
        assertThat(page.totalLength).isEqualTo(3)
        assertThat(page.pageSize).isEqualTo(2)
    }
}
