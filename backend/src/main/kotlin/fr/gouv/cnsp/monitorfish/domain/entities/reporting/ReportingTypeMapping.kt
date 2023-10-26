package fr.gouv.cnsp.monitorfish.domain.entities.reporting

enum class ReportingTypeMapping(private val clazz: Class<out InfractionSuspicionOrObservationType>) : IHasImplementation {
    OBSERVATION(Observation::class.java),
    INFRACTION_SUSPICION(InfractionSuspicion::class.java),

    ;

    override fun getImplementation(): Class<out InfractionSuspicionOrObservationType> {
        return clazz
    }
}
