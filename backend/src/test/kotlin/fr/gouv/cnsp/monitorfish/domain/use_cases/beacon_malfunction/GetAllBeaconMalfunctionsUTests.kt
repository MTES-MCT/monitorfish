package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetAllBeaconMalfunctionsUTests {
    @MockitoBean
    private lateinit var beaconMalfunctionsRepository: BeaconMalfunctionsRepository

    @MockitoBean
    private lateinit var riskFactorRepository: RiskFactorRepository

    @MockitoBean
    private lateinit var beaconRepository: BeaconRepository

    @Test
    fun `execute Should return the beacon malfunctions filtered and enriched with the risk factor found in the last position table`() {
        // Given
        val riskFactors =
            listOf(
                VesselRiskFactor(riskFactor = 1.23, internalReferenceNumber = "FR224226850"),
                VesselRiskFactor(riskFactor = 1.68, internalReferenceNumber = "FR000123456"),
                VesselRiskFactor(riskFactor = 1.54, internalReferenceNumber = "FR123456785"),
            )
        given(riskFactorRepository.findAll()).willReturn(riskFactors)
        given(beaconMalfunctionsRepository.findAllExceptArchived()).willReturn(
            listOf(
                BeaconMalfunction(
                    1,
                    "FR224226850",
                    "1236514",
                    "IRCS",
                    null,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    "BIDUBULE",
                    VesselStatus.AT_SEA,
                    Stage.INITIAL_ENCOUNTER,
                    ZonedDateTime.now(),
                    null,
                    ZonedDateTime.now(),
                    beaconNumber = "123465",
                    beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED,
                    vesselId = 123,
                ),
                BeaconMalfunction(
                    2,
                    "FR224226850",
                    "1236514",
                    "IRCS",
                    null,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    "BIDUBULE",
                    VesselStatus.AT_SEA,
                    Stage.TARGETING_VESSEL,
                    ZonedDateTime.now(),
                    ZonedDateTime.now(),
                    ZonedDateTime.now(),
                    beaconNumber = "123465",
                    beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED,
                    endOfBeaconMalfunctionReason = EndOfBeaconMalfunctionReason.RESUMED_TRANSMISSION,
                    vesselId = 123,
                ),
                BeaconMalfunction(
                    3,
                    "FR000123456",
                    "999999",
                    "CALLME",
                    null,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    "VESSEL UNSUPERVISED",
                    VesselStatus.AT_SEA,
                    Stage.INITIAL_ENCOUNTER,
                    ZonedDateTime.now(),
                    null,
                    ZonedDateTime.now(),
                    beaconNumber = "the now unsupervised beacon",
                    beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED,
                    vesselId = 123,
                ),
            ),
        )
        given(beaconMalfunctionsRepository.findLastSixtyArchived()).willReturn(
            listOf(
                BeaconMalfunction(
                    4,
                    "FR123456785",
                    "9876543",
                    "IRCS2",
                    null,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    "SOMEONE ELSE",
                    VesselStatus.AT_SEA,
                    Stage.ARCHIVED,
                    ZonedDateTime.now(),
                    null,
                    ZonedDateTime.now(),
                    beaconNumber = "another active beacon",
                    beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED,
                    vesselId = 123,
                ),
            ),
        )
        // Only the beacon of Bidibule should be supervised
        given(beaconRepository.findActivatedBeaconNumbers()).willReturn(listOf("123465", "another active beacon"))

        // When
        val filteredAndEnrichedBeaconMalfunctions =
            GetAllBeaconMalfunctions(
                beaconMalfunctionsRepository = beaconMalfunctionsRepository,
                riskFactorRepository = riskFactorRepository,
                beaconRepository = beaconRepository,
            ).execute()

        // Then
        assertThat(filteredAndEnrichedBeaconMalfunctions).hasSize(3)
        assertThat(filteredAndEnrichedBeaconMalfunctions.first().id).isEqualTo(1)
        assertThat(filteredAndEnrichedBeaconMalfunctions.first().riskFactor).isEqualTo(1.23)
        assertThat(filteredAndEnrichedBeaconMalfunctions.first().internalReferenceNumber).isEqualTo("FR224226850")

        assertThat(filteredAndEnrichedBeaconMalfunctions.last().id).isEqualTo(4)
        assertThat(filteredAndEnrichedBeaconMalfunctions.last().riskFactor).isEqualTo(1.54)
        assertThat(filteredAndEnrichedBeaconMalfunctions.last().internalReferenceNumber).isEqualTo("FR123456785")
    }
}
