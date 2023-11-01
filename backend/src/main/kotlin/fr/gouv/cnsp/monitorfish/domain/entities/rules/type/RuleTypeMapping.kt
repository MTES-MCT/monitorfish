package fr.gouv.cnsp.monitorfish.domain.entities.rules.type

enum class RuleTypeMapping(private val clazz: Class<out RuleType>) : IHasImplementation {
    PNO_LAN_WEIGHT_TOLERANCE(PNOAndLANWeightTolerance::class.java),

    ;

    override fun getImplementation(): Class<out RuleType> {
        return clazz
    }
}
