package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

enum class AlertTypeMapping(private val clazz: Class<out AlertType>) : IHasImplementation {
    PNO_LAN_WEIGHT_TOLERANCE_ALERT(PNOAndLANWeightToleranceAlert::class.java),
    THREE_MILES_TRAWLING_ALERT(ThreeMilesTrawlingAlert::class.java);

    override fun getImplementation(): Class<out AlertType> {
        return clazz
    }
}
