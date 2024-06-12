package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoType
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoTypeRule
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoTypeRepository

@UseCase
class ComputePnoTypes(
    private val pnoTypeRepository: PnoTypeRepository,
) {
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
        val allPnoTypeRules = allPnoTypes.map { pnoType -> pnoType.pnoTypeRules.map { it to pnoType } }.flatten()

        val catchToPnoTypeRules = catchToLand.map { pnoCatch ->
            val pnoTypeRules = allPnoTypeRules
                .map { it.first }
                .filter { rule -> ruleAppliesToCatch(rule, pnoCatch, pnoGears) }

            return@map pnoCatch to pnoTypeRules
        }

        val filteredPnoTypeRules = allPnoTypeRules.filter { (rule) ->
            val allCatchesOfRule = catchToPnoTypeRules
                .filter { (_, pnoTypeRules) -> pnoTypeRules.any { pnoTypeRuleOfCatch -> pnoTypeRuleOfCatch.id == rule.id } }
                .map { (pnoCatch, _) -> pnoCatch }

            val hasEmptyGears = rule.gears.isEmpty()
            val hasEmptyFlagStates = rule.flagStates.isEmpty()
            val hasEmptyRequiredCatches = rule.species.isEmpty() && rule.faoAreas.isEmpty() && rule.cgpmAreas.isEmpty()

            val numberOfEmptyRules = listOf(hasEmptyGears, hasEmptyFlagStates, hasEmptyRequiredCatches).count { it }

            val containsGear = rule.gears.any { pnoGears.contains(it) }
            val containsFlagState = rule.flagStates.contains(flagState)

            val totalCatchesWeight = allCatchesOfRule.mapNotNull { it.weight }.sum()
            val hasCatchesAndMinimumQuantity = allCatchesOfRule.isNotEmpty() && totalCatchesWeight >= rule.minimumQuantityKg

            return@filter when (numberOfEmptyRules) {
                0 -> containsGear && containsFlagState && hasCatchesAndMinimumQuantity

                1 -> when {
                    !hasEmptyGears && !hasEmptyFlagStates -> containsGear && containsFlagState
                    !hasEmptyGears && !hasEmptyRequiredCatches -> containsGear && hasCatchesAndMinimumQuantity
                    !hasEmptyFlagStates && !hasEmptyRequiredCatches -> containsFlagState && hasCatchesAndMinimumQuantity
                    else -> false
                }

                2 -> when {
                    hasEmptyGears && hasEmptyFlagStates -> hasCatchesAndMinimumQuantity
                    hasEmptyGears && hasEmptyRequiredCatches -> containsFlagState
                    hasEmptyFlagStates && hasEmptyRequiredCatches -> containsGear
                    else -> false
                }

                else -> true
            }
        }

        return filteredPnoTypeRules.map { (_, type) -> type }.distinctBy { it.id }
    }

    fun ruleAppliesToCatch(rule: PnoTypeRule, pnoCatch: Catch, pnoGears: List<String>): Boolean {
        val containsSpecies = rule.species.isEmpty() || rule.species.contains(pnoCatch.species)
        val containsGear = rule.gears.isEmpty() || rule.gears.any { pnoGears.contains(it) }
        val containsFaoAreas = rule.faoAreas.isEmpty() || rule.faoAreas.any { pnoCatch.faoZone?.startsWith(it) == true }

        return containsSpecies && containsGear && containsFaoAreas
    }
}
