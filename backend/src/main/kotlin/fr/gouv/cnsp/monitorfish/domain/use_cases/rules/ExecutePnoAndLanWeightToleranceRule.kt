package fr.gouv.cnsp.monitorfish.domain.use_cases.rules

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANCatches
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.PNOAndLANWeightToleranceAlert
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.LAN
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.rules.Rule
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.PNOAndLANWeightTolerance
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.RuleTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.AlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime
import java.util.*

@UseCase
class ExecutePnoAndLanWeightToleranceRule(private val ersRepository: ERSRepository,
                                          private val alertRepository: AlertRepository) {
    private val logger: Logger = LoggerFactory.getLogger(ExecutePnoAndLanWeightToleranceRule::class.java)

    fun execute(rule: Rule) {
        rule.value as PNOAndLANWeightTolerance
        val lanAndPnos = ersRepository.findLANAndPNOMessagesNotAnalyzedBy(RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE.name)
        logger.info("PNO_LAN_WEIGHT_TOLERANCE: Found ${lanAndPnos.size} LAN and PNOs to analyze")

        lanAndPnos.forEach { pairOfLanAndPno ->
            val (lan, pno) = pairOfLanAndPno

            if(pno == null) {
                logger.warn("PNO_LAN_WEIGHT_TOLERANCE: No PNO associated to the LAN of " +
                        "trip ${lan.tripNumber} of the vessel ${lan.internalReferenceNumber} found.")
            } else {
                lan.message as LAN
                pno.message as PNO

                val catchesOverTolerance = getCatchesOverTolerance(lan.message, pno.message, rule.value)

                if (catchesOverTolerance.isNotEmpty()) {
                    logger.info("PNO_LAN_WEIGHT_TOLERANCE: Found ${catchesOverTolerance.size} catches which are over tolerance " +
                            "for LAN ${lan.operationNumber} and PNO ${pno.operationNumber}")
                    val alert = buildAlert(lan, pno, rule.value, catchesOverTolerance)

                    alertRepository.save(alert)
                    logger.info("PNO_LAN_WEIGHT_TOLERANCE: Alert saved")
                }
            }
        }

        val listOfLanAndPnoIds = lanAndPnos.map { listOf(it.first, it.second) }.flatten()
                .mapNotNull { it?.id }
        if(listOfLanAndPnoIds.isNotEmpty()) {
            ersRepository.updateERSMessagesAsProcessedByRule(listOfLanAndPnoIds, RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE.name)
            logger.info("PNO_LAN_WEIGHT_TOLERANCE: ${listOfLanAndPnoIds.size} ERS messages marked as processed")
        }
    }

    private fun buildAlert(lan: ERSMessage, pno: ERSMessage, value: PNOAndLANWeightTolerance, catchesOverTolerance: List<PNOAndLANCatches>) : Alert {
        val toleranceAlert = PNOAndLANWeightToleranceAlert(
                lan.operationNumber,
                pno.operationNumber,
                value.percentOfTolerance,
                value.minimumWeightThreshold,
                catchesOverTolerance)

        return Alert(
                id = UUID.randomUUID(),
                name = AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT.name,
                internalReferenceNumber = lan.internalReferenceNumber,
                externalReferenceNumber = lan.externalReferenceNumber,
                ircs = lan.ircs,
                tripNumber = lan.tripNumber,
                creationDate = ZonedDateTime.now(),
                value = toleranceAlert)
    }

    private fun getCatchesOverTolerance(lan: LAN, pno: PNO, value: PNOAndLANWeightTolerance): List<PNOAndLANCatches> {
        return lan.catchLanded.mapNotNull { lanCatch ->
            val lanWeight = lanCatch.weight

            try {
                if(lanWeight != null && value.isAboveMinimumWeightThreshold(lanWeight)) {
                    val pnoCatch = getPNOCatch(pno, lanCatch)
                    val pnoWeight = pnoCatch?.weight

                    if (pnoCatch == null) {
                        PNOAndLANCatches( null, lanCatch)
                    } else if (pnoWeight == null) {
                        PNOAndLANCatches(pnoCatch, lanCatch)
                    } else {
                        val percentOfPnoWeightOverLan = value.getPercentBetweenLANAndPNO(lanWeight, pnoWeight)

                        val weightIsOverTolerance = value.evaluate(percentOfPnoWeightOverLan)

                        if (weightIsOverTolerance) {
                            PNOAndLANCatches(pnoCatch, lanCatch)
                        } else {
                            null
                        }
                    }
                } else {
                    null
                }
            } catch (e: Exception) {
                logger.error("PNO_LAN_WEIGHT_TOLERANCE: Error while executing rule", e)
                null
            }
        }
    }

    private fun getPNOCatch(pno: PNO, lanCatch: Catch): Catch? {
        return pno.catchOnboard.singleOrNull {
            it.species == lanCatch.species &&
            it.economicZone == lanCatch.economicZone &&
            it.faoZone == lanCatch.faoZone &&
            it.statisticalRectangle == lanCatch.statisticalRectangle &&
            it.presentation == lanCatch.presentation
        }
    }
}
