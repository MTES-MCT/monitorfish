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
        alertName = "Chalutage dans les 3 milles",
    ),
    FRENCH_EEZ_FISHING_ALERT(
        clazz = FrenchEEZFishingAlert::class.java,
        alertName = "Pêche en ZEE française par un navire tiers",
    ),
    TWELVE_MILES_FISHING_ALERT(
        clazz = TwelveMilesFishingAlert::class.java,
        alertName = "Pêche dans les 12 milles sans droits historiques",
    ),
    BOTTOM_GEAR_VME_FISHING_ALERT(
        clazz = TwelveMilesFishingAlert::class.java,
        alertName = "Pêche en zone EMV avec un engin de fond à plus de 400m de profondeur",
    ),
    BOTTOM_TRAWL_800_METERS_FISHING_ALERT(
        clazz = TwelveMilesFishingAlert::class.java,
        alertName = "Chalutage de fond à plus de 800m de profondeur",
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
        alertName = "FAR manquant en 24h",
    ),
    MISSING_FAR_48_HOURS_ALERT(
        clazz = MissingFAR48HoursAlert::class.java,
        alertName = "FAR manquant en 48h",
    ),
    SUSPICION_OF_UNDER_DECLARATION_ALERT(
        clazz = SuspicionOfUnderDeclarationAlert::class.java,
        alertName = "Suspicion de sous-déclaration",
    ),
    ;

    override fun getImplementation(): Class<out AlertType> = clazz
}
