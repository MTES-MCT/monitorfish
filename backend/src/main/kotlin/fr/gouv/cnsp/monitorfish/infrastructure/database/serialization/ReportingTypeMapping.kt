package fr.gouv.cnsp.monitorfish.infrastructure.database.serialization

enum class ReportingTypeMapping(
    private val clazz: Class<out Any>,
) : IHasImplementation {
    OBSERVATION(ObservationDto::class.java),
    INFRACTION_SUSPICION(InfractionSuspicionDto::class.java),

    ;

    override fun getImplementation(): Class<out Any> = clazz
}

interface IHasImplementation {
    fun getImplementation(): Class<out Any>
}
