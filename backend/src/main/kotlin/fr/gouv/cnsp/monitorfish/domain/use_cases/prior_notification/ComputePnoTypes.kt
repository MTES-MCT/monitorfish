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

        val catchToPnoTypes = catchToLand.map { pnoCatch ->
            val pnoTypes = allPnoTypes.filter { pnoType ->
                val rules = pnoType.pnoTypeRules

                return@filter rules.any { rule -> ruleAppliesToCatch(rule, pnoCatch, pnoGears) }
            }

            return@map pnoCatch to pnoTypes
        }

        val filteredPnoTypes = allPnoTypes.filter { pnoType ->
            val allCatchesOfPnoType = catchToPnoTypes
                .filter { (_, pnoTypes) -> pnoTypes.any { pnoTypeOfCatch -> pnoTypeOfCatch.id == pnoType.id } }
                .map { (pnoCatch, _) -> pnoCatch }

            val hasEmptyGears = pnoType.pnoTypeRules.all { rule -> rule.gears.isEmpty() }
            val hasEmptyFlagStates = pnoType.pnoTypeRules.all { rule -> rule.flagStates.isEmpty() }
            val hasEmptyRequiredCatches = pnoType.pnoTypeRules.all { rule ->
                rule.species.isEmpty() && rule.faoAreas.isEmpty() && rule.cgpmAreas.isEmpty()
            }

            val numberOfEmptyRules = listOf(hasEmptyGears, hasEmptyFlagStates, hasEmptyRequiredCatches).count { it }

            val containsGear = pnoType.pnoTypeRules.any { rule -> rule.gears.any { pnoGears.contains(it) } }
            val containsFlagState = pnoType.pnoTypeRules.any { rule -> rule.flagStates.contains(flagState) }

            val totalCatchesWeight = allCatchesOfPnoType.mapNotNull { it.weight }.sum()
            val hasCatchesAndMinimumQuantity = allCatchesOfPnoType.isNotEmpty() && pnoType.pnoTypeRules.any { rules ->
                totalCatchesWeight >= rules.minimumQuantityKg
            }

            return@filter when (numberOfEmptyRules) {
                0 -> containsGear && containsFlagState && hasCatchesAndMinimumQuantity

                1 -> when {
                    !hasEmptyGears && !hasEmptyFlagStates -> containsGear && containsFlagState
                    !hasEmptyGears && !hasEmptyRequiredCatches -> containsGear && hasCatchesAndMinimumQuantity
                    !hasEmptyFlagStates && !hasEmptyRequiredCatches -> containsFlagState && hasCatchesAndMinimumQuantity
                    else -> { throw IllegalArgumentException("Only one empty field is required.") }
                }

                2 -> when {
                    hasEmptyGears && hasEmptyFlagStates -> hasCatchesAndMinimumQuantity
                    hasEmptyGears && hasEmptyRequiredCatches -> containsFlagState
                    hasEmptyFlagStates && hasEmptyRequiredCatches -> containsGear
                    else -> { throw IllegalArgumentException("Two empty fields are required.") }
                }

                else -> false
            }
        }

        return filteredPnoTypes
    }

    fun ruleAppliesToCatch(rule: PnoTypeRule, pnoCatch: Catch, pnoGears: List<String>): Boolean {
        val containsSpecies = rule.species.isEmpty() || rule.species.contains(pnoCatch.species)
        val containsGear = rule.gears.isEmpty() || rule.gears.any { pnoGears.contains(it) }
        val containsFaoAreas = rule.faoAreas.isEmpty() || rule.faoAreas.any { pnoCatch.faoZone?.startsWith(it) == true }

        return containsSpecies && containsGear && containsFaoAreas
    }
}
