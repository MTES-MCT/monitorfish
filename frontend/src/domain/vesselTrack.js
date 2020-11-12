export function getTrackColor(speed) {
    if (speed >= 0 && speed <= 3) {
        return '#05055E'
    } else if (speed > 3 && speed <= 6) {
        return '#C08416'
    } else {
        return '#3A9885'
    }
}

export function getTrackArrow(speed) {
    if (speed >= 0 && speed <= 3) {
        return 'arrow_blue.png'
    } else if (speed > 3 && speed <= 6) {
        return 'arrow_yellow.png'
    } else {
        return 'arrow_green.png'
    }
}