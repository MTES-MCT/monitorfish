package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class ThreeMilesTrawlingAlert (
        var speed: Double,
        var numberOfIncursion: Int,
        var seaFront: String? = null,
        var flagState: String? = null
): AlertType(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
