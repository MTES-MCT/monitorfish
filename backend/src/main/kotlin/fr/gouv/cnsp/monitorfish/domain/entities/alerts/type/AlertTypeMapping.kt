package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

enum class AlertTypeMapping(private val clazz: Class<out AlertType>) : IHasImplementation {
    PNO_LAN_WEIGHT_TOLERANCE_ALERT(PNOAndLANWeightToleranceAlert::class.java),
    THREE_MILES_TRAWLING_ALERT(ThreeMilesTrawlingAlert::class.java),
    FRENCH_EEZ_FISHING_ALERT(FrenchEEZFishingAlert::class.java),
    TWELVE_MILES_FISHING_ALERT(TwelveMilesFishingAlert::class.java),
    MISSING_FAR_ALERT(MissingFARAlert::class.java),
    MISSING_FAR_48_HOURS_ALERT(MissingFAR48HoursAlert::class.java),
    ;

    override fun getImplementation(): Class<out AlertType> {
        return clazz
    }
}
