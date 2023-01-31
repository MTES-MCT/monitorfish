package fr.gouv.cnsp.monitorfish.domain.entities.rules.type

import fr.gouv.cnsp.monitorfish.domain.entities.rules.InputSource
import kotlin.math.absoluteValue

class PNOAndLANWeightTolerance(
    var percentOfTolerance: Double? = null,
    var minimumWeightThreshold: Double? = null
) : RuleType(RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE, InputSource.Logbook) {
    override fun evaluate(parameterToAssert: Double): Boolean {
        val percentOfTolerance = percentOfTolerance
            ?: throw IllegalArgumentException("Percent of tolerance is not given, rule could not be evaluated.")

        return parameterToAssert > percentOfTolerance
    }

    fun getPercentBetweenLANAndPNO(lanWeight: Double, pnoWeight: Double): Double {
        return ((pnoWeight * 100) / lanWeight - 100).absoluteValue
    }

    fun isAboveMinimumWeightThreshold(lanWeight: Double): Boolean {
        return lanWeight > (minimumWeightThreshold
            ?: throw IllegalArgumentException("Minimum weight threshold is not given, rule could not be evaluated."))
    }
}
