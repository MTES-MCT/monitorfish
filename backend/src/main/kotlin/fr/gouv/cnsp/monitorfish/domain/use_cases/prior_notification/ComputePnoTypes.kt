package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoType
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoTypeRule
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoTypeRepository
import org.slf4j.LoggerFactory

@UseCase
class ComputePnoTypes(
    private val pnoTypeRepository: PnoTypeRepository,
) {
    private val logger = LoggerFactory.getLogger(ComputePnoTypes::class.java)

    fun execute(
        catchToLand: List<Catch>,
        tripGears: List<Gear>,
        flagState: CountryCode,
    ): List<PnoType> {
        require(catchToLand.all { it.faoZone != null }) {
            "All `faoZone` of catches must be given."
        }

        val pnoGears = tripGears.mapNotNull { it.gear }.distinct()
        val allPnoTypes = pnoTypeRepository.findAll()

        val catchToPnoTypes = catchToLand.map { pnoCatch ->
            val pnoTypes = allPnoTypes.filter { pnoType ->
                val rules = pnoType.pnoTypeRules

                return@filter rules.any { rule -> ruleAppliesToCatch(rule, pnoCatch, pnoGears, flagState) }
            }

            return@map pnoCatch to pnoTypes
        }

        val filteredPnoTypes = allPnoTypes.filter { pnoType ->
            val containsGear = pnoType.pnoTypeRules.any { rule ->
                rule.gears.any { pnoGears.contains(it) }
            }
            val containsFlagState = pnoType.pnoTypeRules.any { rule ->
                rule.flagStates.contains(flagState)
            }

            val allCatchesOfPnoType = catchToPnoTypes
                .filter { (_, pnoTypes) -> pnoTypes.any { pnoTypeOfCatch -> pnoTypeOfCatch.id == pnoType.id } }
                .map { (pnoCatch, _) -> pnoCatch }

            val totalCatchesWeight = allCatchesOfPnoType.mapNotNull { it.weight }.sum()
            val hasCatchesAndMinimumQuantity = allCatchesOfPnoType.isNotEmpty() && pnoType.pnoTypeRules.any { rules ->
                totalCatchesWeight >= rules.minimumQuantityKg
            }

            return@filter containsGear || containsFlagState || hasCatchesAndMinimumQuantity
        }

        return filteredPnoTypes
    }

    fun ruleAppliesToCatch(rule: PnoTypeRule, pnoCatch: Catch, pnoGears: List<String>, flagState: CountryCode): Boolean {
        val containsSpecies = rule.species.isEmpty() || rule.species.contains(pnoCatch.species)
        val containsGear = rule.gears.isEmpty() || rule.gears.any { pnoGears.contains(it) }
        val containsFaoAreas = rule.faoAreas.isEmpty() || rule.faoAreas.any { pnoCatch.faoZone?.startsWith(it) == true }
        val containsFlagState = rule.flagStates.isEmpty() || rule.flagStates.contains(flagState)

        return containsSpecies && containsGear && containsFaoAreas && containsFlagState
    }
}
