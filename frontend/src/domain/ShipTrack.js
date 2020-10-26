export default function getTrackColor(randomSpeed) {
    if (randomSpeed >= 0 && randomSpeed <= 3) {
        return '#00169F'
    } else if (randomSpeed > 3 && randomSpeed <= 6) {
        return '#F7FF00'
    } else {
        return '#006b00'
    }
}