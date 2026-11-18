package fr.gouv.cnsp.monitorfish.infrastructure.api.referential

import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.mock
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.repositories.RegulatoryCatalogueRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.gear.GetAllGears
import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractions
import fr.gouv.cnsp.monitorfish.domain.use_cases.port.GetActivePorts
import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetAllSpeciesAndSpeciesGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ReferentialSnapshotsUTests {
    private val getAllGears: GetAllGears = mock()
    private val regulatoryCatalogueRepository: RegulatoryCatalogueRepository = mock()

    private val referentialSnapshots =
        ReferentialSnapshots(
            getActivePorts = mock<GetActivePorts>(),
            getAllGears = getAllGears,
            getAllInfractions = mock<GetAllInfractions>(),
            getAllSpeciesAndSpeciesGroups = mock<GetAllSpeciesAndSpeciesGroups>(),
            objectMapper = MapperConfiguration().objectMapper(),
            regulatoryCatalogueRepository = regulatoryCatalogueRepository,
        )

    @Test
    fun `gears Should change version only when the gears change`() {
        // Given
        given(getAllGears.execute()).willReturn(
            listOf(Gear("OTB", "Chaluts de fond à panneaux", "Chaluts")),
            listOf(Gear("OTB", "Chaluts de fond à panneaux", "Chaluts")),
            listOf(Gear("OTB", "Chaluts de fond à panneaux", "Chaluts", isMeshRequiredForSegment = true)),
        )

        // When
        val first = referentialSnapshots.gears()
        val unchanged = referentialSnapshots.gears()
        val changed = referentialSnapshots.gears()

        // Then
        assertThat(first.data.first().code).isEqualTo("OTB")
        assertThat(unchanged.version).isEqualTo(first.version)
        assertThat(changed.version).isNotEqualTo(first.version)
    }

    @Test
    fun `regulations Should version the catalogue returned by the repository`() {
        // Given
        given(regulatoryCatalogueRepository.findAllAsGeoJson()).willReturn(
            """{"type" : "FeatureCollection", "features" : []}""",
            """{"type" : "FeatureCollection", "features" : [{"type" : "Feature", "id" : "regulations.1"}]}""",
        )

        // When
        val empty = referentialSnapshots.regulations()
        val withAZone = referentialSnapshots.regulations()

        // Then
        assertThat(empty.data).isEqualTo("""{"type" : "FeatureCollection", "features" : []}""")
        assertThat(withAZone.version).isNotEqualTo(empty.version)
    }
}
