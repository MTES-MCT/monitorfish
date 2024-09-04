package fr.gouv.cnsp.monitorfish.domain.helpers

enum class Direction(val direction: String) {
    N("N"),
    S("S"),
    E("E"),
    W("W"),
}

fun degreeMinuteToDecimal(
    direction: String,
    degree: Int,
    minute: Int,
): Double {
    val maxDegree = 180
    val maxMinute = 59
    val secondsInMinute = 60
    val directionEnum = Direction.valueOf(direction)

    if (degree < 0 || degree > maxDegree) {
        throw IllegalArgumentException(
            "Degrees value $degree is not an integer between 0 and $maxDegree",
        )
    }
    if (minute < 0 || minute > maxMinute) {
        throw IllegalArgumentException(
            "Minute value $minute is not an integer between 0 and $maxMinute",
        )
    }

    var decimal: Double = (degree.toDouble() + (minute.toDouble() / secondsInMinute.toDouble()))

    if (directionEnum == Direction.S || directionEnum == Direction.W) decimal *= -1

    return decimal
}
