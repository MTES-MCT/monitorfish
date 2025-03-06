package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

enum class AlertTypeMapping(
    private val clazz: Class<out AlertType>,
    val alertName: String,
) : IHasImplementation {
    PNO_LAN_WEIGHT_TOLERANCE_ALERT(
        clazz = PNOAndLANWeightToleranceAlert::class.java,
        alertName = "Tolérance 10% non respectée",
    ),
    THREE_MILES_TRAWLING_ALERT(
        clazz = ThreeMilesTrawlingAlert::class.java,
        alertName = "3 milles - Chaluts",
    ),
    FRENCH_EEZ_FISHING_ALERT(
        clazz = FrenchEEZFishingAlert::class.java,
        alertName = "Pêche en ZEE française par un navire tiers",
    ),
    TWELVE_MILES_FISHING_ALERT(
        clazz = TwelveMilesFishingAlert::class.java,
        alertName = "12 milles - Pêche sans droits historiques",
    ),
    BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT(
        clazz = BliBycatchMaxWeightExceededAlert::class.java,
        alertName = "R(UE) 1241 - Plus de 6 tonnes de lingue bleue (BLI) à bord",
    ),
    NEAFC_FISHING_ALERT(
        clazz = NeafcFishingAlert::class.java,
        alertName = "Alerte de pêche en zone CPANE (NEAFC)",
    ),
    RTC_FISHING_ALERT(
        clazz = RTCFishingAlert::class.java,
        alertName = "Pêche en zone RTC",
    ),
    MISSING_DEP_ALERT(
        clazz = MissingDEPAlert::class.java,
        alertName = "Sortie en mer sans émission de message \"DEP\"",
    ),
    MISSING_FAR_ALERT(
        clazz = MissingFARAlert::class.java,
        alertName = "Non-emission de message \"FAR\"",
    ),
    MISSING_FAR_48_HOURS_ALERT(
        clazz = MissingFAR48HoursAlert::class.java,
        alertName = "Non-emission de message \"FAR\" en 48h",
    ),
    SUSPICION_OF_UNDER_DECLARATION_ALERT(
        clazz = SuspicionOfUnderDeclarationAlert::class.java,
        alertName = "Suspicion de sous-déclaration",
    ),
    ;

    override fun getImplementation(): Class<out AlertType> = clazz
}
