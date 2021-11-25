package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class ThreeMilesTrawlingAlert (
        var speed: Double,
        var numberOfIncursion: Int
): AlertType(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
