package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.whenever
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyReportings
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegments
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.TestUtils.getDummyFleetSegments
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.TestUtils.getDummyPnoTypes
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.mock
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class ComputeManualPriorNotificationUTests {
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository = mock()
    private val pnoFleetSegmentSubscriptionRepository: PnoFleetSegmentSubscriptionRepository = mock()
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository = mock()
    private val vesselRepository: VesselRepository = mock()
    private val reportingRepository: ReportingRepository = mock()
    private val speciesRepository: SpeciesRepository = mock()
    private val computeFleetSegments: ComputeFleetSegments = mock()
    private val computePnoTypes: ComputePnoTypes = mock()
    private val computeRiskFactor: ComputeRiskFactor = mock()

    @Test
    fun `execute should return isInVerificationScope as true When flag state is GBR`() {
        // Given
        val vesselId = 1
        val vessel =
            Vessel(
                id = 1,
                internalReferenceNumber = "GBR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.GB,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
                underCharter = true,
            )

        val catches = listOf(LogbookFishingCatch(species = "HKE", faoZone = "27.9.a", weight = 1500.0))

        val speciesList =
            listOf(
                Species("BSS", "", null),
                Species("HKE", "", ScipSpeciesType.DEMERSAL),
                Species("NEP", "", null),
                Species("SOL", "", ScipSpeciesType.DEMERSAL),
                Species("SWO", "", ScipSpeciesType.TUNA),
            )
        val faoArea = "27.7.d"
        val portLocode = "FRDUN"
        val year = 2024
        val tripGearCodes = listOf("OTB")

        val segments = getDummyFleetSegments()
        val types = getDummyPnoTypes()
        val riskFactor = 0.75

        whenever(vesselRepository.findVesselById(any())).thenReturn(vessel)
        whenever(reportingRepository.findCurrentInfractionSuspicionsByVesselId(any())).thenReturn(listOf())
        whenever(speciesRepository.findAll()).thenReturn(speciesList)
        whenever(computeFleetSegments.execute(any(), any(), any())).thenReturn(segments)
        whenever(computePnoTypes.execute(any(), any(), any())).thenReturn(types)
        whenever(computeRiskFactor.execute(any(), any(), any())).thenReturn(riskFactor)

        whenever(pnoPortSubscriptionRepository.has(portLocode)).thenReturn(true)
        whenever(pnoVesselSubscriptionRepository.has(vesselId)).thenReturn(false)
        whenever(pnoFleetSegmentSubscriptionRepository.has(any(), any())).thenReturn(false)

        // When
        val result =
            ComputeManualPriorNotification(
                pnoPortSubscriptionRepository = pnoPortSubscriptionRepository,
                pnoFleetSegmentSubscriptionRepository = pnoFleetSegmentSubscriptionRepository,
                pnoVesselSubscriptionRepository = pnoVesselSubscriptionRepository,
                vesselRepository = vesselRepository,
                reportingRepository = reportingRepository,
                speciesRepository = speciesRepository,
                computeFleetSegments = computeFleetSegments,
                computePnoTypes = computePnoTypes,
                computeRiskFactor = computeRiskFactor,
            ).execute(catches, faoArea, portLocode, tripGearCodes, vesselId, year)

        // Then
        assertThat(result.isVesselUnderCharter).isTrue()
        assertThat(result.vesselRiskFactor).isEqualTo(riskFactor)
        assertThat(result.tripSegments).isEqualTo(segments)
        assertThat(result.types).isEqualTo(types)
        assertThat(result.isInVerificationScope).isTrue()
        assertThat(result.nextState).isEqualTo(PriorNotificationState.PENDING_VERIFICATION)
    }

    @Test
    fun `execute should return isInVerificationScope as true When vessel has active reportings`() {
        // Given
        val vesselId = 1
        val vessel =
            Vessel(
                id = 1,
                internalReferenceNumber = "FRA00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
                underCharter = true,
            )

        val catches = listOf(LogbookFishingCatch(species = "HKE", faoZone = "27.9.a", weight = 1500.0))

        val speciesList =
            listOf(
                Species("BSS", "", null),
                Species("HKE", "", ScipSpeciesType.DEMERSAL),
                Species("NEP", "", null),
                Species("SOL", "", ScipSpeciesType.DEMERSAL),
                Species("SWO", "", ScipSpeciesType.TUNA),
            )
        val faoArea = "27.7.d"
        val portLocode = "FRDUN"
        val year = 2024
        val tripGearCodes = listOf("OTB")

        val segments = getDummyFleetSegments()
        val types = getDummyPnoTypes()
        val riskFactor = 0.75
        val reportings = getDummyReportings(ZonedDateTime.now())

        whenever(vesselRepository.findVesselById(any())).thenReturn(vessel)
        whenever(reportingRepository.findCurrentInfractionSuspicionsByVesselId(any())).thenReturn(reportings)
        whenever(speciesRepository.findAll()).thenReturn(speciesList)
        whenever(computeFleetSegments.execute(any(), any(), any())).thenReturn(segments)
        whenever(computePnoTypes.execute(any(), any(), any())).thenReturn(types)
        whenever(computeRiskFactor.execute(any(), any(), any())).thenReturn(riskFactor)

        whenever(pnoPortSubscriptionRepository.has(portLocode)).thenReturn(true)
        whenever(pnoVesselSubscriptionRepository.has(vesselId)).thenReturn(false)
        whenever(pnoFleetSegmentSubscriptionRepository.has(any(), any())).thenReturn(false)

        // When
        val result =
            ComputeManualPriorNotification(
                pnoPortSubscriptionRepository = pnoPortSubscriptionRepository,
                pnoFleetSegmentSubscriptionRepository = pnoFleetSegmentSubscriptionRepository,
                pnoVesselSubscriptionRepository = pnoVesselSubscriptionRepository,
                vesselRepository = vesselRepository,
                reportingRepository = reportingRepository,
                speciesRepository = speciesRepository,
                computeFleetSegments = computeFleetSegments,
                computePnoTypes = computePnoTypes,
                computeRiskFactor = computeRiskFactor,
            ).execute(catches, faoArea, portLocode, tripGearCodes, vesselId, year)

        // Then
        assertThat(result.isVesselUnderCharter).isTrue()
        assertThat(result.vesselRiskFactor).isEqualTo(riskFactor)
        assertThat(result.tripSegments).isEqualTo(segments)
        assertThat(result.types).isEqualTo(types)
        assertThat(result.isInVerificationScope).isTrue()
        assertThat(result.nextState).isEqualTo(PriorNotificationState.PENDING_VERIFICATION)
    }

    @Test
    fun `execute should return isInVerificationScope as false When vessel has no active reportings`() {
        // Given
        val vesselId = 1
        val vessel =
            Vessel(
                id = 1,
                internalReferenceNumber = "FRA00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
                underCharter = true,
            )

        val catches = listOf(LogbookFishingCatch(species = "HKE", faoZone = "27.9.a", weight = 1500.0))

        val speciesList =
            listOf(
                Species("BSS", "", null),
                Species("HKE", "", ScipSpeciesType.DEMERSAL),
                Species("NEP", "", null),
                Species("SOL", "", ScipSpeciesType.DEMERSAL),
                Species("SWO", "", ScipSpeciesType.TUNA),
            )
        val faoArea = "27.7.d"
        val portLocode = "FRDUN"
        val year = 2024
        val tripGearCodes = listOf("OTB")

        val segments = getDummyFleetSegments()
        val types = getDummyPnoTypes()
        val riskFactor = 0.75

        whenever(vesselRepository.findVesselById(any())).thenReturn(vessel)
        whenever(reportingRepository.findCurrentInfractionSuspicionsByVesselId(any())).thenReturn(listOf())
        whenever(speciesRepository.findAll()).thenReturn(speciesList)
        whenever(computeFleetSegments.execute(any(), any(), any())).thenReturn(segments)
        whenever(computePnoTypes.execute(any(), any(), any())).thenReturn(types)
        whenever(computeRiskFactor.execute(any(), any(), any())).thenReturn(riskFactor)

        whenever(pnoPortSubscriptionRepository.has(portLocode)).thenReturn(true)
        whenever(pnoVesselSubscriptionRepository.has(vesselId)).thenReturn(false)
        whenever(pnoFleetSegmentSubscriptionRepository.has(any(), any())).thenReturn(false)

        // When
        val result =
            ComputeManualPriorNotification(
                pnoPortSubscriptionRepository = pnoPortSubscriptionRepository,
                pnoFleetSegmentSubscriptionRepository = pnoFleetSegmentSubscriptionRepository,
                pnoVesselSubscriptionRepository = pnoVesselSubscriptionRepository,
                vesselRepository = vesselRepository,
                reportingRepository = reportingRepository,
                speciesRepository = speciesRepository,
                computeFleetSegments = computeFleetSegments,
                computePnoTypes = computePnoTypes,
                computeRiskFactor = computeRiskFactor,
            ).execute(catches, faoArea, portLocode, tripGearCodes, vesselId, year)

        // Then
        assertThat(result.isVesselUnderCharter).isTrue()
        assertThat(result.vesselRiskFactor).isEqualTo(riskFactor)
        assertThat(result.tripSegments).isEqualTo(segments)
        assertThat(result.types).isEqualTo(types)
        assertThat(result.isInVerificationScope).isFalse()
        assertThat(result.nextState).isEqualTo(PriorNotificationState.AUTO_SEND_REQUESTED)
    }
}
