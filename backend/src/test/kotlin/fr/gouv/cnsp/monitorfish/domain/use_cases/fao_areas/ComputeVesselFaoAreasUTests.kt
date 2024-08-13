package fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class ComputeVesselFaoAreasUTests {

    @MockBean
    private lateinit var riskFactorRepository: RiskFactorRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var computeFAOAreasFromCoordinates: ComputeFaoAreasFromCoordinates

    @Test
    fun `execute Should return the computed fao areas When the latitude & longitude are given`() {
        given(computeFAOAreasFromCoordinates.execute(any(), any())).willReturn(
            listOf(
                FaoArea("27.8.c"),
                FaoArea("27.8"),
            ),
        )

        // When
        val faoAreas = ComputeVesselFaoAreas(riskFactorRepository, portRepository, computeFAOAreasFromCoordinates)
            .execute(null, 12.5, 45.1, null)

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c", "27.8"))
    }

    @Test
    fun `execute Should return no fao area When a coordinate parameter is null`() {
        // When
        val faoAreas = ComputeVesselFaoAreas(riskFactorRepository, portRepository, computeFAOAreasFromCoordinates)
            .execute(null, null, 45.1, null)

        // Then
        assertThat(faoAreas).isEmpty()
    }

    @Test
    fun `execute Should return the computed fao areas When no fao areas are found in the risk factors table`() {
        given(riskFactorRepository.findByInternalReferenceNumber(any()))
            .willReturn(VesselRiskFactor(speciesOnboard = listOf(Species(faoZone = null))))
        given(computeFAOAreasFromCoordinates.execute(any(), any())).willReturn(
            listOf(
                FaoArea("27.8.c"),
                FaoArea("27.8"),
            ),
        )

        // When
        val faoAreas = ComputeVesselFaoAreas(riskFactorRepository, portRepository, computeFAOAreasFromCoordinates)
            .execute("DUMMY_CFR", 12.5, 45.1, null)

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c", "27.8"))
    }

    @Test
    fun `execute Should return the computed fao areas When no risk factor is found in the table`() {
        given(riskFactorRepository.findByInternalReferenceNumber(any()))
            .willReturn(null)
        given(computeFAOAreasFromCoordinates.execute(any(), any())).willReturn(
            listOf(
                FaoArea("27.8.c"),
                FaoArea("27.8"),
            ),
        )

        // When
        val faoAreas = ComputeVesselFaoAreas(riskFactorRepository, portRepository, computeFAOAreasFromCoordinates)
            .execute("DUMMY_CFR", 12.5, 45.1, null)

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c", "27.8"))
    }

    @Test
    fun `execute Should return the fao areas found in the risk factors table`() {
        given(riskFactorRepository.findByInternalReferenceNumber(any()))
            .willReturn(VesselRiskFactor(speciesOnboard = listOf(Species(faoZone = "27.8.c"))))

        // When
        val faoAreas = ComputeVesselFaoAreas(riskFactorRepository, portRepository, computeFAOAreasFromCoordinates)
            .execute("DUMMY_CFR", 12.5, 45.1, null)

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c"))
    }

    @Test
    fun `execute Should return the computed fao areas When the port Locode given`() {
        given(portRepository.findByLocode(any())).willReturn(
            Port("AEFAT", "Al Jazeera Port", faoAreas = listOf("27.8.c", "27.8")),
        )

        // When
        val faoAreas = ComputeVesselFaoAreas(riskFactorRepository, portRepository, computeFAOAreasFromCoordinates)
            .execute(null, null, null, "AEFAT")

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c", "27.8"))
    }

    @Test
    fun `execute Should return the computed fao areas When the CFR and the port Locode are given`() {
        given(portRepository.findByLocode(any())).willReturn(
            Port("AEFAT", "Al Jazeera Port", faoAreas = listOf("27.8.c", "27.8")),
        )

        // When
        val faoAreas = ComputeVesselFaoAreas(riskFactorRepository, portRepository, computeFAOAreasFromCoordinates)
            .execute("DUMMY_CFR", null, null, "AEFAT")

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c", "27.8"))
    }
}
