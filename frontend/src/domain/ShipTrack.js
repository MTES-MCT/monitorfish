export default function getTrackColor(randomSpeed) {
    if (randomSpeed >= 0 && randomSpeed <= 3) {
        return '#05125f'
    } else if (randomSpeed > 3 && randomSpeed <= 6) {
        return '#F7FF00'
    } else {
        return '#006b00'
    }
}