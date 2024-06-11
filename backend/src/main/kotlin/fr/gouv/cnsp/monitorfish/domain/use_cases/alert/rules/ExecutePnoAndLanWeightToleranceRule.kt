package fr.gouv.cnsp.monitorfish.domain.use_cases.alert.rules

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANCatches
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.PNOAndLANWeightToleranceAlert
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LAN
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.rules.Rule
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.PNOAndLANWeightTolerance
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.RuleTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PNOAndLANAlertRepository
import jakarta.transaction.Transactional
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime
import java.util.*

@UseCase
class ExecutePnoAndLanWeightToleranceRule(
    private val logbookReportRepository: LogbookReportRepository,
    private val PNOAndLANAlertRepository: PNOAndLANAlertRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(ExecutePnoAndLanWeightToleranceRule::class.java)

    @Transactional
    fun execute(rule: Rule) {
        rule.value as PNOAndLANWeightTolerance
        val lanAndPnos = logbookReportRepository.findLANAndPNOMessagesNotAnalyzedBy(
            RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE.name,
        )
        logger.info("PNO_LAN_WEIGHT_TOLERANCE: Found ${lanAndPnos.size} LAN and PNOs to analyze")

        lanAndPnos.forEach { pairOfLanAndPno ->
            val (lan, pno) = pairOfLanAndPno

            if (pno == null) {
                logger.warn(
                    "PNO_LAN_WEIGHT_TOLERANCE: No PNO associated to the LAN of " +
                        "trip ${lan.tripNumber} of the vessel ${lan.internalReferenceNumber} found.",
                )
            } else {
                lan.message as LAN
                pno.message as PNO

                val catchesOverTolerance = getCatchesOverTolerance(lan.message, pno.message, rule.value)

                if (catchesOverTolerance.isNotEmpty()) {
                    logger.info(
                        "PNO_LAN_WEIGHT_TOLERANCE: Found ${catchesOverTolerance.size} catches which are over tolerance " +
                            "for LAN ${lan.operationNumber} and PNO ${pno.operationNumber}",
                    )
                    val alert = buildAlert(lan, pno, rule.value, catchesOverTolerance)

                    logger.info("Saving alert: ${alert.id}...}")
                    PNOAndLANAlertRepository.save(alert)
                    logger.info("PNO_LAN_WEIGHT_TOLERANCE: Alert saved")
                }
            }
        }

        val listOfLanAndPnoIds = lanAndPnos.map { listOf(it.first, it.second) }.flatten()
            .mapNotNull { it?.id }
        if (listOfLanAndPnoIds.isNotEmpty()) {
            logbookReportRepository.updateLogbookMessagesAsProcessedByRule(
                listOfLanAndPnoIds,
                RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE.name,
            )
            logger.info("PNO_LAN_WEIGHT_TOLERANCE: ${listOfLanAndPnoIds.size} Logbook messages marked as processed")
        }
    }

    private fun buildAlert(
        lan: LogbookMessage,
        pno: LogbookMessage,
        value: PNOAndLANWeightTolerance,
        catchesOverTolerance: List<PNOAndLANCatches>,
    ): PNOAndLANAlert {
        val toleranceAlert = PNOAndLANWeightToleranceAlert(
            lan.operationNumber,
            pno.operationNumber,
            value.percentOfTolerance,
            value.minimumWeightThreshold,
            catchesOverTolerance,
        )

        return PNOAndLANAlert(
            id = UUID.randomUUID(),
            internalReferenceNumber = lan.internalReferenceNumber,
            externalReferenceNumber = lan.externalReferenceNumber,
            ircs = lan.ircs,
            tripNumber = lan.tripNumber,
            creationDate = ZonedDateTime.now(),
            value = toleranceAlert,
        )
    }

    private fun getCatchesOverTolerance(
        lan: LAN,
        pno: PNO,
        value: PNOAndLANWeightTolerance,
    ): List<PNOAndLANCatches> {
        val catchesLandedBySpecies = lan.catchLanded
            .groupBy { it.species }
        val catchesOnboardBySpecies = pno.catchOnboard
            .groupBy { it.species }

        return catchesLandedBySpecies
            .keys
            .mapNotNull { lanSpeciesKey ->
                val lanWeight = catchesLandedBySpecies[lanSpeciesKey]
                    ?.map { it.weight?.let { weight -> weight * (it.conversionFactor ?: 1.0) } }
                    ?.mapNotNull { it }
                    ?.sum()

                val speciesName = catchesLandedBySpecies[lanSpeciesKey]?.first()?.speciesName
                val lanCatch =
                    LogbookFishingCatch(species = lanSpeciesKey, speciesName = speciesName, weight = lanWeight)

                if (lanWeight == null || !value.isAboveMinimumWeightThreshold(lanWeight)) {
                    return@mapNotNull null
                }

                try {
                    val pnoWeight = getPNOWeight(catchesOnboardBySpecies, lanSpeciesKey)
                    val pnoCatch = pnoWeight?.let {
                        LogbookFishingCatch(species = lanSpeciesKey, speciesName = speciesName, weight = pnoWeight)
                    } ?: return@mapNotNull PNOAndLANCatches(null, lanCatch)

                    run {
                        val percentOfPnoWeightOverLan = value.getPercentBetweenLANAndPNO(lanWeight, pnoWeight)

                        val weightIsOverTolerance = value.evaluate(percentOfPnoWeightOverLan)
                        if (!weightIsOverTolerance) {
                            return@run null
                        }

                        PNOAndLANCatches(pnoCatch, lanCatch)
                    }
                } catch (e: Exception) {
                    logger.error("PNO_LAN_WEIGHT_TOLERANCE: Error while executing rule", e)
                    null
                }
            }
    }

    private fun getPNOWeight(
        catchesOnboardBySpecies: Map<String?, List<LogbookFishingCatch>>,
        lanSpeciesKey: String?,
    ): Double? {
        val species = catchesOnboardBySpecies
            .keys
            .singleOrNull { species -> species == lanSpeciesKey }

        return species?.let {
            catchesOnboardBySpecies[species]
                ?.mapNotNull { it.weight }
                ?.sum()
        }
    }
}
